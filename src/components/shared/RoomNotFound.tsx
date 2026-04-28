import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useT } from '../../i18n';

interface RoomNotFoundProps {
  roomId?: string;
}

export function RoomNotFound({ roomId }: RoomNotFoundProps) {
  const t = useT();
  return (
    <Stack
      spacing={3}
      sx={{
        p: 6,
        maxWidth: 560,
        minHeight: '100dvh',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h2">{t('roomNotFound.title')}</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {roomId ? (
          <>
            {t('roomNotFound.bodyPrefix')}
            <Typography
              component="span"
              sx={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}
            >
              {roomId}
            </Typography>
            {t('roomNotFound.bodySuffix')}
          </>
        ) : (
          <>{t('roomNotFound.bodyNoCode')}</>
        )}
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        sx={{ alignSelf: 'flex-start', px: 4, py: 1.5 }}
      >
        {t('common.backToHome')}
      </Button>
    </Stack>
  );
}
