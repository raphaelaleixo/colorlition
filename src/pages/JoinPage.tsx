import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useGame } from '../contexts/GameContext';

export default function JoinPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinRoom, loadRoom, roomState } = useGame();
  const [roomIdInput, setRoomIdInput] = useState(id ?? '');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  const handleJoin = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const finalRoomId = (id ?? roomIdInput).trim();
      if (!finalRoomId) throw new Error('Enter a room id');
      if (!name.trim()) throw new Error('Enter your name');
      const slotId = await joinRoom(finalRoomId, name.trim());
      navigate(`/room/${finalRoomId}/player/${slotId}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }, [id, roomIdInput, name, joinRoom, navigate]);

  return (
    <Stack spacing={2} sx={{ p: 4, maxWidth: 480 }}>
      <Typography variant="h2">Join Game</Typography>
      {!id && (
        <TextField
          label="Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
        />
      )}
      {id && roomState && <Typography>Joining room {id}</Typography>}
      <TextField
        label="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={handleJoin} disabled={busy}>
        {busy ? 'Joining…' : 'Join'}
      </Button>
    </Stack>
  );
}
