import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import {
  PlayerSlotsGrid,
  buildPlayerUrl,
  type RoomState,
} from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { RoomNotFound } from '../components/shared/RoomNotFound';
import type { ColorlitionPlayerData } from '../game/types';

export default function PlayerJoinPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { roomState, loading, loadRoom } = useGame();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRoom(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSubscribed(true);
  }, [id, loadRoom]);

  if (!hasSubscribed || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!roomState) return <RoomNotFound roomId={id} />;

  if (roomState.status !== 'lobby') {
    return <RejoinView roomId={id} roomState={roomState} />;
  }

  return <NicknameJoinView roomId={id} />;
}

function NicknameJoinView({ roomId }: { roomId: string }) {
  const navigate = useNavigate();
  const { joinRoom } = useGame();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed) {
        setError('Enter your name');
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const slotId = await joinRoom(roomId, trimmed);
        navigate(`/room/${roomId}/player/${slotId}`, { replace: true });
      } catch (e) {
        setError((e as Error).message);
        setBusy(false);
      }
    },
    [joinRoom, name, navigate, roomId],
  );

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit}
      sx={{ p: 4, maxWidth: 480, minHeight: '100dvh', justifyContent: 'center' }}
    >
      <Stack spacing={1}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Room
        </Typography>
        <Typography variant="h2" sx={{ letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1" }}>
          {roomId}
        </Typography>
      </Stack>
      <Typography variant="h1">Join the coalition</Typography>
      <TextField
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        autoComplete="off"
        disabled={busy}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained" disabled={busy || !name.trim()} sx={{ alignSelf: 'flex-start', px: 4, py: 1.5 }}>
        {busy ? 'Joining…' : 'Join'}
      </Button>
    </Stack>
  );
}

interface RejoinViewProps {
  roomId: string;
  roomState: RoomState<ColorlitionPlayerData>;
}

function RejoinView({ roomId, roomState }: RejoinViewProps) {
  return (
    <Stack spacing={3} sx={{ p: 4, maxWidth: 480, minHeight: '100dvh', justifyContent: 'center' }}>
      <Stack spacing={1}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Room
        </Typography>
        <Typography variant="h2" sx={{ letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1" }}>
          {roomId}
        </Typography>
      </Stack>
      <Typography variant="h1">Tap your name</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        The game has started. Choose your spot to rejoin.
      </Typography>
      <PlayerSlotsGrid
        players={roomState.players}
        filterEmpty
        buildSlotHref={(slotId) => buildPlayerUrl(roomId, slotId)}
      />
      <Button component={RouterLink} to="/" variant="text" sx={{ alignSelf: 'flex-start' }}>
        Back to home
      </Button>
    </Stack>
  );
}
