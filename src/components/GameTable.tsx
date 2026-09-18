'use client';

import { useState, useEffect } from 'react';
import { Room, PlayerAction, VARIATION_NAMES } from '@/lib/types';
import PlayerCards from './PlayerCards';
import ActionBar from './ActionBar';
import ActionLog from './ActionLog';
import WinnerModal from './WinnerModal';

interface GameTableProps {
  room: Room;
  playerId: string;
  onAction: (action: PlayerAction) => void;
  onNextRound: () => void;
  loading: boolean;
}

export default function GameTable({ room, playerId, onAction, onNextRound, loading }: GameTableProps) {
  const currentPlayer = room.players[playerId];
  const opponents = room.playerOrder.filter(id => id !== playerId);
  const isHost = room.hostId === playerId;
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Best of Four card selection
  const handleCardSelect = (index: number) => {
    if (room.variation !== 'bestOfFour' || !currentPlayer || currentPlayer.hand.length !== 4) return;
    if (currentPlayer.selectedCards) return; // Already selected
    
    setSelectedCards(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  };

  // Confirm card selection for Best of Four
  useEffect(() => {
    if (selectedCards.length === 3 && room.variation === 'bestOfFour') {
      onAction({ type: 'selectCards', selectedIndices: selectedCards });
    }
  }, [selectedCards]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] safe-top pb-32">
      {/* Top bar: variation badge + round info */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="bg-black/30 px-3 py-1 rounded-full text-xs font-semibold text-gold">
          {VARIATION_NAMES[room.variation]}
        </div>
        <div className="text-xs text-gray-400">
          Round {room.round}
        </div>
      </div>

      {/* Joker card indicator */}
      {room.jokerCard && room.variation === 'joker' && (
        <div className="text-center mb-2">
          <span className="bg-gold/20 text-gold text-xs px-3 py-1 rounded-full">
            🃏 Joker: {room.jokerCard.rank} (all {room.jokerCard.rank}s are wild)
          </span>
        </div>
      )}

      {/* Opponents area */}
      <div className="flex justify-center gap-3 px-4 mb-4">
        {opponents.map(id => {
          const p = room.players[id];
          if (!p) return null;
          const isCurrentTurn = room.currentTurn === id;
          
          return (
            <div
              key={id}
              className={`flex flex-col items-center p-2 rounded-xl transition-all
                ${isCurrentTurn ? 'active-turn' : ''}
                ${p.isFolded ? 'opacity-40' : ''}`}
            >
              {/* Avatar + name */}
              <div className="text-center mb-1">
                <div className="text-lg mb-0.5">
                  {p.isFolded ? '💤' : p.hasSeen ? '👁' : '🙈'}
                </div>
                <div className="text-xs font-semibold text-white truncate max-w-[80px]">
                  {p.name}
                </div>
                <div className="text-xs text-gold">{p.chips} 💰</div>
              </div>
              
              {/* Opponent's cards (face down during play, face up at showdown) */}
              <PlayerCards
                cards={p.hand}
                faceUp={room.status === 'showdown' || room.status === 'roundEnd'}
                variation={room.variation}
                jokerCard={room.jokerCard}
                size="sm"
              />
              
              {p.isFolded && (
                <span className="text-xs text-red-400 mt-1">Folded</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pot area */}
      <div className="flex flex-col items-center mb-4">
        <div className="bg-black/40 rounded-2xl px-8 py-4 text-center border border-gold/20">
          <div className="text-xs text-gray-400 uppercase tracking-wider">Pot</div>
          <div className="text-3xl font-bold text-gold chip-animate">💰 {room.pot}</div>
          <div className="text-xs text-gray-400 mt-1">Stake: {room.currentBet}</div>
        </div>
      </div>

      {/* Current player area */}
      {currentPlayer && (
        <div className="flex-1 flex flex-col items-center justify-end px-4 mb-4">
          {/* Player info */}
          <div className={`text-center mb-3 p-3 rounded-xl w-full max-w-xs transition-all
            ${room.currentTurn === playerId ? 'active-turn' : ''}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-semibold text-white">{currentPlayer.name}</span>
              <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                {currentPlayer.hasSeen ? '👁 Seen' : '🙈 Blind'}
              </span>
            </div>
            <div className="text-sm text-gold font-bold">{currentPlayer.chips} chips</div>
          </div>

          {/* Player's cards */}
          <PlayerCards
            cards={currentPlayer.hand}
            faceUp={currentPlayer.hasSeen || room.status === 'roundEnd'}
            variation={room.variation}
            jokerCard={room.jokerCard}
            selectedIndices={room.variation === 'bestOfFour' ? (currentPlayer.selectedCards || selectedCards) : undefined}
            onSelectCard={room.variation === 'bestOfFour' && !currentPlayer.selectedCards ? handleCardSelect : undefined}
            size="lg"
          />

          {/* Best of Four selection prompt */}
          {room.variation === 'bestOfFour' && currentPlayer.hand.length === 4 && !currentPlayer.selectedCards && (
            <p className="text-xs text-gold mt-2 animate-pulse">Tap 3 cards to select your hand</p>
          )}

          {currentPlayer.isFolded && (
            <div className="text-red-400 text-sm font-semibold mt-2">You folded this round</div>
          )}
        </div>
      )}

      {/* Action Log */}
      <div className="px-4 mb-4">
        <ActionLog entries={room.actionLog || []} />
      </div>

      {/* Action Bar */}
      <ActionBar
        room={room}
        playerId={playerId}
        onAction={onAction}
        loading={loading}
      />

      {/* Winner Modal */}
      <WinnerModal
        room={room}
        onNextRound={onNextRound}
        isHost={isHost}
      />
    </div>
  );
}
