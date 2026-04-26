import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import BigScreenPage from './BigScreenPage';
import { GameContext, type GameContextValue } from '../contexts/GameContext';
import { RevealControlContext } from '../components/big-screen/VoterSegments';
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
  const [revealAdvanceTick, setRevealAdvanceTick] = useState(0);
  const revealControl = useMemo(
    () => ({ advanceTick: revealAdvanceTick }),
    [revealAdvanceTick],
  );

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

  // Draw a specific card kind by hoisting it to the front of the deck so the
  // pure drawAndPlace logic picks it up next.
  function handleDrawSpecific(kind: 'pivot' | 'grant') {
    setGameState((prev) => {
      const idx = prev.deck.findIndex((c) => c.kind === kind);
      if (idx === -1) return prev;
      const target = prev.segments.find(canPlaceInSegment);
      if (!target) return prev;
      const reordered: ColorlitionGameState = {
        ...prev,
        deck: [
          prev.deck[idx],
          ...prev.deck.slice(0, idx),
          ...prev.deck.slice(idx + 1),
        ],
      };
      return drawAndPlacePure(reordered, target.key);
    });
  }
  const hasPivotInDeck = gameState.deck.some((c) => c.kind === 'pivot');
  const hasGrantInDeck = gameState.deck.some((c) => c.kind === 'grant');

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
      <RevealControlContext.Provider value={revealControl}>
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
            onClick={() => handleDrawSpecific('pivot')}
            disabled={isEnded || !placeable || !hasPivotInDeck}
          >
            Draw pivot
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleDrawSpecific('grant')}
            disabled={isEnded || !placeable || !hasGrantInDeck}
          >
            Draw grant
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
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            onClick={() => setRevealAdvanceTick((n) => n + 1)}
          >
            Advance reveal
          </Button>
          <Button variant="text" size="small" onClick={handleReset}>
            Reset
          </Button>
        </Stack>
      </Box>
      </RevealControlContext.Provider>
    </GameContext.Provider>
  );
}
