import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
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
import { RoomHeader } from '../shared/RoomHeader';

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
      <RoomHeader
        slot={
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Room
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontWeight: 900, letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1, 'lnum' 1" }}
              >
                {roomId}
              </Typography>
            </Stack>
            <Box
              sx={{
                '& button': {
                  fontFamily: 'inherit',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'text.primary',
                  background: 'transparent',
                  border: '1px solid',
                  borderColor: 'rule.strong',
                  borderRadius: 0,
                  px: 1.5,
                  py: 0.75,
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease, color 120ms ease',
                  '&:hover': {
                    backgroundColor: 'text.primary',
                    color: 'background.default',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'text.primary',
                    outlineOffset: 2,
                  },
                },
              }}
            >
              <FullscreenToggle />
            </Box>
          </Stack>
        }
      />

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
