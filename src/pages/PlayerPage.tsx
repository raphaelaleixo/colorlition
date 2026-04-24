import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useGame } from '../contexts/GameContext';
import { CoalitionBase } from '../components/mobile/CoalitionBase';
import { SegmentsReadonly } from '../components/mobile/SegmentsReadonly';
import { WaitingView } from '../components/mobile/WaitingView';
import { TurnActions } from '../components/mobile/TurnActions';

export default function PlayerPage() {
  const { id, playerId } = useParams();
  const { roomState, gameState, loadRoom, claimSlot } = useGame();
  const [nameInput, setNameInput] = useState('');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  const handleClaim = useCallback(async () => {
    if (!id || !playerId) return;
    const slotId = Number(playerId);
    if (!Number.isFinite(slotId)) {
      setClaimError('Invalid slot id');
      return;
    }
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setClaimError('Enter your name');
      return;
    }
    setBusy(true);
    setClaimError(null);
    try {
      await claimSlot(id, slotId, trimmed);
    } catch (e) {
      setClaimError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [id, playerId, nameInput, claimSlot]);

  if (!id || !playerId) return <Typography>Missing room or player id.</Typography>;
  if (!roomState) return <Typography>Loading…</Typography>;

  const mySlot = roomState.players.find((p) => String(p.id) === playerId);
  if (!mySlot) return <Typography>Invalid player slot.</Typography>;

  // Slot not yet claimed → show name entry.
  if (mySlot.status === 'empty') {
    return (
      <Stack spacing={2} sx={{ p: 2, maxWidth: 480 }}>
        <Typography variant="h5">Join Room {id}</Typography>
        <Typography>You're claiming Slot {playerId}. Enter your name:</Typography>
        <TextField
          label="Your Name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          disabled={busy}
          autoFocus
        />
        {claimError && <Typography color="error">{claimError}</Typography>}
        <Button variant="contained" onClick={handleClaim} disabled={busy}>
          {busy ? 'Joining…' : 'Join'}
        </Button>
      </Stack>
    );
  }

  const myName = mySlot.name ?? `Player ${playerId}`;

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

  if (gameState.phase === 'ended') {
    const didWin = gameState.winnerIds?.includes(playerId) ?? false;
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="h5">{myName}</Typography>
        <Typography variant="h4" color={didWin ? 'success.main' : 'text.primary'}>
          {didWin ? 'You won!' : 'Game over'}
        </Typography>
        <CoalitionBase base={myBase} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5">{myName}</Typography>
      <Typography>
        {isMyTurn
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
      {isMyTurn && <TurnActions gameState={gameState} />}
    </Stack>
  );
}
