import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, type RouteObject } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { GameProvider } from './contexts/GameContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const HowToPlayPage = lazy(() => import('./pages/HowToPlayPage'));
const LobbyPage = lazy(() => import('./pages/LobbyPage'));
const BigScreenPage = lazy(() => import('./pages/BigScreenPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));

const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/how-to-play', element: <HowToPlayPage /> },
  { path: '/join', element: <JoinPage /> },
  { path: '/join/:id', element: <JoinPage /> },
  { path: '/room/:id', element: <LobbyPage /> },
  { path: '/room/:id/play', element: <BigScreenPage /> },
  { path: '/room/:id/player/:playerId', element: <PlayerPage /> },
];

if (import.meta.env.DEV) {
  const MockBigScreen = lazy(() => import('./pages/MockBigScreen'));
  routes.push({ path: '/mock/big-screen/:id', element: <MockBigScreen /> });
}

routes.push({ path: '*', element: <Navigate to="/" replace /> });

const router = createBrowserRouter(routes);

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GameProvider>
        <Suspense fallback={<RouteFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </GameProvider>
    </ThemeProvider>
  );
}
