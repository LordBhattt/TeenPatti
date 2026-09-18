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
      setError('Please enter your name');
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
      setError('Please enter your name');
      return;
    }
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setError('Please enter a valid room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const exists = await roomExists(code);
      if (!exists) {
        setError('Room not found. Check the code and try again.');
        setLoading(false);
        return;
      }
      router.push(`/room/${code}`);
    } catch {
      setError('Failed to join room. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gold animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="text-6xl mb-2">🃏</div>
          <h1 className="text-4xl font-bold text-gold tracking-tight">
            Teen Patti
          </h1>
          <p className="text-gray-400 text-sm">
            Play 3 Patti online with friends
          </p>
        </div>

        {/* Player Name Input */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={15}
            className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 text-white 
              placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold
              text-center text-lg"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Create Room */}
        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full py-4 bg-gold hover:bg-gold-light text-black font-bold rounded-xl 
            text-lg transition-all active:scale-95 shadow-glow disabled:opacity-50"
        >
          {loading ? '⏳ Creating...' : '🎯 Create Room'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        {/* Join Room */}
        <div className="space-y-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            maxLength={6}
            className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 text-white 
              placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold
              text-center text-lg font-mono tracking-[0.3em] uppercase"
          />
          <button
            onClick={handleJoinRoom}
            disabled={loading || !joinCode.trim()}
            className="w-full py-4 bg-felt-light hover:bg-felt border border-gold/30 text-gold 
              font-bold rounded-xl text-lg transition-all active:scale-95 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Joining...' : '🚪 Join Room'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs">
          No account needed · Play for free · Up to 4 players
        </p>
      </div>
    </div>
  );
}
