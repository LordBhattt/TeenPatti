'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Room } from '@/lib/types';

interface WinnerModalProps {
  room: Room;
  onNextRound: () => void;
  onResetGame?: () => void;
  isHost: boolean;
}

export default function WinnerModal({ room, onNextRound, onResetGame, isHost }: WinnerModalProps) {
  const router = useRouter();
  const [minimized, setMinimized] = useState(false);

  if (room.status !== 'roundEnd' || !room.lastWinner) return null;

  const { playerName, handType, potWon } = room.lastWinner;

  // Players with chips
  const playersWithChips = room.playerOrder.filter(
    id => room.players[id] && room.players[id].chips > 0
  );
  const eliminatedPlayers = room.playerOrder.filter(
    id => room.players[id] && room.players[id].chips <= 0
  );
  
  // Truly game over only when fewer than 2 players have chips to play
  const isGameOver = playersWithChips.length < 2;

  // Minimized floating banner so players can inspect all hands on the table
  if (minimized) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-surface/95 backdrop-blur-md border border-border rounded-full px-4 py-2.5 flex items-center gap-3 shadow-xl animate-fade-in text-xs">
        <span className="text-primary font-medium">
          {playerName} won <span className="font-serif text-accent">{potWon}</span>
        </span>
        <button
          onClick={() => setMinimized(false)}
          className="text-muted hover:text-primary transition-colors underline underline-offset-2"
        >
          Details
        </button>
        {isHost && !isGameOver && (
          <button
            onClick={onNextRound}
            className="px-3 py-1 bg-accent text-white font-medium rounded-full hover:bg-accent-dim transition-colors"
          >
            Next round
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface border border-border rounded w-full max-w-xs p-5 text-center shadow-2xl">
        {/* View table toggle */}
        <div className="flex justify-end -mt-1 -mr-1 mb-2">
          <button
            onClick={() => setMinimized(true)}
            className="text-muted hover:text-primary text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-base/50"
            title="Inspect all cards on table"
          >
            View cards on table
          </button>
        </div>

        {/* Winner info */}
        <p className="text-muted text-xs mb-1">Winner</p>
        <h2 className="font-serif text-2xl text-primary">{playerName}</h2>
        <p className="text-muted text-sm mt-0.5">{handType}</p>

        {/* Pot */}
        <div className="my-4 py-2.5 border-y border-border">
          <p className="text-muted text-xs">Pot</p>
          <p className="font-serif text-3xl text-accent">{potWon}</p>
        </div>

        {/* Standings */}
        <div className="space-y-1.5 mb-5 max-h-36 overflow-y-auto pr-1">
          {room.playerOrder.map(id => {
            const p = room.players[id];
            if (!p) return null;
            const isWinner = id === room.lastWinner?.playerId;
            return (
              <div
                key={id}
                className={`flex justify-between text-sm px-1 ${
                  isWinner ? 'text-accent font-medium' : p.chips <= 0 ? 'text-muted line-through opacity-60' : 'text-primary/80'
                }`}
              >
                <span>{p.name}</span>
                <span className="font-serif">{p.chips}</span>
              </div>
            );
          })}
        </div>

        {isGameOver ? (
          <div className="space-y-3">
            <p className="text-card-red text-xs">
              {eliminatedPlayers.map(id => room.players[id]?.name).join(', ')} eliminated
            </p>
            <p className="text-primary font-serif text-lg">Game over</p>
            {isHost && onResetGame ? (
              <button
                onClick={onResetGame}
                className="w-full py-2.5 bg-accent text-white font-medium rounded text-sm
                  transition-colors hover:bg-accent-dim active:scale-[0.98]"
              >
                Reset chips & play again
              </button>
            ) : (
              <p className="text-muted text-xs">Waiting for host to restart...</p>
            )}
            <button
              onClick={() => router.push('/')}
              className="w-full py-2 bg-base border border-border text-muted hover:text-primary rounded text-xs transition-colors"
            >
              Exit to home
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {eliminatedPlayers.length > 0 && (
              <p className="text-muted text-xs mb-1">
                {eliminatedPlayers.map(id => room.players[id]?.name).join(', ')} out of chips (sitting out)
              </p>
            )}
            {isHost ? (
              <button
                onClick={onNextRound}
                className="w-full py-2.5 bg-accent text-white font-medium rounded text-sm
                  transition-colors hover:bg-accent-dim active:scale-[0.98]"
              >
                Next round
              </button>
            ) : (
              <p className="text-muted text-sm py-1">Waiting for host to start next round...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
