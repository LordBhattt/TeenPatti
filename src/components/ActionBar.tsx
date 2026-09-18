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
    <div className="fixed bottom-0 left-0 right-0 glass-bar safe-bottom z-40">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Turn text */}
        <p className="text-accent text-xs text-center mb-2.5 font-medium">Your turn</p>

        <div className="flex gap-2 justify-center flex-wrap">
          {/* See */}
          {validActions.includes('see') && (
            <button
              onClick={() => onAction({ type: 'see' })}
              disabled={loading}
              className="px-4 py-2 bg-surface border border-border rounded text-sm text-primary
                transition-colors hover:border-muted active:scale-95 disabled:opacity-40"
            >
              Look at cards
            </button>
          )}

          {/* Blind */}
          {validActions.includes('blind') && (
            <button
              onClick={() => onAction({ type: 'blind' })}
              disabled={loading}
              className="px-4 py-2 bg-surface border border-border rounded text-sm text-primary
                transition-colors hover:border-muted active:scale-95 disabled:opacity-40"
            >
              <span>Blind</span>
              <span className="text-muted text-xs ml-1.5">{blindBet}</span>
            </button>
          )}

          {/* Chaal */}
          {validActions.includes('chaal') && (
            <button
              onClick={() => onAction({ type: 'chaal' })}
              disabled={loading}
              className="px-4 py-2 bg-surface border border-border rounded text-sm text-primary
                transition-colors hover:border-muted active:scale-95 disabled:opacity-40"
            >
              <span>Chaal</span>
              <span className="text-muted text-xs ml-1.5">{seenBet}</span>
            </button>
          )}

          {/* Raise */}
          {validActions.includes('raise') && (
            <button
              onClick={() => onAction({ type: 'raise', amount: raiseBet })}
              disabled={loading}
              className="px-4 py-2 bg-surface border border-accent/40 rounded text-sm text-primary
                transition-colors hover:border-accent active:scale-95 disabled:opacity-40"
            >
              <span>Raise</span>
              <span className="text-muted text-xs ml-1.5">{raiseBet}</span>
            </button>
          )}

          {/* Show */}
          {validActions.includes('show') && (
            <button
              onClick={() => onAction({ type: 'show' })}
              disabled={loading}
              className="px-4 py-2 bg-accent text-white rounded text-sm font-medium
                transition-colors hover:bg-accent-dim active:scale-95 disabled:opacity-40"
            >
              Show cards
            </button>
          )}

          {/* Fold */}
          {validActions.includes('fold') && (
            <button
              onClick={() => {
                if (confirm('Fold this hand?')) {
                  onAction({ type: 'fold' });
                }
              }}
              disabled={loading}
              className="px-4 py-2 rounded text-sm text-muted
                transition-colors hover:text-card-red active:scale-95 disabled:opacity-40"
            >
              Fold
            </button>
          )}
        </div>

        {/* Stake info */}
        <div className="text-center text-muted text-[10px] mt-2">
          Stake {room.currentBet} · Your chips <span className="font-serif text-primary/70">{player.chips}</span>
        </div>
      </div>
    </div>
  );
}
