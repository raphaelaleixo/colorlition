import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface RoomNotFoundProps {
  roomId?: string;
}

export function RoomNotFound({ roomId }: RoomNotFoundProps) {
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
      <Typography variant="h2">Room not found</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {roomId ? (
          <>
            No game with code{' '}
            <Typography
              component="span"
              sx={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}
            >
              {roomId}
            </Typography>
            . Check the code on the host's screen.
          </>
        ) : (
          <>No game at this address. Check the code on the host's screen.</>
        )}
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        sx={{ alignSelf: 'flex-start', px: 4, py: 1.5 }}
      >
        Back to home
      </Button>
    </Stack>
  );
}
