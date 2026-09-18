// ============================================================
// Firebase Operations — All RTDB read/write with transactions
// ============================================================

import {
  ref,
  set,
  get,
  onValue,
  runTransaction,
  onDisconnect,
  off,
  DataSnapshot,
} from 'firebase/database';
import { database } from './firebase';
import { Room, PlayerAction } from './types';
import {
  createRoom as createRoomState,
  joinRoom as joinRoomState,
  startRound as startRoundState,
  handleAction as handleActionState,
} from './gameLogic';

// ── Room Operations ──────────────────────────────────────────

/**
 * Create a new room in Firebase RTDB.
 */
export async function createRoomInDB(
  roomCode: string,
  hostId: string,
  hostName: string,
): Promise<Room> {
  const room = createRoomState(roomCode, hostId, hostName);
  const roomRef = ref(database, `rooms/${roomCode}`);
  await set(roomRef, sanitizeForFirebase(room));
  return room;
}

/**
 * Join an existing room via transaction (atomic add-player).
 */
export async function joinRoomInDB(
  roomCode: string,
  playerId: string,
  playerName: string,
): Promise<void> {
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  await runTransaction(roomRef, (currentData) => {
    if (!currentData) return currentData;
    
    try {
      const updatedRoom = joinRoomState(currentData as Room, playerId, playerName);
      return sanitizeForFirebase(updatedRoom);
    } catch {
      // If join fails (room full, etc.), abort transaction
      return undefined;
    }
  });
}

/**
 * Update room settings (host only, before game starts).
 */
export async function updateRoomSettings(
  roomCode: string,
  settings: { variation?: string; bootAmount?: number; startingChips?: number },
): Promise<void> {
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  await runTransaction(roomRef, (currentData) => {
    if (!currentData) return currentData;
    
    const room = currentData as Room;
    if (room.status !== 'waiting') return currentData;
    
    const updated = { ...room };
    if (settings.variation) updated.variation = settings.variation as Room['variation'];
    if (settings.bootAmount) {
      updated.bootAmount = settings.bootAmount;
      updated.currentBet = settings.bootAmount;
    }
    if (settings.startingChips) {
      updated.startingChips = settings.startingChips;
      // Update all players' chips too
      for (const id of updated.playerOrder) {
        if (updated.players[id]) {
          updated.players[id].chips = settings.startingChips;
        }
      }
    }
    
    return sanitizeForFirebase(updated);
  });
}

/**
 * Start a new round via transaction.
 */
export async function startRoundInDB(roomCode: string): Promise<void> {
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  await runTransaction(roomRef, (currentData) => {
    if (!currentData) return currentData;
    
    try {
      const room = currentData as Room;
      const updatedRoom = startRoundState(room);
      return sanitizeForFirebase(updatedRoom);
    } catch {
      return undefined;
    }
  });
}

/**
 * Perform a player action via transaction (atomic state mutation).
 */
export async function performActionInDB(
  roomCode: string,
  playerId: string,
  action: PlayerAction,
): Promise<void> {
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  const result = await runTransaction(roomRef, (currentData) => {
    if (!currentData) return currentData;
    
    try {
      const room = currentData as Room;
      const updatedRoom = handleActionState(room, playerId, action);
      return sanitizeForFirebase(updatedRoom);
    } catch {
      // Action invalid — abort
      return undefined;
    }
  });

  if (!result.committed) {
    throw new Error('Action failed — please try again');
  }
}

// ── Subscription ─────────────────────────────────────────────

/**
 * Subscribe to room state changes. Returns an unsubscribe function.
 */
export function subscribeToRoom(
  roomCode: string,
  callback: (room: Room | null) => void,
  errorCallback?: (error: Error) => void,
): () => void {
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  onValue(
    roomRef,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as Room);
      } else {
        callback(null);
      }
    },
    (error) => {
      if (errorCallback) errorCallback(error);
    },
  );

  return () => off(roomRef);
}

/**
 * Check if a room exists.
 */
export async function roomExists(roomCode: string): Promise<boolean> {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
}

// ── Connection Presence ──────────────────────────────────────

/**
 * Set up disconnect handler for a player.
 * Marks them as disconnected if they close the browser.
 */
export function setupPresence(roomCode: string, playerId: string): void {
  const connectedRef = ref(database, '.info/connected');
  const playerConnRef = ref(database, `rooms/${roomCode}/players/${playerId}/isConnected`);

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      set(playerConnRef, true);
      onDisconnect(playerConnRef).set(false);
    }
  });
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Firebase RTDB doesn't store `undefined` values and treats empty arrays
 * differently. Sanitize the object before writing.
 */
function sanitizeForFirebase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.length === 0 ? [] : obj.map(sanitizeForFirebase);
  }
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirebase(value);
    }
  }
  return result;
}
