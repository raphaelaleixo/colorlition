import { ref, get } from 'firebase/database';
import { deserializeRoom, type RoomState, type RoomStatus } from 'react-gameroom';
import { database } from '../firebase';
import type { ColorlitionPlayerData } from '../game/types';

export async function getRoomStatus(roomId: string): Promise<RoomStatus | null> {
  const trimmed = roomId.trim().toUpperCase();
  if (!trimmed) return null;
  const snap = await get(ref(database, `rooms/${trimmed}/room`));
  const data = snap.val();
  if (!data) return null;
  try {
    return deserializeRoom<ColorlitionPlayerData>(data).status;
  } catch {
    return (data as RoomState<ColorlitionPlayerData>).status ?? null;
  }
}
