/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  ref,
  set,
  onValue,
  get,
  type Unsubscribe,
} from 'firebase/database';
import {
  createInitialRoom,
  joinPlayer,
  findFirstEmptySlot,
  deserializeRoom,
  type RoomState,
} from 'react-gameroom';
import { database } from '../firebase';
import { MIN_PLAYERS, MAX_PLAYERS } from '../game/constants';
import type { ColorlitionGameState, ColorlitionPlayerData } from '../game/types';

export interface GameContextValue {
  roomState: RoomState<ColorlitionPlayerData> | null;
  gameState: ColorlitionGameState | null;
  loading: boolean;
  createRoom: () => Promise<string>;
  loadRoom: (roomId: string) => void;
  joinRoom: (roomId: string, name: string) => Promise<number>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState<ColorlitionPlayerData> | null>(null);
  const [gameState, setGameState] = useState<ColorlitionGameState | null>(null);
  const [loading, setLoading] = useState(false);
  const unsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const loadRoom = useCallback((roomId: string) => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    setLoading(true);
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsub = onValue(
      roomRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setLoading(false);
          return;
        }
        if (data.room) {
          try {
            setRoomState(deserializeRoom<ColorlitionPlayerData>(data.room));
          } catch {
            setRoomState(data.room as RoomState<ColorlitionPlayerData>);
          }
        }
        setGameState((data.game as ColorlitionGameState | null) ?? null);
        setLoading(false);
      },
      (err) => {
        console.error('[colorlition] Firebase listener error:', err);
        setLoading(false);
      },
    );
    unsubRef.current = unsub;
  }, []);

  const createRoom = useCallback(async () => {
    const room = createInitialRoom<ColorlitionPlayerData>({
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      requireFull: false,
    });
    const roomId = room.roomId;
    const roomRef = ref(database, `rooms/${roomId}`);
    await set(roomRef, {
      room: JSON.parse(JSON.stringify(room)),
      game: null,
    });
    return roomId;
  }, []);

  const joinRoom = useCallback(async (roomId: string, name: string) => {
    const roomRef = ref(database, `rooms/${roomId}/room`);
    const snapshot = await get(roomRef);
    const currentRoom = snapshot.val();
    if (!currentRoom) throw new Error('Room not found');

    let room: RoomState<ColorlitionPlayerData>;
    try {
      room = deserializeRoom<ColorlitionPlayerData>(currentRoom);
    } catch {
      room = currentRoom as RoomState<ColorlitionPlayerData>;
    }

    if (room.status === 'started') throw new Error('Game has already started');

    const emptySlot = findFirstEmptySlot(room.players);
    if (!emptySlot) throw new Error('Room is full');

    const updated = joinPlayer(room, emptySlot.id, name);
    await set(ref(database, `rooms/${roomId}/room`), updated);
    return emptySlot.id;
  }, []);

  return (
    <GameContext.Provider
      value={{ roomState, gameState, loading, createRoom, loadRoom, joinRoom }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
