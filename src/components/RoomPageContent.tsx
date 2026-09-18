'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayer } from '@/hooks/usePlayer';
import { useRoom } from '@/hooks/useRoom';
import { useGameActions } from '@/hooks/useGameActions';
import { joinRoomInDB, setupPresence } from '@/lib/firebaseOperations';
import { PlayerAction } from '@/lib/types';
import Lobby from '@/components/Lobby';
import GameTable from '@/components/GameTable';

export default function RoomPageContent() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.code as string)?.toUpperCase();
  const { playerId, playerName, isLoaded } = usePlayer();
  const { room, loading: roomLoading, error: roomError } = useRoom(roomCode);
  const { performAction, startRound, updateSettings, loading: actionLoading } = useGameActions(roomCode);
  const [joinAttempted, setJoinAttempted] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Auto-join room when player info is loaded
  useEffect(() => {
    if (!isLoaded || !playerId || !playerName || !roomCode || joinAttempted) return;

    const doJoin = async () => {
      try {
        await joinRoomInDB(roomCode, playerId, playerName);
        setupPresence(roomCode, playerId);
        setJoinAttempted(true);
      } catch {
        setJoinError('Failed to join room. It may be full or the game already started.');
      }
    };

    doJoin();
  }, [isLoaded, playerId, playerName, roomCode, joinAttempted]);

  // Handle player action
  const handleAction = async (action: PlayerAction) => {
    await performAction(playerId, action);
  };

  // Handle next round
  const handleNextRound = async () => {
    await startRound();
  };

  // Handle start game
  const handleStartGame = async () => {
    await startRound();
  };

  // Loading state
  if (!isLoaded || roomLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse">🃏</div>
          <p className="text-gold animate-pulse">Loading room...</p>
        </div>
      </div>
    );
  }

  // No player name — redirect to home
  if (!playerName) {
    router.push('/');
    return null;
  }

  // Room not found
  if (!room && !roomLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">😕</div>
          <h2 className="text-xl font-bold text-white">Room Not Found</h2>
          <p className="text-gray-400">
            The room <span className="font-mono text-gold">{roomCode}</span> doesn&apos;t exist or has expired.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gold text-black font-bold rounded-xl transition-all active:scale-95"
          >
            ← Back Home
          </button>
        </div>
      </div>
    );
  }

  // Error states
  if (roomError || joinError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-white">Connection Error</h2>
          <p className="text-red-300 text-sm">{roomError || joinError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gold text-black font-bold rounded-xl transition-all active:scale-95"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!room) return null;

  // Show lobby or game based on room status
  if (room.status === 'waiting') {
    return (
      <Lobby
        room={room}
        playerId={playerId}
        onUpdateSettings={updateSettings}
        onStartGame={handleStartGame}
        loading={actionLoading}
      />
    );
  }

  // Game in progress or round end
  return (
    <GameTable
      room={room}
      playerId={playerId}
      onAction={handleAction}
      onNextRound={handleNextRound}
      loading={actionLoading}
    />
  );
}
