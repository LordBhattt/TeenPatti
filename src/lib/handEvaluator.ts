// ============================================================
// Hand Evaluator — supports all 5 Teen Patti variations
// ============================================================

import {
  Card, HandType, HandEvaluation, GameVariation,
  RANK_DISPLAY, Rank,
} from './types';

// ── Helpers ──────────────────────────────────────────────────

function sortDesc(a: number, b: number): number {
  return b - a;
}

/** Check if three values form a sequence (consecutive). Handles A-2-3 wrap. */
function isSequential(values: number[]): boolean {
  const sorted = [...values].sort((a, b) => a - b);
  // Normal consecutive: e.g., 5-6-7
  if (sorted[1] - sorted[0] === 1 && sorted[2] - sorted[1] === 1) return true;
  // A-2-3 wrap (values 14, 2, 3) — A plays low
  if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 14) return true;
  return false;
}

/** Get the "sequence high" value for tiebreaking. A-2-3 has high=3 (lowest sequence). */
function sequenceHighValue(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  // A-2-3: treat as [1, 2, 3], high = 3
  if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 14) {
    return [3, 2, 1];
  }
  return sorted.sort(sortDesc);
}

function allSameSuit(cards: Card[]): boolean {
  return cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
}

// ── Core Evaluator (no wilds) ────────────────────────────────

/**
 * Evaluate a 3-card hand (no wild cards) and return its HandEvaluation.
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 3) throw new Error('Hand must have exactly 3 cards');

  const values = cards.map(c => c.value);
  const sorted = [...values].sort(sortDesc);
  const sameSuit = allSameSuit(cards);
  const sequential = isSequential(values);

  // Trail (Three of a kind)
  if (sorted[0] === sorted[1] && sorted[1] === sorted[2]) {
    return {
      type: HandType.TRAIL,
      values: [sorted[0]],
      displayName: `Trail of ${RANK_DISPLAY[cards[0].rank]}s`,
    };
  }

  // Pure Sequence (Straight Flush)
  if (sameSuit && sequential) {
    const seqValues = sequenceHighValue(values);
    return {
      type: HandType.PURE_SEQUENCE,
      values: seqValues,
      displayName: `Pure Sequence (${cards.map(c => RANK_DISPLAY[c.rank]).join('-')})`,
    };
  }

  // Sequence (Straight)
  if (sequential) {
    const seqValues = sequenceHighValue(values);
    return {
      type: HandType.SEQUENCE,
      values: seqValues,
      displayName: `Sequence (${cards.map(c => RANK_DISPLAY[c.rank]).join('-')})`,
    };
  }

  // Color (Flush)
  if (sameSuit) {
    return {
      type: HandType.COLOR,
      values: sorted,
      displayName: `Color (${sorted.map(v => rankFromValue(v)).join('-')})`,
    };
  }

  // Pair
  if (sorted[0] === sorted[1]) {
    // First two are the pair, third is kicker
    return {
      type: HandType.PAIR,
      values: [sorted[0], sorted[2]],
      displayName: `Pair of ${rankFromValue(sorted[0])}s`,
    };
  }
  if (sorted[1] === sorted[2]) {
    // Last two are the pair, first is kicker
    return {
      type: HandType.PAIR,
      values: [sorted[1], sorted[0]],
      displayName: `Pair of ${rankFromValue(sorted[1])}s`,
    };
  }

  // High Card
  return {
    type: HandType.HIGH_CARD,
    values: sorted,
    displayName: `High Card ${rankFromValue(sorted[0])}`,
  };
}

function rankFromValue(value: number): string {
  const map: Record<number, string> = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
    8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
  };
  return map[value] || String(value);
}

// ── Wild Card Evaluation ─────────────────────────────────────

const ALL_RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const ALL_SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

const RANK_VALUE_MAP: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/**
 * Check if a card is a wild card given the variation context.
 */
export function isWildCard(card: Card, variation: GameVariation, jokerCard?: Card): boolean {
  if (variation === 'ak47') {
    return card.rank === 'A' || card.rank === 'K' || card.rank === '4' || card.rank === '7';
  }
  if (variation === 'joker' && jokerCard) {
    return card.rank === jokerCard.rank;
  }
  return false;
}

/**
 * Evaluate a hand with wild card substitution.
 * Tries all possible substitutions for wild cards and returns the best hand.
 */
export function evaluateHandWithWilds(
  cards: Card[],
  variation: GameVariation,
  jokerCard?: Card
): HandEvaluation {
  const wildIndices: number[] = [];
  for (let i = 0; i < cards.length; i++) {
    if (isWildCard(cards[i], variation, jokerCard)) {
      wildIndices.push(i);
    }
  }

  if (wildIndices.length === 0) {
    return evaluateHand(cards);
  }

  // If all 3 are wild, best possible is Trail of Aces
  if (wildIndices.length === 3) {
    return {
      type: HandType.TRAIL,
      values: [14],
      displayName: 'Trail of As (Wild)',
    };
  }

  let bestEval: HandEvaluation = evaluateHand(cards); // fallback: evaluate as-is

  // Generate all possible substitutions for wild cards
  const substitutions = generateSubstitutions(cards, wildIndices);
  for (const sub of substitutions) {
    const eval_ = evaluateHand(sub);
    if (compareEvaluations(eval_, bestEval) > 0) {
      bestEval = { ...eval_, displayName: eval_.displayName + ' (Wild)' };
    }
  }

  return bestEval;
}

/**
 * Generate all possible card substitutions for wild cards.
 * Optimized: only generate unique rank/suit combos that matter.
 */
