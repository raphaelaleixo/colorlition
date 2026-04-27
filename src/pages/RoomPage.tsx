import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useGame } from '../contexts/GameContext';
import { LobbyView } from '../components/room/LobbyView';
import { BigScreenView } from '../components/room/BigScreenView';
import { RoomNotFound } from '../components/shared/RoomNotFound';

export default function RoomPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { roomState, loading, loadRoom } = useGame();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRoom(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSubscribed(true);
  }, [id, loadRoom]);

  if (!hasSubscribed || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!roomState) return <RoomNotFound roomId={id} />;

  if (roomState.status === 'lobby') {
    return <LobbyView roomId={id} roomState={roomState} />;
  }

  return <BigScreenView roomId={id} roomState={roomState} />;
}
