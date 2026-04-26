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
        height: { xs: 'auto', lg: '100vh' },
        minHeight: '100vh',
        overflow: { xs: 'visible', lg: 'hidden' },
      }}
    >
      <Stack
        spacing={2}
        sx={{
          p: 4,
          flex: { xs: 'none', lg: '1 1 auto' },
          minHeight: 0,
          overflow: { xs: 'visible', lg: 'hidden' },
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
        <Typography variant="h1" sx={{ fontStyle: 'italic', fontWeight: 900 }}>colorlition</Typography>
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
      <Typography variant="h3">
        {gameState.phase === 'ended' ? 'Game over' : 'Voter Segments'}
      </Typography>

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gridTemplateRows: { xs: 'auto', lg: '1fr 300px' },
          columnGap: 3,
          rowGap: 2,
          overflow: 'hidden',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            minHeight: 0,
            overflow: 'hidden',
            gridColumn: { xs: '1', lg: '1' },
            gridRow: { xs: 'auto', lg: '1' },
          }}
        >
          <VoterSegments segments={gameState.segments} nameFor={nameFor} />
        </Stack>
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            minHeight: 0,
            gridColumn: { lg: '1' },
            gridRow: { lg: '2' },
          }}
        >
          <ScoreChart
            history={gameState.scoreHistory}
            playerOrder={gameState.turnOrder}
            nameFor={nameFor}
            colorFor={colorFor}
          />
        </Box>
        <Stack
          spacing={2}
          sx={{
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gridColumn: { xs: '1', lg: '2' },
            gridRow: { xs: 'auto', lg: '1 / -1' },
          }}
        >
          <Leaderboard rows={rows} />
        </Stack>
      </Box>

      {gameState.phase === 'ended' && gameState.scoreBreakdown && gameState.winnerIds && (
        <WinnerScreen
          breakdowns={gameState.scoreBreakdown}
          winnerIds={gameState.winnerIds}
          nameFor={nameFor}
        />
      )}
      </Stack>

      <HeadlineTicker
        lastHeadline={gameState.lastHeadline}
        currentPlayerName={currentPlayer?.name ?? currentPlayerId}
        currentPlayerIndex={gameState.currentPlayerIndex}
      />
    </Stack>
  );
}
