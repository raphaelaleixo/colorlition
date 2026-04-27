import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {
  PlayerSlotsGrid,
  RoomQRCode,
  FullscreenToggle,
  buildPlayerUrl,
  buildJoinUrl,
  type RoomState,
} from 'react-gameroom';
import type { ColorlitionPlayerData } from '../../game/types';
import { useGame } from '../../contexts/GameContext';

interface LobbyViewProps {
  roomId: string;
  roomState: RoomState<ColorlitionPlayerData>;
}

export function LobbyView({ roomId, roomState }: LobbyViewProps) {
  const { startTheGame } = useGame();

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
              {roomId}
            </Typography>
          </Stack>
        </Stack>
        <FullscreenToggle />
      </Stack>

      <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start' }}>
        <RoomQRCode roomId={roomId} url={buildJoinUrl(roomId)} />
        <Stack spacing={1}>
          <Typography variant="h6">Players</Typography>
          <PlayerSlotsGrid
            players={roomState.players}
            buildSlotHref={(slotId) => buildPlayerUrl(roomId, slotId)}
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
