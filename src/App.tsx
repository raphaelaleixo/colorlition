import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, type RouteObject } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { GameProvider } from './contexts/GameContext';
import { PageTransition } from './components/shared/PageTransition';

const HomePage = lazy(() => import('./pages/HomePage'));
const HowToPlayPage = lazy(() => import('./pages/HowToPlayPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const RoomPage = lazy(() => import('./pages/RoomPage'));
const PlayerJoinPage = lazy(() => import('./pages/PlayerJoinPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));

const animated = (el: ReactNode): ReactNode => <PageTransition>{el}</PageTransition>;

const routes: RouteObject[] = [
  { path: '/', element: animated(<HomePage />) },
  { path: '/how-to-play', element: animated(<HowToPlayPage />) },
  { path: '/join', element: animated(<JoinPage />) },
  { path: '/room/:id', element: animated(<RoomPage />) },
  { path: '/room/:id/player', element: animated(<PlayerJoinPage />) },
  { path: '/room/:id/player/:playerId', element: animated(<PlayerPage />) },
];

if (import.meta.env.DEV) {
  const MockBigScreen = lazy(() => import('./pages/MockBigScreen'));
  routes.push({ path: '/mock/big-screen/:id', element: animated(<MockBigScreen />) });
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
