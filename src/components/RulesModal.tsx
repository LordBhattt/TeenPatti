'use client';

import { GameVariation, VARIATION_NAMES } from '@/lib/types';

interface RulesModalProps {
  variation: GameVariation;
  onClose: () => void;
}

const RULES: Record<GameVariation, { summary: string; example: string }> = {
  classic: {
    summary: 'The original Teen Patti. Each player gets 3 face-down cards. Hands are ranked from best to worst: Trail (three of the same rank) is the best, then Pure Sequence (three in a row, same suit), then Sequence (three in a row, mixed suits), then Color (three of the same suit, not in a row), then Pair, then High Card as the weakest.',
    example: 'A player with K\u2660-K\u2666-9\u2663 (a pair of Kings) beats a player with A\u2665-J\u2666-4\u2660 (just a high Ace), because a pair always beats a high card no matter how big the high card is.',
  },
  ak47: {
    summary: 'Every Ace, King, 4, and 7 in the deck (any suit) is a joker \u2014 meaning it can be turned into any card the player needs. Regular hand rankings still apply once jokers are substituted.',
    example: 'A player dealt A\u2660-K\u2666-4\u2660 has three jokers, so they can turn all three into any cards they like \u2014 even three Aces (A-A-A), the best possible trail.',
  },
  muflis: {
    summary: 'Everything is flipped. Instead of the best hand winning, the worst hand wins. A Trail is now the weakest possible hand, and a plain High Card is the strongest.',
    example: 'A player holding K\u2663-2\u2666-3\u2663 (just a high card, normally weak) beats a player holding K\u2665-K\u2666-9\u2663 (a pair, normally strong), because in Muflis a pair is worse than a high card.',
  },
  joker: {
    summary: 'Before cards are dealt, one card is revealed from the deck. Every card of that same rank (any suit) becomes a joker for the round \u2014 it can substitute for any card you need. A new joker is picked each round.',
    example: 'If the revealed card is a 9, all four 9s become jokers. A player dealt 9\u2660-K\u2666-K\u2663 can turn their 9 into a third King, making three Kings (K-K-K).',
  },
  bestOfFour: {
    summary: 'Each player is dealt 4 cards instead of 3. Look at all 4, then privately choose your best 3 to play \u2014 the leftover card is discarded. Standard hand ranking applies to your chosen 3.',
    example: 'Dealt 5\u2663-5\u2666-9\u2665-K\u2660, a player would keep the two 5s plus one other card to play a pair, rather than keeping the King and 9 with no pair.',
  },
  hiLowJoker: {
    summary: 'Look at your 3 cards. Whichever card is your highest and whichever is your lowest both automatically become jokers for you. If you have a pair, both pair cards count as jokers too. Each player\u2019s jokers come from their own hand.',
    example: 'A player is dealt 2\u2663-7\u2666-K\u2660. The 2 is the lowest and the K is the highest, so both become jokers, leaving only the 7 as a real card. They can turn the two jokers into two more 7s, making three 7s.',
  },
  lallanKallan: {
    summary: 'All black cards (Spades \u2660 and Clubs \u2663) are jokers \u2014 they can become any card you need. All red cards (Hearts \u2665 and Diamonds \u2666) stay normal and cannot be changed.',
    example: 'A player is dealt 5\u2660-9\u2663-10\u2666. The 5\u2660 and 9\u2663 are black, so both are wild. The 10\u2666 is red. They can turn the two black cards into two more 10s, making three 10s.',
  },
  nineNineNine: {
    summary: 'Forget standard hand rankings. Each card has a point value: number cards equal their number, J/Q/K are worth 10, Ace is worth 1. Add up your 3 cards. Whoever\u2019s total is closest to 27 wins. Three real 9s (9+9+9=27) is an instant win.',
    example: 'Player A has 9\u2660-8\u2665-K\u2666 = 9+8+10 = 27 points (perfect). Player B has 6\u2663-Q\u2666-A\u2660 = 6+10+1 = 17 points. Player A wins because 27 is a perfect score.',
  },
  kissMissBliss: {
    summary: 'After seeing your 3 cards, check if the first two match a pattern. "Kiss" means they\u2019re consecutive (like 6 and 7). "Miss" means they skip one number (like 5 and 7). "Bliss" means they\u2019re a pair (like two 8s). If any pattern matches, your third card becomes a joker. If none match, you play normally.',
    example: 'A player is dealt 6\u2666-7\u2660-K\u2663. The 6 and 7 are consecutive \u2014 that\u2019s a Kiss. Their third card (K) becomes a joker, so they can turn it into another 6 or 7 to make a pair or better.',
  },
  rotatingJoker: {
    summary: 'At round start, 3 cards are flipped face-up on the table \u2014 these are shared jokers for everyone. Every time a player folds, one table joker is swapped for a new random card from the deck. The jokers keep changing until showdown.',
    example: 'Round starts with 4\u2660-J\u2665-2\u2666 as table jokers. A player folds, so the 4\u2660 is swapped for a random new card, say 8\u2663. Now the table jokers are 8\u2663-J\u2665-2\u2666 for everyone still playing.',
  },
};

export default function RulesModal({ variation, onClose }: RulesModalProps) {
  const rules = RULES[variation];
  const name = VARIATION_NAMES[variation];

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded w-full max-w-sm max-h-[80dvh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-serif text-lg text-primary">{name}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors text-lg leading-none px-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-4">
          <p className="text-primary/90 text-sm leading-relaxed">{rules.summary}</p>
          <div>
            <p className="text-muted text-xs mb-1">Example</p>
            <p className="text-primary/70 text-sm leading-relaxed">{rules.example}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
