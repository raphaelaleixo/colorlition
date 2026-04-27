import { useCallback, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { FONT_SANS } from '../theme/typography';
import { Logo } from '../components/shared/Logo';
import { Spectrum } from '../components/shared/Spectrum';
import { PageFooter } from '../components/shared/PageFooter';

export default function HomePage() {
  const { createRoom } = useGame();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [hostWarningOpen, setHostWarningOpen] = useState(false);

  const create = useCallback(async () => {
    setBusy(true);
    try {
      const roomId = await createRoom();
      navigate(`/room/${roomId}`);
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }, [createRoom, navigate]);

  const handleCreateClick = useCallback(() => {
    if (isLikelyMobileHost()) {
      setHostWarningOpen(true);
      return;
    }
    void create();
  }, [create]);

  return (
    <Box
      sx={{
        p: { xs: 3, sm: 6 },
        maxWidth: 760,
        mx: 'auto',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Spectrum sx={{ mx: { xs: -3, sm: -6 } }} />
      <Stack spacing={4} sx={{ flex: 1, pt: { xs: 4, sm: 6 } }}>
        <Stack spacing={3}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Issue 2026.04 · The Coalition Question
          </Typography>
          <Logo layout="stacked" sx={{ fontSize: { xs: 60, sm: 88 } }} />
          <Divider sx={{ borderColor: 'rule.hair' }} />
          <Typography
            variant="h5"
            sx={{
              fontFamily: FONT_SANS,
              fontStyle: 'italic',
              fontWeight: 400,
              maxWidth: 520,
              color: 'text.primary',
            }}
          >
            <Box component="span" sx={{ fontWeight: 700 }}>
              Build a coalition. Mind the contradictions.
            </Box>{' '}
            A real-time card draft for 3 to 5 players, dressed up as 2026 politics.
          </Typography>
          <Box sx={{ pt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateClick}
              disabled={busy}
              sx={{ px: 4, py: 1.5 }}
            >
              {busy ? 'Creating…' : 'Create Game'}
            </Button>
          </Box>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Link
              component={RouterLink}
              to="/join"
              underline="hover"
              sx={{ color: 'text.secondary' }}
            >
              Join with code →
            </Link>
            <Link
              component={RouterLink}
              to="/how-to-play"
              underline="hover"
              sx={{ color: 'text.secondary' }}
            >
              How to play →
            </Link>
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <PageFooter />
      </Stack>

      <HostDeviceWarningModal
        open={hostWarningOpen}
        onConfirm={() => {
          setHostWarningOpen(false);
          void create();
        }}
        onCancel={() => setHostWarningOpen(false)}
        labels={{
          title: 'Heads up',
          body: "You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet.",
          confirmLabel: 'Host anyway',
          cancelLabel: 'Cancel',
        }}
      />
    </Box>
  );
}
