'use client';

import { Card as CardType, GameVariation } from '@/lib/types';
import { isWildCard } from '@/lib/handEvaluator';
import Card from './Card';

const WILD_VARIATIONS: GameVariation[] = [
  'ak47', 'joker', 'lallanKallan', 'hiLowJoker', 'kissMissBliss', 'rotatingJoker',
];

interface PlayerCardsProps {
  cards: CardType[];
  faceUp: boolean;
  variation: GameVariation;
  jokerCard?: CardType;
  selectedIndices?: number[];
  onSelectCard?: (index: number) => void;
  size?: 'sm' | 'md' | 'lg';
  personalWilds?: number[];
  tableJokers?: CardType[];
}

export default function PlayerCards({
  cards, faceUp, variation, jokerCard,
  selectedIndices, onSelectCard, size = 'md',
  personalWilds, tableJokers,
}: PlayerCardsProps) {
  if (!cards || cards.length === 0) {
    return (
      <div className="flex gap-1.5 justify-center opacity-30">
        {[0,1,2].map(i => <Card key={i} faceUp={false} size={size} />)}
      </div>
    );
  }

  const animClass = ['animate-deal', 'animate-deal-1', 'animate-deal-2', 'animate-deal-3'];
  const hasWilds = WILD_VARIATIONS.includes(variation);

  return (
    <div className="flex gap-1.5 justify-center">
      {cards.map((card, i) => (
        <div key={`${card.suit}-${card.rank}-${i}`} className={`card-deal ${animClass[i] || 'animate-deal'}`}>
          <Card
            card={card}
            faceUp={faceUp}
            size={size}
            isWild={faceUp && hasWilds && isWildCard(card, variation, jokerCard, i, personalWilds, tableJokers)}
            selected={selectedIndices?.includes(i)}
            onClick={onSelectCard ? () => onSelectCard(i) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
