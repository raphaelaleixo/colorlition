import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { BigScreenView } from '../components/room/BigScreenView';
import { GameContext, type GameContextValue } from '../contexts/GameContext';
import { RevealControlContext } from '../components/big-screen/revealControl';
import {
  buildMockGameContextValue,
  MOCK_GAME_STATE,
  MOCK_ROOM_STATE,
} from '../mocks/colorlitionFixture';
import {
  drawCard as drawCardPure,
  placePendingDraw as placePendingDrawPure,
  claim as claimPure,
  enterRoundEnd as enterRoundEndPure,
  commitRoundEnd as commitRoundEndPure,
  canPlaceInSegment,
  canClaimSegment,
} from '../game/actions';
import { currentPlayerId as currentPlayerIdOf } from '../game/actions';
import { useT } from '../i18n';
import type { ColorlitionGameState } from '../game/types';

// Convenience for the dev panel: combine draw + place atomically so a single
// click still produces a complete turn (mirrors the old drawAndPlace).
function drawAndPlaceCombined(
  state: ColorlitionGameState,
  segmentKey: ColorlitionGameState['segments'][number]['key'],
): ColorlitionGameState {
  const drawn = drawCardPure(state);
  if (!drawn.pendingDraw) return drawn; // exit poll consumed last card
  return placePendingDrawPure(drawn, segmentKey);
}

export default function MockBigScreen() {
  const t = useT();
  const [gameState, setGameState] = useState<ColorlitionGameState>(MOCK_GAME_STATE);
  const [revealAdvanceTick, setRevealAdvanceTick] = useState(0);
  const [minimized, setMinimized] = useState(false);

  const revealControl = useMemo(
    () => ({ advanceTick: revealAdvanceTick }),
    [revealAdvanceTick],
  );

  const ctxValue = useMemo<GameContextValue>(() => {
    const base = buildMockGameContextValue(gameState);
    return {
      ...base,
      drawCard: async () => {
        setGameState((prev) => drawCardPure(prev));
      },
      placePendingDraw: async (segmentKey) => {
        setGameState((prev) => placePendingDrawPure(prev, segmentKey));
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
    setGameState((prev) => drawAndPlaceCombined(prev, placeable.key));
  }

  // Draw a specific card kind by hoisting it to the front of the deck so the
  // pure drawAndPlace logic picks it up next.
  function handleDrawSpecific(kind: 'pivot' | 'grant' | 'exitPoll') {
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
      return drawAndPlaceCombined(reordered, target.key);
    });
  }

  const hasPivotInDeck = gameState.deck.some((c) => c.kind === 'pivot');
  const hasGrantInDeck = gameState.deck.some((c) => c.kind === 'grant');
  const hasExitPollInDeck = gameState.deck.some((c) => c.kind === 'exitPoll');

  function handleClaim() {
    if (!claimable) return;
    setGameState((prev) => claimPure(prev, claimable.key));
  }

  // Demonstrates the "last claim ends the round" path: mark every other player
  // as already claimed so the current player's claim drains the round, which
  // triggers enterRoundEnd() inside claim() → advanceTurn() → enterRoundEnd();
  // the effect below then commits the reset after the hold.
  function handleEndRound() {
    setGameState((prev) => {
      let next = prev;
      // Make sure there's something on the table to claim.
      if (!next.segments.some(canClaimSegment)) {
        const target = next.segments.find(canPlaceInSegment);
        if (!target || next.deck.length === 0) return prev;
        next = drawAndPlaceCombined(next, target.key);
      }
      const cur = currentPlayerIdOf(next);
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

  // Short-circuits to the ended phase: flip exitPollDrawn and enter the
  // round-end pause so the segment animation plays once before scoring.
  function handleEndGame() {
    setGameState((prev) => enterRoundEndPure({ ...prev, exitPollDrawn: true }));
  }

  // Mirror GameContext: while phase is 'roundEnd', hold the claimed tableau
  // briefly then commit the reset. Local state, no Firebase round-trip.
  useEffect(() => {
    if (gameState.phase !== 'roundEnd') return;
    const t = setTimeout(() => {
      setGameState((prev) =>
        prev.phase === 'roundEnd' ? commitRoundEndPure(prev) : prev,
      );
    }, 2400);
    return () => clearTimeout(t);
  }, [gameState.phase]);

  function handleReset() {
    setGameState(MOCK_GAME_STATE);
  }

  return (
    <GameContext.Provider value={ctxValue}>
      <RevealControlContext.Provider value={revealControl}>
        <BigScreenView roomId="MOCK" roomState={MOCK_ROOM_STATE} />
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
            minWidth: minimized ? 0 : 240,
            boxShadow: 4,
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, letterSpacing: '0.12em' }}
              >
                {t('mock.controls')}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setMinimized((m) => !m)}
                aria-label={minimized ? t('mock.expand') : t('mock.minimize')}
                sx={{ ml: 1, fontSize: 14, lineHeight: 1, fontWeight: 700 }}
              >
                {minimized ? '+' : '−'}
              </IconButton>
            </Stack>
            {!minimized && (
              <>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('mock.phaseInfo', {
                    phase: gameState.phase,
                    round: gameState.roundNumber,
                    deck: gameState.deck.length,
                  })}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePlace}
                  disabled={isEnded || !placeable || deckEmpty}
                >
                  {t('mock.drawAndPlace')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleDrawSpecific('pivot')}
                  disabled={isEnded || !placeable || !hasPivotInDeck}
                >
                  {t('mock.drawPivot')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleDrawSpecific('grant')}
                  disabled={isEnded || !placeable || !hasGrantInDeck}
                >
                  {t('mock.drawGrant')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleDrawSpecific('exitPoll')}
                  disabled={isEnded || !placeable || !hasExitPollInDeck}
                >
                  {t('mock.drawExitPoll')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClaim}
                  disabled={isEnded || !claimable}
                >
                  {t('mock.claim')}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleEndRound}
                  disabled={isEnded}
                >
                  {t('mock.endRound')}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={handleEndGame}
                  disabled={isEnded}
                >
                  {t('mock.endGame')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => setRevealAdvanceTick((n) => n + 1)}
                >
                  {t('mock.advanceReveal')}
                </Button>
                <Button variant="text" size="small" onClick={handleReset}>
                  {t('mock.reset')}
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </RevealControlContext.Provider>
    </GameContext.Provider>
  );
}
