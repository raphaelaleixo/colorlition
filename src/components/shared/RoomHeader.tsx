import { type ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type Theme } from '@mui/material/styles';
import { Logo } from './Logo';

interface RoomHeaderProps {
  // Right-side content. Big screen passes the room code + fullscreen toggle;
  // player passes the seat overline. Whatever it is, it bottom-aligns with
  // the logo's baseline.
  slot: ReactNode;
}

// Shared masthead used by BigScreenView and PlayerPage. Logo is stacked on
// sm+ (TV/desktop/tablet) and inline on xs (phones), so the same component
// adapts without per-page variants.
export function RoomHeader({ slot }: RoomHeaderProps) {
  const isLarge = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  return (
    <Stack
      direction="row"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        backgroundColor: 'background.default',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'rule.ink',
      }}
    >
      {isLarge ? (
        <Logo layout="stacked" sx={{ fontSize: 36 }} />
      ) : (
        <Logo variant="h3" />
      )}
      {slot}
    </Stack>
  );
}
