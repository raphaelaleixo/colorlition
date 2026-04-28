import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

let hasMountedOnce = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const animate = hasMountedOnce;
  hasMountedOnce = true;
  return (
    <Box
      key={location.pathname}
      sx={{
        '@keyframes pageEnter': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        animation: animate ? 'pageEnter 280ms ease-out' : 'none',
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      {children}
    </Box>
  );
}
