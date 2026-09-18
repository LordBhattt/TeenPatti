// ============================================================
// Deck Management: Creation, Shuffle, and Dealing
// ============================================================

import { Card, Suit, Rank } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/**
 * Creates a standard 52-card deck.
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: RANK_VALUES[rank] });
    }
  }
  return deck;
}

/**
 * Generates an unbiased random integer in [0, max] using
 * crypto.getRandomValues when available, else Math.random fallback.
 */
function secureRandomInt(max: number): number {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    const range = max + 1;
    const maxValid = Math.floor(0xFFFFFFFF / range) * range;
    let rand: number;
    do {
      globalThis.crypto.getRandomValues(array);
      rand = array[0];
    } while (rand >= maxValid);
    return rand % range;
  }
  return Math.floor(Math.random() * (max + 1));
}

/**
 * Fisher-Yates (Durstenfeld) shuffle — O(n), unbiased.
 * Returns a new shuffled array; does not mutate the input.
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = secureRandomInt(i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Deals cards to players in round-robin fashion (authentic dealer pattern).
 * Returns the dealt hands and the remaining deck.
 */
export function dealCards(
  playerIds: string[],
  cardsPerPlayer: number = 3
): { hands: Record<string, Card[]>; remainingDeck: Card[]; fullDeck: Card[] } {
  const deck = shuffleDeck(createDeck());
  const hands: Record<string, Card[]> = {};

  for (const id of playerIds) {
    hands[id] = [];
  }

  let cardIndex = 0;
  for (let round = 0; round < cardsPerPlayer; round++) {
    for (const id of playerIds) {
      hands[id].push(deck[cardIndex++]);
    }
  }

  return {
    hands,
    remainingDeck: deck.slice(cardIndex),
    fullDeck: deck,
  };
}
