import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Ludoratory } from './Ludoratory';

export function PageFooter() {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'center', color: 'text.secondary', pt: 3, pb: 4 }}
    >
      <Ludoratory size={28} sx={{ flex: 'none', color: 'text.secondary' }} />
      <Stack spacing={0.25}>
        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          Made by{' '}
          <Link
            href="https://aleixo.me"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit' }}
          >
            Raphael Aleixo / Ludoratory
          </Link>
          .
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          Licensed under{' '}
          <Link
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit' }}
          >
            CC BY-NC-SA 4.0
          </Link>
          .
        </Typography>
      </Stack>
    </Stack>
  );
}
