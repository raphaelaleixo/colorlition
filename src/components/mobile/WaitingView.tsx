import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Section } from '../shared/Section';

export function WaitingView({ message }: { message: string }) {
  return (
    <Section dense>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {message}
      </Typography>
      <Stack />
    </Section>
  );
}
