import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import BigScreenPage from './BigScreenPage';
import { GameContext, type GameContextValue } from '../contexts/GameContext';
import { buildMockGameContextValue, MOCK_GAME_STATE } from '../mocks/colorlitionFixture';
import {
  drawAndPlace as drawAndPlacePure,
  claim as claimPure,
  canPlaceInSegment,
  canClaimSegment,
  currentPlayerId,
} from '../game/actions';
import type { ColorlitionGameState } from '../game/types';

export default function MockBigScreen() {
  const [gameState, setGameState] = useState<ColorlitionGameState>(MOCK_GAME_STATE);

  const ctxValue = useMemo<GameContextValue>(() => {
    const base = buildMockGameContextValue(gameState);
    return {
      ...base,
      drawAndPlace: async (segmentKey) => {
        setGameState((prev) => drawAndPlacePure(prev, segmentKey));
      },
      claim: async (segmentKey) => {
        setGameState((prev) => claimPure(prev, segmentKey));
      },
    };
  }, [gameState]);

  const placeable = gameState.segments.find(canPlaceInSegment);
  const claimable = gameState.segments.find(canClaimSegment);
  const isEnded = gameState.phase === 'ended';
  const deckEmpty = gameState.deck.length === 0;

  function handlePlace() {
    if (!placeable || deckEmpty) return;
    setGameState((prev) => drawAndPlacePure(prev, placeable.key));
  }

  function handleClaim() {
    if (!claimable) return;
    setGameState((prev) => claimPure(prev, claimable.key));
  }

  // Demonstrates the "last claim ends the round" path: mark every other player
  // as already claimed so the current player's claim drains the round, which
  // triggers endRound() inside claim() → advanceTurn() → endRound().
  function handleEndRound() {
    setGameState((prev) => {
      let next = prev;
      // Make sure there's something on the table to claim.
      if (!next.segments.some(canClaimSegment)) {
        const target = next.segments.find(canPlaceInSegment);
        if (!target || next.deck.length === 0) return prev;
        next = drawAndPlacePure(next, target.key);
      }
      const cur = currentPlayerId(next);
      const forced: ColorlitionGameState = {
        ...next,
        playerState: Object.fromEntries(
          Object.entries(next.playerState).map(([pid, ps]) => [
            pid,
            pid === cur ? ps : { ...ps, roundStatus: 'claimed' as const },
          ]),
        ),
      };
      const seg = forced.segments.find(canClaimSegment);
      if (!seg) return prev;
      return claimPure(forced, seg.key);
    });
  }

  function handleReset() {
    setGameState(MOCK_GAME_STATE);
  }

  return (
    <GameContext.Provider value={ctxValue}>
      <BigScreenPage />
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: (t) => t.zIndex.tooltip + 1,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'rule.strong',
          p: 2,
          minWidth: 240,
          boxShadow: 4,
        }}
      >
        <Stack spacing={1.25}>
          <Typography
            variant="overline"
            sx={{ fontWeight: 700, letterSpacing: '0.12em' }}
          >
            Mock Controls
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Phase: {gameState.phase} · Round {gameState.roundNumber} · Deck{' '}
            {gameState.deck.length}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePlace}
            disabled={isEnded || !placeable || deckEmpty}
          >
            Draw & place (next turn)
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClaim}
            disabled={isEnded || !claimable}
          >
            Current player claims
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleEndRound}
            disabled={isEnded}
          >
            Claim last → end round
          </Button>
          <Button variant="text" size="small" onClick={handleReset}>
            Reset
          </Button>
        </Stack>
      </Box>
    </GameContext.Provider>
  );
}
