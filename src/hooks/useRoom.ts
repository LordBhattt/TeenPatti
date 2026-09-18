'use client';
import { useState, useEffect } from 'react';
import { Room } from '@/lib/types';
import { subscribeToRoom } from '@/lib/firebaseOperations';

export function useRoom(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    setLoading(true);
    const unsubscribe = subscribeToRoom(
      roomCode,
      (roomData) => {
        setRoom(roomData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [roomCode]);

  return { room, loading, error };
}
