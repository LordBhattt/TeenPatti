'use client';

import { useState, useEffect } from 'react';
import { Room, PlayerAction, VARIATION_NAMES, SUIT_SYMBOLS, RANK_DISPLAY } from '@/lib/types';
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

  const handleCardSelect = (index: number) => {
    if (room.variation !== 'bestOfFour' || !currentPlayer || currentPlayer.hand.length !== 4) return;
    if (currentPlayer.selectedCards) return;

    setSelectedCards(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  };

  useEffect(() => {
    if (selectedCards.length === 3 && room.variation === 'bestOfFour') {
      onAction({ type: 'selectCards', selectedIndices: selectedCards });
    }
  }, [selectedCards]); // eslint-disable-line react-hooks/exhaustive-deps

  const KMB_LABELS = { kiss: 'Kiss', miss: 'Miss', bliss: 'Bliss', none: '' };

  return (
    <div className="table-surface min-h-[100dvh] flex flex-col pb-28">

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-muted text-xs">{VARIATION_NAMES[room.variation]}</span>
        <span className="text-muted text-xs">Round {room.round}</span>
      </div>

      {/* Joker indicator */}
      {room.jokerCard && room.variation === 'joker' && (
        <p className="text-center text-muted text-xs mb-2">
          Joker rank: <span className="text-primary font-serif">{RANK_DISPLAY[room.jokerCard.rank]}</span>
        </p>
      )}

      {/* Rotating Joker: show table joker cards */}
      {room.variation === 'rotatingJoker' && room.tableJokers && room.tableJokers.length > 0 && (
        <div className="text-center mb-3">
          <p className="text-muted text-[10px] mb-1.5">Table jokers</p>
          <div className="flex justify-center gap-2">
            {room.tableJokers.map((j, i) => (
              <span key={i} className="font-serif text-sm text-accent bg-surface border border-border rounded px-2 py-0.5">
                {RANK_DISPLAY[j.rank]}{SUIT_SYMBOLS[j.suit]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 999: show scoring hint */}
      {room.variation === 'nineNineNine' && (
        <p className="text-center text-muted text-[10px] mb-2">Closest to 27 wins</p>
      )}

      {/* Opponents */}
      <div className="flex justify-center gap-6 px-4 pt-2 pb-4">
        {opponents.map(id => {
          const p = room.players[id];
          if (!p) return null;
          const isActive = room.currentTurn === id;

          return (
            <div
              key={id}
              className={`flex flex-col items-center gap-2
                ${p.isFolded ? 'opacity-25' : ''}`}
            >
              <div className={`text-center ${isActive ? 'border-l-2 border-accent pl-2' : ''}`}>
                <p className="font-serif text-sm text-primary">{p.name}</p>
                <p className="text-muted text-xs font-serif">{p.chips}</p>
              </div>

              <PlayerCards
                cards={p.hand}
                faceUp={room.status === 'showdown' || room.status === 'roundEnd'}
                variation={room.variation}
                jokerCard={room.jokerCard}
                personalWilds={p.personalWilds}
                tableJokers={room.tableJokers}
                size="sm"
              />

              {p.isFolded && <span className="text-muted text-[10px]">folded</span>}
              {!p.isFolded && !p.hasSeen && isActive && (
                <span className="text-muted text-[10px]">blind</span>
              )}
              {p.kmbPattern && p.kmbPattern !== 'none' && (
                <span className="text-accent text-[10px]">{KMB_LABELS[p.kmbPattern]}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pot — center of the table */}
      <div className="flex flex-col items-center py-6">
        <p className="text-muted text-[10px] mb-1">Pot</p>
        <p className="font-serif text-4xl text-accent">{room.pot}</p>
        <p className="text-muted text-[10px] mt-1">stake {room.currentBet}</p>
      </div>

      {/* Current player */}
      {currentPlayer && (
        <div className="flex-1 flex flex-col items-center justify-end px-4 pb-4">
          {/* Status */}
          <div className={`text-center mb-3 ${room.currentTurn === playerId ? 'border-l-2 border-accent pl-3' : ''}`}>
            <p className="font-serif text-base text-primary">{currentPlayer.name}</p>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="font-serif text-sm text-muted">{currentPlayer.chips}</span>
              <span className="text-border">·</span>
              <span className="text-muted text-xs">{currentPlayer.hasSeen ? 'seen' : 'blind'}</span>
              {currentPlayer.kmbPattern && currentPlayer.kmbPattern !== 'none' && (
                <>
                  <span className="text-border">·</span>
                  <span className="text-accent text-xs">{KMB_LABELS[currentPlayer.kmbPattern]}</span>
                </>
              )}
            </div>
          </div>

          {/* Cards */}
          <PlayerCards
            cards={currentPlayer.hand}
            faceUp={currentPlayer.hasSeen || room.status === 'roundEnd'}
            variation={room.variation}
            jokerCard={room.jokerCard}
            personalWilds={currentPlayer.personalWilds}
            tableJokers={room.tableJokers}
            selectedIndices={room.variation === 'bestOfFour' ? (currentPlayer.selectedCards || selectedCards) : undefined}
            onSelectCard={room.variation === 'bestOfFour' && !currentPlayer.selectedCards ? handleCardSelect : undefined}
            size="lg"
          />

          {room.variation === 'bestOfFour' && currentPlayer.hand.length === 4 && !currentPlayer.selectedCards && (
            <p className="text-muted text-xs mt-2">Tap 3 cards to keep</p>
          )}

          {currentPlayer.isFolded && (
            <p className="text-card-red text-xs mt-2">Folded</p>
          )}
        </div>
      )}

      {/* Action log */}
      <div className="px-4">
        <ActionLog entries={room.actionLog || []} />
      </div>

      {/* Action bar */}
      <ActionBar
        room={room}
        playerId={playerId}
        onAction={onAction}
        loading={loading}
      />

      {/* Winner modal */}
      <WinnerModal
        room={room}
        onNextRound={onNextRound}
        isHost={isHost}
      />
    </div>
  );
}
