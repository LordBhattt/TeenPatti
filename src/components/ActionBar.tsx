'use client';


import { Room, PlayerAction } from '@/lib/types';
import { getValidActions } from '@/lib/gameLogic';

interface ActionBarProps {
  room: Room;
  playerId: string;
  onAction: (action: PlayerAction) => void;
  loading: boolean;
}

export default function ActionBar({ room, playerId, onAction, loading }: ActionBarProps) {
  const validActions = getValidActions(room, playerId);
  const player = room.players[playerId];
  const isMyTurn = room.currentTurn === playerId;

  if (!isMyTurn || !player || player.isFolded || room.status !== 'playing') {
    return null;
  }

  const blindBet = room.currentBet;
  const seenBet = room.currentBet * 2;
  const raiseBet = player.hasSeen ? room.currentBet * 4 : room.currentBet * 2;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gold/30 safe-bottom">
      <div className="max-w-lg mx-auto p-3">
        {/* Turn indicator */}
        <div className="text-center text-gold text-sm font-semibold mb-2 animate-pulse">
          ✨ Your Turn
        </div>
        
        <div className="flex gap-2 flex-wrap justify-center">
          {/* See button - look at cards */}
          {validActions.includes('see') && (
            <button
              onClick={() => onAction({ type: 'see' })}
              disabled={loading}
              className="touch-target px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl 
                font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              👁 See Cards
            </button>
          )}

          {/* Blind bet */}
          {validActions.includes('blind') && (
            <button
              onClick={() => onAction({ type: 'blind' })}
              disabled={loading}
              className="touch-target px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl 
                font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              🙈 Blind ({blindBet})
            </button>
          )}

          {/* Chaal (seen bet) */}
          {validActions.includes('chaal') && (
            <button
              onClick={() => onAction({ type: 'chaal' })}
              disabled={loading}
              className="touch-target px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl 
                font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              💰 Chaal ({seenBet})
            </button>
          )}

          {/* Raise */}
          {validActions.includes('raise') && (
            <button
              onClick={() => onAction({ type: 'raise', amount: raiseBet })}
              disabled={loading}
              className="touch-target px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl 
                font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              ⬆️ Raise ({raiseBet})
            </button>
          )}

          {/* Show */}
          {validActions.includes('show') && (
            <button
              onClick={() => onAction({ type: 'show' })}
              disabled={loading}
              className="touch-target px-4 py-2.5 bg-gold hover:bg-gold-light text-black rounded-xl 
                font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              🃏 Show
            </button>
          )}

          {/* Fold */}
          {validActions.includes('fold') && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to fold?')) {
                  onAction({ type: 'fold' });
                }
              }}
              disabled={loading}
              className="touch-target px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl 
                font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              ✋ Fold
            </button>
          )}
        </div>

        {/* Current bet info */}
        <div className="text-center text-gray-400 text-xs mt-2">
          Stake: {room.currentBet} · Pot: {room.pot} · Your chips: {player.chips}
        </div>
      </div>
    </div>
  );
}
