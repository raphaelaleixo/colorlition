import { useCallback, useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { Spectrum } from '../components/shared/Spectrum';
import { getRoomStatus } from '../utils/roomStatus';

type SubmittingRole = 'host' | 'player' | null;

export default function JoinPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<SubmittingRole>(null);
  const [pendingHostCode, setPendingHostCode] = useState<string | null>(null);

  const trimmed = code.trim().toUpperCase();
  const disabled = submitting !== null || trimmed.length === 0;

  const resolveStatus = useCallback(
    async (role: SubmittingRole) => {
      setError(null);
      setSubmitting(role);
      const status = await getRoomStatus(trimmed);
      setSubmitting(null);
      if (status === null) {
        setError('Room not found. Check the code and try again.');
        return null;
      }
      return status;
    },
    [trimmed],
  );

  const handleResumeAsHost = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!trimmed) return;
      const status = await resolveStatus('host');
      if (status === null) return;
      if (isLikelyMobileHost()) {
        setPendingHostCode(trimmed);
        return;
      }
      navigate(`/room/${trimmed}`);
    },
    [trimmed, resolveStatus, navigate],
  );

  const handleResumeAsPlayer = useCallback(async () => {
    if (!trimmed) return;
    const status = await resolveStatus('player');
    if (status === null) return;
    navigate(`/room/${trimmed}/player`);
  }, [trimmed, resolveStatus, navigate]);

  return (
    <Box sx={{ p: { xs: 3, sm: 6 }, maxWidth: 560, mx: 'auto', minHeight: '100dvh' }}>
      <Spectrum sx={{ mx: { xs: -3, sm: -6 } }} />
      <Stack
        component="form"
        spacing={4}
        onSubmit={handleResumeAsHost}
        sx={{ pt: { xs: 4, sm: 6 } }}
      >
        <Stack spacing={1.5}>
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            variant="overline"
            sx={{ color: 'text.secondary' }}
          >
            ← Back
          </Link>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            The Newsdesk
          </Typography>
          <Typography variant="h1">Resume</Typography>
          <Divider sx={{ borderColor: 'rule.hair' }} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Enter the room code your friends shared to jump back in.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          label="Room code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          fullWidth
          slotProps={{
            htmlInput: {
              autoCapitalize: 'characters',
              autoComplete: 'off',
              maxLength: 8,
              style: {
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontSize: '1.5rem',
              },
            },
          }}
        />

        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled}
            sx={{ px: 4, py: 1.5 }}
          >
            {submitting === 'host' ? 'Resuming…' : 'Resume as host'}
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={handleResumeAsPlayer}
            disabled={disabled}
            sx={{ color: 'text.secondary' }}
          >
            {submitting === 'player' ? 'Resuming…' : 'Resume as player →'}
          </Button>
        </Stack>
      </Stack>

      <HostDeviceWarningModal
        open={pendingHostCode !== null}
        onConfirm={() => {
          const c = pendingHostCode;
          setPendingHostCode(null);
          if (c) navigate(`/room/${c}`);
        }}
        onCancel={() => setPendingHostCode(null)}
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
