import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { type RoomState } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { RoomNotFound } from '../components/shared/RoomNotFound';
import { RoomHeader } from '../components/shared/RoomHeader';
import type { ColorlitionPlayerData } from '../game/types';

function roomSlot(roomId: string) {
  return (
    <Typography
      variant="overline"
      sx={{
        color: 'text.secondary',
        fontFeatureSettings: "'tnum' 1",
        '&.MuiTypography-overline': {
          fontSize: 14,
          letterSpacing: '0.12em',
          lineHeight: 1.1,
        },
      }}
    >
      Room {roomId}
    </Typography>
  );
}

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
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      <RoomHeader slot={roomSlot(roomId)} />
      <Stack
        component="form"
        spacing={3}
        onSubmit={handleSubmit}
        sx={{ pt: 4 }}
      >
        <Typography variant="h3">File your candidacy</Typography>
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
    </Box>
  );
}

interface RejoinViewProps {
  roomId: string;
  roomState: RoomState<ColorlitionPlayerData>;
}

function RejoinView({ roomId, roomState }: RejoinViewProps) {
  const filledSlots = roomState.players.filter((p) => p.status !== 'empty');
  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      <RoomHeader slot={roomSlot(roomId)} />
      <Stack spacing={3} sx={{ pt: 4 }}>
        <Typography variant="h3">Tap your name</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          The game has started. Choose your spot to rejoin.
        </Typography>
        <Stack spacing={1.5}>
          {filledSlots.map((slot) => (
            <Box
              key={slot.id}
              component={RouterLink}
              to={`/room/${roomId}/player/${slot.id}`}
              sx={{
                display: 'block',
                p: 2,
                minHeight: 72,
                border: '1px solid',
                borderColor: 'rule.strong',
                bgcolor: 'background.paper',
                color: 'text.primary',
                textDecoration: 'none',
                transition: 'background-color 120ms ease, color 120ms ease',
                '&:hover, &:focus-visible': {
                  backgroundColor: 'text.primary',
                  color: 'background.default',
                  outline: 'none',
                },
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="overline" sx={{ color: 'inherit', opacity: 0.7 }}>
                  {slot.status === 'ready' ? 'Ready' : 'Filed'}
                </Typography>
                <Typography variant="h4" sx={{ color: 'inherit' }}>
                  {slot.name ?? `Candidate ${slot.id}`}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Button component={RouterLink} to="/" variant="text" sx={{ alignSelf: 'flex-start' }}>
          Back to home
        </Button>
      </Stack>
    </Box>
  );
}
