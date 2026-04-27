import { useCallback, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
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
    <Stack spacing={4} sx={{ p: 6, alignItems: 'flex-start', maxWidth: 640 }}>
      <Typography variant="h1">Color-lition</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Create a new game. Players join by scanning the QR code on the next screen.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCreate} disabled={busy} sx={{ px: 4, py: 1.5 }}>
        {busy ? 'Creating…' : 'Create Game'}
      </Button>
      <Link
        component={RouterLink}
        to="/how-to-play"
        underline="hover"
        sx={{ color: 'text.secondary' }}
      >
        How to play →
      </Link>
    </Stack>
  );
}
