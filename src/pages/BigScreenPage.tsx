import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FullscreenToggle } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { VoterSegments } from '../components/big-screen/VoterSegments';
import { DrawPile } from '../components/big-screen/DrawPile';
import { PublicCoalitions } from '../components/big-screen/PublicCoalitions';
import { Leaderboard } from '../components/big-screen/Leaderboard';

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
    <Stack spacing={2} sx={{ p: 4 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Color-lition — Round {gameState.roundNumber}</Typography>
        <FullscreenToggle />
      </Stack>
      {gameState.exitPollDrawn && (
        <Typography variant="h5" color="warning.main">FINAL ROUND</Typography>
      )}
      <Typography>
        {gameState.phase === 'ended'
          ? 'Game over'
          : `Turn: ${currentPlayer?.name ?? currentPlayerId}`}
      </Typography>
      <DrawPile remaining={gameState.deck.length} />
      <VoterSegments segments={gameState.segments} />
      <PublicCoalitions rows={rows} />
      <Leaderboard rows={rows} />
    </Stack>
  );
}
