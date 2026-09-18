'use client';

import { Card as CardType, GameVariation } from '@/lib/types';
import { isWildCard } from '@/lib/handEvaluator';
import Card from './Card';

interface PlayerCardsProps {
  cards: CardType[];
  faceUp: boolean;
  variation: GameVariation;
  jokerCard?: CardType;
  selectedIndices?: number[];
  onSelectCard?: (index: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function PlayerCards({
  cards, faceUp, variation, jokerCard,
  selectedIndices, onSelectCard, size = 'md'
}: PlayerCardsProps) {
  if (!cards || cards.length === 0) {
    return (
      <div className="flex gap-1.5 justify-center opacity-30">
        {[0,1,2].map(i => <Card key={i} faceUp={false} size={size} />)}
      </div>
    );
  }

  const animClass = ['animate-deal', 'animate-deal-1', 'animate-deal-2', 'animate-deal-3'];

  return (
    <div className="flex gap-1.5 justify-center">
      {cards.map((card, i) => (
        <div key={`${card.suit}-${card.rank}-${i}`} className={`card-deal ${animClass[i] || 'animate-deal'}`}>
          <Card
            card={card}
            faceUp={faceUp}
            size={size}
            isWild={faceUp && (variation === 'ak47' || variation === 'joker') && isWildCard(card, variation, jokerCard)}
            selected={selectedIndices?.includes(i)}
            onClick={onSelectCard ? () => onSelectCard(i) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
