'use client';

import { Room } from '@/lib/types';

interface WinnerModalProps {
  room: Room;
  onNextRound: () => void;
  isHost: boolean;
}

export default function WinnerModal({ room, onNextRound, isHost }: WinnerModalProps) {
  if (room.status !== 'roundEnd' || !room.lastWinner) return null;

  const { playerName, handType, potWon } = room.lastWinner;

  const eliminatedPlayers = room.playerOrder.filter(
    id => room.players[id] && room.players[id].chips <= 0
  );
  const isGameOver = eliminatedPlayers.length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 animate-fade-in">
      <div className="bg-surface border border-border rounded w-full max-w-xs p-6 text-center">
        {/* Winner */}
        <p className="text-muted text-xs mb-1">Winner</p>
        <h2 className="font-serif text-2xl text-primary">{playerName}</h2>
        <p className="text-muted text-sm mt-1">{handType}</p>

        {/* Pot */}
        <div className="my-5 py-3 border-y border-border">
          <p className="text-muted text-xs">Pot</p>
          <p className="font-serif text-3xl text-accent">{potWon}</p>
        </div>

        {/* Standings */}
        <div className="space-y-1.5 mb-5">
          {room.playerOrder.map(id => {
            const p = room.players[id];
            if (!p) return null;
            const isWinner = id === room.lastWinner?.playerId;
            return (
              <div key={id} className={`flex justify-between text-sm px-1
                ${isWinner ? 'text-accent' : p.chips <= 0 ? 'text-muted line-through' : 'text-primary/70'}`}>
                <span>{p.name}</span>
                <span className="font-serif">{p.chips}</span>
              </div>
            );
          })}
        </div>

        {isGameOver ? (
          <div>
            <p className="text-card-red text-xs mb-2">
              {eliminatedPlayers.map(id => room.players[id]?.name).join(', ')} out
            </p>
            <p className="text-primary font-serif text-lg">Game over</p>
          </div>
        ) : (
          isHost ? (
            <button
              onClick={onNextRound}
              className="w-full py-2.5 bg-accent text-white font-medium rounded text-sm
                transition-colors hover:bg-accent-dim active:scale-[0.98]"
            >
              Next round
            </button>
          ) : (
            <p className="text-muted text-sm">Waiting for host...</p>
          )
        )}
      </div>
    </div>
  );
}
