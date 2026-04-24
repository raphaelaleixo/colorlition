import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Section } from '../shared/Section';
import type { Headline } from '../../game/types';

export function HeadlineFeed({ headlines }: { headlines: Headline[] }) {
  const newestFirst = headlines.slice().reverse();
  return (
    <Section heading="Headlines" dense sx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {newestFirst.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No headlines yet.
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Stack spacing={1}>
            {newestFirst.map((h, i) => (
              <Typography
                key={h.id}
                variant="h5"
                sx={{
                  color: i === 0 ? 'text.primary' : 'text.secondary',
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: 'rule.hair',
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                {h.text}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Section>
  );
}
