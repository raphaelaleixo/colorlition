import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGame } from '../contexts/GameContext';
import { CoalitionBase } from '../components/mobile/CoalitionBase';
import { SegmentsReadonly } from '../components/mobile/SegmentsReadonly';
import { WaitingView } from '../components/mobile/WaitingView';

export default function PlayerPage() {
  const { id, playerId } = useParams();
  const { roomState, gameState, loadRoom } = useGame();

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  if (!id || !playerId) return <Typography>Missing room or player id.</Typography>;
  if (!roomState) return <Typography>Loading…</Typography>;

  const myName = roomState.players.find((p) => String(p.id) === playerId)?.name ?? `Player ${playerId}`;

  if (!gameState) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="h5">{myName}</Typography>
        <WaitingView message="Waiting for the host to start the game…" />
      </Stack>
    );
  }

  const isMyTurn =
    gameState.turnOrder[gameState.currentPlayerIndex] === playerId &&
    (gameState.phase === 'turn' || gameState.phase === 'finalRound');
  const myBase = gameState.playerState[playerId]?.base ?? [];
  const myRoundStatus = gameState.playerState[playerId]?.roundStatus ?? 'active';

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5">{myName}</Typography>
      <Typography>
        {gameState.phase === 'ended'
          ? 'Game over.'
          : isMyTurn
          ? 'Your turn.'
          : myRoundStatus === 'claimed'
          ? 'You claimed this round. Waiting…'
          : `Waiting for ${
              roomState.players.find(
                (p) => String(p.id) === gameState.turnOrder[gameState.currentPlayerIndex],
              )?.name ?? 'opponent'
            }…`}
      </Typography>
      {gameState.exitPollDrawn && (
        <Typography variant="h6" color="warning.main">FINAL ROUND</Typography>
      )}
      <CoalitionBase base={myBase} />
      <SegmentsReadonly segments={gameState.segments} />
      {/* TurnActions arrives in the next task */}
    </Stack>
  );
}