function generateSubstitutions(cards: Card[], wildIndices: number[]): Card[][] {
  const results: Card[][] = [];
  const possibleCards: Card[] = [];
  
  // Generate all 52 possible replacement cards
  for (const suit of ALL_SUITS) {
    for (const rank of ALL_RANKS) {
      possibleCards.push({ suit, rank, value: RANK_VALUE_MAP[rank] });
    }
  }

  if (wildIndices.length === 1) {
    const wi = wildIndices[0];
    for (const replacement of possibleCards) {
      const newHand = [...cards];
      newHand[wi] = replacement;
      results.push(newHand);
    }
  } else if (wildIndices.length === 2) {
    const [wi1, wi2] = wildIndices;
    for (const r1 of possibleCards) {
      for (const r2 of possibleCards) {
        const newHand = [...cards];
        newHand[wi1] = r1;
        newHand[wi2] = r2;
        results.push(newHand);
      }
    }
  }

  return results;
}

// ── Comparison ───────────────────────────────────────────────

/**
 * Compare two hand evaluations. Returns:
 *   >0 if a is better, <0 if b is better, 0 if equal.
 */
export function compareEvaluations(a: HandEvaluation, b: HandEvaluation): number {
  if (a.type !== b.type) return a.type - b.type;
  // Same hand type — compare tiebreaker values
  for (let i = 0; i < Math.max(a.values.length, b.values.length); i++) {
    const av = a.values[i] ?? 0;
    const bv = b.values[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

/**
 * Compare two hands for Muflis (reversed ranking).
 * Lower hand wins, so we flip the comparison.
 */
export function compareEvaluationsMuflis(a: HandEvaluation, b: HandEvaluation): number {
  return -compareEvaluations(a, b);
}

// ── Best of Four ─────────────────────────────────────────────

/**
 * Given 4 cards, find the best 3-card combination.
 * Returns the indices of the best 3 cards and their evaluation.
 */
export function bestOfFourEvaluation(cards: Card[]): {
  bestIndices: number[];
  evaluation: HandEvaluation;
} {
  if (cards.length !== 4) throw new Error('Best of Four requires exactly 4 cards');

  const combos: number[][] = [
    [0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3],
  ];

  let bestIndices = combos[0];
  let bestEval = evaluateHand(combos[0].map(i => cards[i]));

  for (let c = 1; c < combos.length; c++) {
    const hand = combos[c].map(i => cards[i]);
    const eval_ = evaluateHand(hand);
    if (compareEvaluations(eval_, bestEval) > 0) {
      bestEval = eval_;
      bestIndices = combos[c];
    }
  }

  return { bestIndices, evaluation: bestEval };
}

// ── Main Variation-Aware Evaluator ───────────────────────────

/**
 * Evaluate a player's hand according to the game variation.
 */
export function evaluatePlayerHand(
  cards: Card[],
  variation: GameVariation,
  jokerCard?: Card,
  selectedIndices?: number[],
): HandEvaluation {
  // Best of Four: use selected 3 cards (or auto-best)
  if (variation === 'bestOfFour' && cards.length === 4) {
    if (selectedIndices && selectedIndices.length === 3) {
      return evaluateHand(selectedIndices.map(i => cards[i]));
    }
    return bestOfFourEvaluation(cards).evaluation;
  }

  // Ensure 3-card hand
  const hand = cards.slice(0, 3);

  // Wild-card variations
  if (variation === 'ak47' || variation === 'joker') {
    return evaluateHandWithWilds(hand, variation, jokerCard);
  }

  // Classic and Muflis use same evaluation; Muflis reverses comparison
  return evaluateHand(hand);
}

/**
 * Compare two players' hands according to the game variation.
 * Returns >0 if player A wins, <0 if player B wins, 0 if tie.
 */
export function comparePlayerHands(
  handA: Card[],
  handB: Card[],
  variation: GameVariation,
  jokerCard?: Card,
  selectedA?: number[],
  selectedB?: number[],
): number {
  const evalA = evaluatePlayerHand(handA, variation, jokerCard, selectedA);
  const evalB = evaluatePlayerHand(handB, variation, jokerCard, selectedB);

  if (variation === 'muflis') {
    return compareEvaluationsMuflis(evalA, evalB);
  }
  return compareEvaluations(evalA, evalB);
}

/**
 * Determine the winner among active (non-folded) players.
 * Returns the winning player's ID.
 */
export function determineWinner(
  players: Record<string, { hand: Card[]; isFolded: boolean; selectedCards?: number[] }>,
  variation: GameVariation,
  jokerCard?: Card,
): { winnerId: string; evaluation: HandEvaluation } {
  const activePlayers = Object.entries(players).filter(([, p]) => !p.isFolded);
  
  if (activePlayers.length === 0) throw new Error('No active players');
  if (activePlayers.length === 1) {
    const [id, p] = activePlayers[0];
    return {
      winnerId: id,
      evaluation: evaluatePlayerHand(p.hand, variation, jokerCard, p.selectedCards),
    };
  }

  let winnerId = activePlayers[0][0];
  let winnerHand = activePlayers[0][1];

  for (let i = 1; i < activePlayers.length; i++) {
    const [id, p] = activePlayers[i];
    const cmp = comparePlayerHands(
      winnerHand.hand, p.hand, variation, jokerCard,
      winnerHand.selectedCards, p.selectedCards
    );
    if (cmp < 0) {
      // Challenger wins
      winnerId = id;
      winnerHand = p;
    } else if (cmp === 0) {
      // Tie: player who comes later in the comparison loses (show requester loses)
      // Keep current winner
    }
  }

  return {
    winnerId,
    evaluation: evaluatePlayerHand(winnerHand.hand, variation, jokerCard, winnerHand.selectedCards),
  };
}
