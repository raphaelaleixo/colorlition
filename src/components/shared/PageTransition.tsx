import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

// Wraps a route's element so each navigation triggers a 280ms fade + slight
// slide-up. `key={location.pathname}` forces a fresh mount on every pathname
// change so the CSS animation replays. No fill-mode, so the element returns
// to its natural transform after the animation — fixed/sticky descendants
// behave normally once the animation completes.
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <Box
      key={location.pathname}
      sx={{
        '@keyframes pageEnter': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        animation: 'pageEnter 280ms ease-out',
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      {children}
    </Box>
  );
}
