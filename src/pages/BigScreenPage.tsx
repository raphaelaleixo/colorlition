import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FullscreenToggle } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { VoterSegments } from '../components/big-screen/VoterSegments';
import { HeadlineTicker } from '../components/big-screen/HeadlineTicker';
import { Leaderboard } from '../components/big-screen/Leaderboard';
import { WinnerScreen } from '../components/big-screen/WinnerScreen';
import { ScoreChart } from '../components/big-screen/ScoreChart';
import { PALETTE, PLAYER_LINE_PALETTE } from '../theme/colors';

export default function BigScreenPage() {
  const { id } = useParams();
  const { gameState, loadRoom, roomState } = useGame();

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  if (!gameState || !roomState) return <Typography>Loading game…</Typography>;

  const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];
  const currentPlayer = roomState.players.find((p) => String(p.id) === currentPlayerId);
  const nameFor = (pid: string) =>
    roomState.players.find((p) => String(p.id) === pid)?.name ?? `Player ${pid}`;

  const colorFor = (pid: string, idx: number): string => {
    const starter = gameState.playerState[pid]?.base[0];
    if (starter && starter.kind === 'bloc') return PALETTE[starter.color];
    return PLAYER_LINE_PALETTE[idx % PLAYER_LINE_PALETTE.length];
  };

  const rows = gameState.turnOrder.map((pid) => ({
    playerId: pid,
    name: roomState.players.find((p) => String(p.id) === pid)?.name ?? `Player ${pid}`,
    base: gameState.playerState[pid]?.base ?? [],
    roundStatus: gameState.playerState[pid]?.roundStatus ?? 'active',
    isCurrent: pid === currentPlayerId,
  }));

  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pb: '80px',
      }}
    >
      <Stack
        spacing={5}
        sx={{
          p: 4,
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
      <Stack
        direction="row"
        sx={{
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 3,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'rule.ink',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontStyle: 'italic',
            fontWeight: 900,
            '@keyframes colorlitionHue': {
              '0%':     { color: PALETTE.red },
              '14.28%': { color: PALETTE.purple },
              '28.57%': { color: PALETTE.green },
              '42.85%': { color: PALETTE.blue },
              '57.14%': { color: PALETTE.orange },
              '71.42%': { color: PALETTE.yellow },
              '85.71%': { color: PALETTE.grey },
              '100%':   { color: PALETTE.red },
            },
          }}
        >
          {'color'.split('').map((ch, i) => (
            <Box
              key={i}
              component="span"
              sx={{
                animationName: 'colorlitionHue',
                animationDuration: '14s',
                animationTimingFunction: 'steps(1, end)',
                animationIterationCount: 'infinite',
                animationDelay: `${-2 * i}s`,
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  color: PALETTE.red,
                },
              }}
            >
              {ch}
            </Box>
          ))}
          lition
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Room
            </Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 900, letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1, 'lnum' 1" }}
            >
              {id}
            </Typography>
          </Stack>
          <Box
            sx={{
              '& button': {
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'text.primary',
                background: 'transparent',
                border: '1px solid',
                borderColor: 'rule.strong',
                borderRadius: 0,
                px: 1.5,
                py: 0.75,
                cursor: 'pointer',
                transition: 'background-color 120ms ease, color 120ms ease',
                '&:hover': {
                  backgroundColor: 'text.primary',
                  color: 'background.default',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'text.primary',
                  outlineOffset: 2,
                },
              },
            }}
          >
            <FullscreenToggle />
          </Box>
        </Stack>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gridTemplateRows: { xs: 'auto', lg: 'auto auto' },
          columnGap: 3,
          rowGap: 5,
        }}
      >
        {(() => {
          const isEnded =
            gameState.phase === 'ended' && !!gameState.scoreBreakdown && !!gameState.winnerIds;
          const fadeOutSx = isEnded
            ? {
                '@keyframes endGameFadeOut': {
                  from: { opacity: 1 },
                  to: { opacity: 0 },
                },
                animation: 'endGameFadeOut 360ms ease-out both',
                pointerEvents: 'none' as const,
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  opacity: 0,
                },
              }
            : null;
          return (
            <>
              <Stack
                spacing={2}
                sx={{
                  gridColumn: { xs: '1', lg: '1' },
                  gridRow: { lg: '1' },
                  ...fadeOutSx,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    Voter Segments
                  </Typography>
                  <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
                </Stack>
                <VoterSegments segments={gameState.segments} nameFor={nameFor} />
              </Stack>
              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  flexDirection: 'column',
                  height: 360,
                  gridColumn: { lg: '1' },
                  gridRow: { lg: '2' },
                  ...fadeOutSx,
                }}
              >
                <ScoreChart
                  history={gameState.scoreHistory}
                  playerOrder={gameState.turnOrder}
                  nameFor={nameFor}
                  colorFor={colorFor}
                />
              </Box>
              {isEnded && (
                <Box
                  sx={{
                    gridColumn: { xs: '1', lg: '1' },
                    gridRow: { lg: '1 / -1' },
                    alignSelf: 'start',
                    overflow: 'hidden',
                    '@keyframes endScreenSlideUp': {
                      from: { transform: 'translateY(100%)', opacity: 0 },
                      to: { transform: 'translateY(0)', opacity: 1 },
                    },
                    '& > *': {
                      animation: 'endScreenSlideUp 480ms cubic-bezier(0.22, 1, 0.36, 1) both',
                      '@media (prefers-reduced-motion: reduce)': {
                        animation: 'none',
                      },
                    },
                  }}
                >
                  <WinnerScreen
                    breakdowns={gameState.scoreBreakdown!}
                    winnerIds={gameState.winnerIds!}
                    nameFor={nameFor}
                  />
                </Box>
              )}
            </>
          );
        })()}
        <Stack
          spacing={2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gridColumn: { xs: '1', lg: '2' },
            gridRow: { lg: '1 / -1' },
          }}
        >
          <Leaderboard rows={rows} />
        </Stack>
      </Box>
      </Stack>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar,
        }}
      >
        <HeadlineTicker
          lastHeadline={gameState.lastHeadline}
          currentPlayerName={currentPlayer?.name ?? currentPlayerId}
          currentPlayerIndex={gameState.currentPlayerIndex}
        />
      </Box>
    </Stack>
  );
}
