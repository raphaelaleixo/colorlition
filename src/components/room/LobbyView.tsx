import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  RoomQRCode,
  FullscreenToggle,
  buildJoinUrl,
  type RoomState,
} from 'react-gameroom';
import type { ColorlitionPlayerData } from '../../game/types';
import { useGame } from '../../contexts/GameContext';
import { RoomHeader } from '../shared/RoomHeader';
import { LobbyDateline } from '../lobby/LobbyDateline';
import { CandidateRoster } from '../lobby/CandidateRoster';
import { LaunchCampaignBar } from '../lobby/LaunchCampaignBar';

interface LobbyViewProps {
  roomId: string;
  roomState: RoomState<ColorlitionPlayerData>;
}

export function LobbyView({ roomId, roomState }: LobbyViewProps) {
  const { startTheGame } = useGame();

  const readyCount = roomState.players.filter((p) => p.status === 'ready').length;
  const canStart = readyCount >= roomState.config.minPlayers;

  return (
    <Stack spacing={3} sx={{ p: 4, pb: '120px' }}>
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

      <LobbyDateline />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'auto 1fr' },
          columnGap: 6,
          rowGap: 4,
          alignItems: 'start',
        }}
      >
        <Stack spacing={1.5} sx={{ alignItems: { xs: 'center', lg: 'flex-start' } }}>
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              width: 240,
              height: 240,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'rule.hair',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <RoomQRCode roomId={roomId} url={buildJoinUrl(roomId)} size={200} />
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              width: 400,
              height: 400,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'rule.hair',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <RoomQRCode roomId={roomId} url={buildJoinUrl(roomId)} size={260} />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: { xs: 'center', lg: 'left' }, fontStyle: 'normal' }}
          >
            Scan to join · or visit {window.location.origin}/join · room {roomId}
          </Typography>
        </Stack>
        <CandidateRoster players={roomState.players} />
      </Box>

      <LaunchCampaignBar
        readyCount={readyCount}
        maxCount={roomState.config.maxPlayers}
        canStart={canStart}
        onLaunch={() => startTheGame().catch(console.error)}
      />
    </Stack>
  );
}
