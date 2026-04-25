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
  update,
  onValue,
  get,
  type Unsubscribe,
} from 'firebase/database';
import {
  createInitialRoom,
  joinPlayer,
  startGame as startGameRoom,
  findFirstEmptySlot,
  deserializeRoom,
  type RoomState,
} from 'react-gameroom';
import { database } from '../firebase';
import { MIN_PLAYERS, MAX_PLAYERS, SEGMENT_NAMES, EXCLUDE_COLOR_AT_PLAYERS } from '../game/constants';
import {
  buildDeck,
  shuffle,
  placeExitPoll,
  pickStartingHands,
  pickRandomColor,
} from '../game/deck';
import {
  buildInitialGameState,
  drawAndPlace as drawAndPlacePure,
  claim as claimPure,
} from '../game/actions';
import type { ColorlitionGameState, ColorlitionPlayerData, SegmentKey, Segment, PerPlayerState } from '../game/types';

// Firebase RTDB drops empty arrays and null values on write, so a freshly-stored
// game state comes back with missing `cards`, `claimedBy`, `base`, etc. Restore
// them so downstream code can trust the shape.
function normalizeGameState(raw: ColorlitionGameState | null | undefined): ColorlitionGameState | null {
  if (!raw) return null;
  const segments: Segment[] = (raw.segments ?? []).map((s) => ({
    key: s.key,
    label: s.label,
    cards: s.cards ?? [],
    claimedBy: s.claimedBy ?? null,
  }));
  const playerState: Record<string, PerPlayerState> = {};
  for (const [pid, ps] of Object.entries(raw.playerState ?? {})) {
    playerState[pid] = {
      base: ps?.base ?? [],
      roundStatus: ps?.roundStatus ?? 'active',
    };
  }
  return {
    ...raw,
    deck: raw.deck ?? [],
    segments,
    turnOrder: raw.turnOrder ?? [],
    playerState,
    exitPollDrawn: raw.exitPollDrawn ?? false,
    winnerIds: raw.winnerIds ?? null,
    scoreBreakdown: raw.scoreBreakdown ?? null,
    lastHeadline: raw.lastHeadline ?? null,
    scoreHistory: (raw.scoreHistory ?? []).map((s) => ({
      roundNumber: s.roundNumber,
      scores: s.scores ?? {},
    })),
  };
}

export interface GameContextValue {
  roomState: RoomState<ColorlitionPlayerData> | null;
  gameState: ColorlitionGameState | null;
  loading: boolean;
  createRoom: () => Promise<string>;
  loadRoom: (roomId: string) => void;
  joinRoom: (roomId: string, name: string) => Promise<number>;
  claimSlot: (roomId: string, slotId: number, name: string) => Promise<void>;
  startTheGame: () => Promise<void>;
  drawAndPlace: (segmentKey: SegmentKey) => Promise<void>;
  claim: (segmentKey: SegmentKey) => Promise<void>;
}

export const GameContext = createContext<GameContextValue | null>(null);

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
        setGameState(normalizeGameState(data.game as ColorlitionGameState | null));
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

  const claimSlot = useCallback(async (roomId: string, slotId: number, name: string) => {
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

    const slot = room.players.find((p) => p.id === slotId);
    if (!slot) throw new Error('Invalid slot');
    if (slot.status !== 'empty') throw new Error('Slot already taken');

    const updated = joinPlayer(room, slotId, name);
    await set(ref(database, `rooms/${roomId}/room`), updated);
  }, []);

  const startTheGame = useCallback(async () => {
    if (!roomState) return;
    const roomId = roomState.roomId;
    const started = startGameRoom(roomState);
    const readyPlayers = roomState.players.filter((p) => p.status === 'ready');
    const turnOrder = readyPlayers.map((p) => String(p.id));
    if (turnOrder.length < MIN_PLAYERS) {
      throw new Error(`Need at least ${MIN_PLAYERS} players to start`);
    }

    // At EXCLUDE_COLOR_AT_PLAYERS (= 3), drop one random color from the deck entirely.
    const excludedColor =
      turnOrder.length === EXCLUDE_COLOR_AT_PLAYERS ? pickRandomColor() : undefined;

    // Build deck (with any excluded color gone), deal one starting bloc to each
    // player (each a distinct color, not the excluded one), then shuffle and
    // place the Exit Poll in the remaining deck.
    const fullDeck = buildDeck(excludedColor);
    const { deck: afterDealing, hands } = pickStartingHands(fullDeck, turnOrder, excludedColor);
    const finalDeck = placeExitPoll(shuffle(afterDealing));

    const newGameState = buildInitialGameState(finalDeck, turnOrder, SEGMENT_NAMES, hands);

    await set(ref(database, `rooms/${roomId}/room`), started);
    await set(ref(database, `rooms/${roomId}/game`), newGameState);
  }, [roomState]);

  const drawAndPlace = useCallback(async (segmentKey: SegmentKey) => {
    if (!roomState || !gameState) return;
    if (gameState.phase !== 'turn' && gameState.phase !== 'finalRound') return;
    const nextGame = drawAndPlacePure(gameState, segmentKey);
    await update(ref(database, `rooms/${roomState.roomId}/game`), nextGame);
  }, [roomState, gameState]);

  const claim = useCallback(async (segmentKey: SegmentKey) => {
    if (!roomState || !gameState) return;
    if (gameState.phase !== 'turn' && gameState.phase !== 'finalRound') return;
    const nextGame = claimPure(gameState, segmentKey);
    await update(ref(database, `rooms/${roomState.roomId}/game`), nextGame);
  }, [roomState, gameState]);

  return (
    <GameContext.Provider
      value={{
        roomState,
        gameState,
        loading,
        createRoom,
        loadRoom,
        joinRoom,
        claimSlot,
        startTheGame,
        drawAndPlace,
        claim,
      }}
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
