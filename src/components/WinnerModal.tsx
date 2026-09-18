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

  // Check if any player has 0 chips (game over)
  const eliminatedPlayers = room.playerOrder.filter(
    id => room.players[id] && room.players[id].chips <= 0
  );
  const isGameOver = eliminatedPlayers.length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-felt-dark to-felt border-2 border-gold/50 rounded-2xl 
        p-6 max-w-sm w-full text-center animate-bounce-in shadow-glow">
        {/* Trophy */}
        <div className="text-5xl mb-3">🏆</div>
        
        {/* Winner name */}
        <h2 className="text-2xl font-bold text-gold mb-1">{playerName} wins!</h2>
        
        {/* Hand type */}
        <p className="text-gray-300 mb-2">
          with <span className="text-white font-semibold">{handType}</span>
        </p>
        
        {/* Pot won */}
        <div className="bg-black/30 rounded-xl p-3 mb-4">
          <div className="text-sm text-gray-400">Pot Won</div>
          <div className="text-3xl font-bold text-gold">💰 {potWon}</div>
        </div>

        {/* Chip standings */}
        <div className="mb-4 space-y-1">
          <h3 className="text-sm font-semibold text-gray-400">Standings</h3>
          {room.playerOrder.map(id => {
            const p = room.players[id];
            if (!p) return null;
            const isWinner = id === room.lastWinner?.playerId;
            return (
              <div key={id} className={`flex justify-between text-sm px-2 py-1 rounded 
                ${isWinner ? 'bg-gold/20 text-gold' : 'text-gray-300'}
                ${p.chips <= 0 ? 'text-red-400 line-through' : ''}`}>
                <span>{p.name} {isWinner && '👑'}</span>
                <span className="font-semibold">{p.chips} chips</span>
              </div>
            );
          })}
        </div>

        {isGameOver ? (
          <div>
            <p className="text-red-400 text-sm mb-3">
              {eliminatedPlayers.map(id => room.players[id]?.name).join(', ')} eliminated!
            </p>
            <p className="text-gold font-bold text-lg">Game Over! 🎉</p>
          </div>
        ) : (
          isHost ? (
            <button
              onClick={onNextRound}
              className="touch-target w-full py-3 bg-gold hover:bg-gold-light text-black 
                font-bold rounded-xl text-lg transition-all active:scale-95"
            >
              Next Round →
            </button>
          ) : (
            <p className="text-gray-400 text-sm animate-pulse">Waiting for host to start next round...</p>
          )
        )}
      </div>
    </div>
  );
}
