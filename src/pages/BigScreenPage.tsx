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

export default function BigScreenPage() {
  const { id } = useParams();
  const { gameState, loadRoom, roomState } = useGame();

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  if (!gameState || !roomState) return <Typography>Loading game…</Typography>;

  const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];
  const currentPlayer = roomState.players.find((p) => String(p.id) === currentPlayerId);

  const rows = gameState.turnOrder.map((pid) => ({
    playerId: pid,
    name: roomState.players.find((p) => String(p.id) === pid)?.name ?? `Player ${pid}`,
    base: gameState.playerState[pid]?.base ?? [],
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
        <Stack direction="row" spacing={4} sx={{ alignItems: 'baseline' }}>
          <Typography variant="h1">Color-lition</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Room
            </Typography>
            <Typography
              variant="h2"
              sx={{ letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1" }}
            >
              {id}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'baseline' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Round {gameState.roundNumber}
          </Typography>
          {gameState.exitPollDrawn && (
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>
              FINAL ROUND
            </Typography>
          )}
          <FullscreenToggle />
        </Stack>
      </Stack>
      <Typography variant="h3">
        {gameState.phase === 'ended'
          ? 'Game over'
          : `${currentPlayer?.name ?? currentPlayerId}'s turn`}
      </Typography>

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          overflow: 'hidden',
        }}
      >
        <Stack spacing={2} sx={{ minHeight: 0, overflow: 'hidden' }}>
          <VoterSegments segments={gameState.segments} />
        </Stack>
        <Stack spacing={2} sx={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Leaderboard rows={rows} />
        </Stack>
      </Box>

      {gameState.phase === 'ended' && gameState.scoreBreakdown && gameState.winnerIds && (
        <WinnerScreen
          breakdowns={gameState.scoreBreakdown}
          winnerIds={gameState.winnerIds}
          nameFor={(pid) =>
            roomState.players.find((p) => String(p.id) === pid)?.name ?? `Player ${pid}`
          }
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
