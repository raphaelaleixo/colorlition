import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useT } from '../../i18n';

export function LobbyDateline() {
  const t = useT();
  return (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {t('lobby.dateline')}
      </Typography>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
    </Stack>
  );
}
