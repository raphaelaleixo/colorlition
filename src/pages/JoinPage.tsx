import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { RoomHeader } from '../components/shared/RoomHeader';
import { getRoomStatus } from '../utils/roomStatus';
import { useT } from '../i18n';

type SubmittingRole = 'host' | 'player' | null;

export default function JoinPage() {
  const navigate = useNavigate();
  const t = useT();
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
        setError(t('join.errorRoomNotFound'));
        return null;
      }
      return status;
    },
    [trimmed, t],
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
      <RoomHeader slot={null} />
      <Stack
        component="form"
        spacing={4}
        onSubmit={handleResumeAsHost}
        sx={{ pt: 4 }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h1">{t('join.title')}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('join.subtitle')}
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          label={t('join.codeLabel')}
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
            {submitting === 'host' ? t('join.cta.hostBusy') : t('join.cta.host')}
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={handleResumeAsPlayer}
            disabled={disabled}
            sx={{ color: 'text.secondary' }}
          >
            {submitting === 'player' ? t('join.cta.playerBusy') : t('join.cta.player')}
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
          title: t('hostWarning.title'),
          body: t('hostWarning.body'),
          confirmLabel: t('hostWarning.confirm'),
          cancelLabel: t('common.cancel'),
        }}
      />
    </Box>
  );
}
