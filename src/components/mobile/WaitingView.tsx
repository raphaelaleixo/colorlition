import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function WaitingView({ message }: { message: string }) {
  return (
    <Stack sx={{ p: 2, border: '1px dashed #ccc' }}>
      <Typography>{message}</Typography>
    </Stack>
  );
}
