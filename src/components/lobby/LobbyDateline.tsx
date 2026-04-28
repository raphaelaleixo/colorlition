import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const DATELINE = 'CAMPAIGN 2026 · DAY ZERO · CANDIDATES CONVENING';

export function LobbyDateline() {
  return (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {DATELINE}
      </Typography>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
    </Stack>
  );
}
