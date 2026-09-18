'use client';
import { useState, useCallback } from 'react';
import { PlayerAction } from '@/lib/types';
import {
  performActionInDB,
  startRoundInDB,
  updateRoomSettings,
} from '@/lib/firebaseOperations';

export function useGameActions(roomCode: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = useCallback(async (playerId: string, action: PlayerAction) => {
    setLoading(true);
    setError(null);
    try {
      await performActionInDB(roomCode, playerId, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  const startRound = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await startRoundInDB(roomCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start round');
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  const updateSettings = useCallback(async (settings: { variation?: string; bootAmount?: number; startingChips?: number }) => {
    setLoading(true);
    setError(null);
    try {
      await updateRoomSettings(roomCode, settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  return { performAction, startRound, updateSettings, loading, error };
}
