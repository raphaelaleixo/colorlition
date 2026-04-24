import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useGame } from '../contexts/GameContext';

export default function HomePage() {
  const { createRoom } = useGame();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleCreate = useCallback(async () => {
    setBusy(true);
    try {
      const roomId = await createRoom();
      navigate(`/room/${roomId}`);
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }, [createRoom, navigate]);

  return (
    <Stack spacing={2} sx={{ p: 4, alignItems: 'flex-start' }}>
      <Typography variant="h3">Color-lition</Typography>
      <Typography>Create a new game. Players join by scanning the QR code on the next screen.</Typography>
      <Button variant="contained" onClick={handleCreate} disabled={busy}>
        {busy ? 'Creating…' : 'Create Game'}
      </Button>
    </Stack>
  );
}
