'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '@/hooks/usePlayer';
import { generateRoomCode } from '@/lib/gameLogic';
import { createRoomInDB, roomExists } from '@/lib/firebaseOperations';

export default function HomePage() {
  const router = useRouter();
  const { playerId, playerName, setPlayerName, isLoaded } = usePlayer();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Enter your name to continue');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const code = generateRoomCode();
      await createRoomInDB(code, playerId, playerName.trim());
      router.push(`/room/${code}`);
    } catch {
      setError('Failed to create room. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Enter your name to continue');
      return;
    }
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setError('Enter a valid room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const exists = await roomExists(code);
      if (!exists) {
        setError('Room not found');
        setLoading(false);
        return;
      }
      router.push(`/room/${code}`);
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6">
      <div className="w-full max-w-xs space-y-10">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-serif text-4xl text-primary tracking-tight">Teen Patti</h1>
          <p className="text-muted text-sm mt-1">Play with friends</p>
        </div>

        {/* Name */}
        <div>
          <label className="text-muted text-xs block mb-1.5">Your name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter name"
            maxLength={15}
            className="w-full bg-surface border border-border rounded px-3 py-2.5
              text-primary text-center text-base placeholder-muted/50
              focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-card-red text-xs text-center -mt-6">{error}</p>
        )}

        {/* Create */}
        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full py-3 bg-accent text-white font-medium rounded text-sm
            transition-colors hover:bg-accent-dim active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create room'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted text-xs">or join</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Join */}
        <div className="space-y-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            maxLength={6}
            className="w-full bg-surface border border-border rounded px-3 py-2.5
              text-primary text-center font-serif text-lg tracking-[0.2em] uppercase
              placeholder-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleJoinRoom}
            disabled={loading || !joinCode.trim()}
            className="w-full py-3 bg-surface border border-border text-primary font-medium
              rounded text-sm transition-colors hover:border-muted active:scale-[0.98]
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join room'}
          </button>
        </div>

        <p className="text-center text-muted/40 text-xs">No account needed</p>
      </div>
    </div>
  );
}
