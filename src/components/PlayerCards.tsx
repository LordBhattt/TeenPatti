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
    return <div className="flex gap-1 opacity-50">
      {[0,1,2].map(i => <Card key={i} faceUp={false} size={size} />)}
    </div>;
  }

  return (
    <div className="flex gap-1.5 justify-center">
      {cards.map((card, i) => (
        <Card
          key={`${card.suit}-${card.rank}-${i}`}
          card={card}
          faceUp={faceUp}
          size={size}
          isWild={faceUp && (variation === 'ak47' || variation === 'joker') && isWildCard(card, variation, jokerCard)}
          selected={selectedIndices?.includes(i)}
          onClick={onSelectCard ? () => onSelectCard(i) : undefined}
        />
      ))}
    </div>
  );
}
