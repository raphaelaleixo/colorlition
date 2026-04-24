import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Headline } from '../../game/types';

export function HeadlineFeed({ headlines }: { headlines: Headline[] }) {
  const newestFirst = headlines.slice().reverse();
  return (
    <Stack spacing={1} sx={{ p: 1, border: '1px solid #ccc' }}>
      <Typography variant="h6">Headlines</Typography>
      {newestFirst.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No headlines yet.
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {newestFirst.map((h) => (
            <Typography key={h.id} variant="body2">
              {h.text}
            </Typography>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
