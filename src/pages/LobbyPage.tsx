import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {
  PlayerSlotsGrid,
  RoomQRCode,
  FullscreenToggle,
  buildPlayerUrl,
} from 'react-gameroom';
import { useGame } from '../contexts/GameContext';

export default function LobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roomState, loadRoom, startTheGame } = useGame();

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  useEffect(() => {
    if (roomState?.status === 'started' && id) {
      navigate(`/room/${id}/play`);
    }
  }, [roomState?.status, id, navigate]);

  if (!id) return <Typography>Missing room id.</Typography>;
  if (!roomState) return <Typography>Loading room…</Typography>;

  const readyCount = roomState.players.filter((p) => p.status === 'ready').length;
  const canStart = readyCount >= roomState.config.minPlayers;

  return (
    <Stack spacing={3} sx={{ p: 4 }}>
      <Stack
        direction="row"
        spacing={3}
        sx={{
          alignItems: 'baseline',
          justifyContent: 'space-between',
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
        <FullscreenToggle />
      </Stack>

      <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start' }}>
        <RoomQRCode roomId={id} />
        <Stack spacing={1}>
          <Typography variant="h6">Players</Typography>
          <PlayerSlotsGrid
            players={roomState.players}
            buildSlotHref={(slotId) => buildPlayerUrl(id, slotId)}
          />
        </Stack>
      </Stack>

      <Button
        variant="contained"
        onClick={() => startTheGame().catch(console.error)}
        disabled={!canStart}
      >
        Start Game ({readyCount}/{roomState.config.maxPlayers})
      </Button>
    </Stack>
  );
}
