// ============================================================
// Hand Evaluator — supports all 10 Teen Patti variations
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
export function isWildCard(
  card: Card,
  variation: GameVariation,
  jokerCard?: Card,
  cardIndex?: number,
  personalWilds?: number[],
  tableJokers?: Card[],
): boolean {
  if (variation === 'ak47') {
    return card.rank === 'A' || card.rank === 'K' || card.rank === '4' || card.rank === '7';
  }
  if (variation === 'joker' && jokerCard) {
    return card.rank === jokerCard.rank;
  }
  if (variation === 'lallanKallan') {
    return card.suit === 'spades' || card.suit === 'clubs';
  }
  if ((variation === 'hiLowJoker' || variation === 'kissMissBliss') && personalWilds && cardIndex !== undefined) {
    return personalWilds.includes(cardIndex);
  }
  if (variation === 'rotatingJoker' && tableJokers) {
    return tableJokers.some(j => j.rank === card.rank);
  }
  return false;
}

export function getHiLowWildIndices(cards: Card[]): number[] {
  if (cards.length < 3) return [];
  const v0 = cards[0].value;
  const v1 = cards[1].value;
  const v2 = cards[2].value;

  // If all three have the same value, it's already a natural trail
  if (v0 === v1 && v1 === v2) {
    return [0, 1];
  }

  // If there's a pair, that pair counts as the jokers (exactly 2 jokers)
  if (v0 === v1) return [0, 1];
  if (v1 === v2) return [1, 2];
  if (v0 === v2) return [0, 2];

  // All 3 cards distinct: highest and lowest are jokers
  const values = [v0, v1, v2];
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const maxIdx = values.indexOf(maxVal);
  const minIdx = values.indexOf(minVal);
  return [maxIdx, minIdx];
}

function checkKMBPair(c1: Card, c2: Card): 'bliss' | 'kiss' | 'miss' | 'none' {
  const v1 = c1.value;
  const v2 = c2.value;
  const diff = Math.abs(v1 - v2);
  if (diff === 0) return 'bliss';
  if (diff === 1 || (v1 === 14 && v2 === 2) || (v1 === 2 && v2 === 14)) return 'kiss';
  if (diff === 2 || (v1 === 14 && v2 === 3) || (v1 === 3 && v2 === 14)) return 'miss';
  return 'none';
}

export function getKMBPattern(cards: Card[]): { pattern: 'kiss' | 'miss' | 'bliss' | 'none'; wildIndices: number[] } {
  if (cards.length < 3) return { pattern: 'none', wildIndices: [] };

  // Check pairs with priority: bliss (pair) > kiss (consecutive) > miss (skip one)
  const pairs: [number, number][] = [[0, 1], [0, 2], [1, 2]];
  const patterns: ('bliss' | 'kiss' | 'miss')[] = ['bliss', 'kiss', 'miss'];

  for (const targetPattern of patterns) {
    for (const [i, j] of pairs) {
      if (checkKMBPair(cards[i], cards[j]) === targetPattern) {
        // The remaining third card becomes the joker
        const wildIdx = [0, 1, 2].find(k => k !== i && k !== j)!;
        return { pattern: targetPattern, wildIndices: [wildIdx] };
      }
    }
  }

  return { pattern: 'none', wildIndices: [] };
}

function cardPointValue(card: Card): number {
  if (card.rank === 'A') return 1;
  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') return 10;
  return card.value; // 2-10
}

export function evaluate999Hand(cards: Card[]): HandEvaluation {
  const hand = cards.slice(0, 3);
  const total = hand.reduce((sum, c) => sum + cardPointValue(c), 0);
  const isTripleNine = hand.every(c => c.rank === '9');

  if (isTripleNine) {
    return {
      type: HandType.TRAIL,
      values: [999],
      displayName: 'Triple 9 — 27 points',
    };
  }

  const distance = Math.abs(27 - total);
  return {
    type: HandType.HIGH_CARD,
    values: [100 - distance, total],
    displayName: distance === 0 ? '27 points — perfect' : `${total} points (${distance} from 27)`,
  };
}

function evaluateHandWithWildIndices(cards: Card[], wildIndices: number[]): HandEvaluation {
  if (wildIndices.length === 0) return evaluateHand(cards);
  if (wildIndices.length === 3) {
    return { type: HandType.TRAIL, values: [14], displayName: 'Trail of As (Wild)' };
  }
  let bestEval: HandEvaluation = evaluateHand(cards);
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

function compare999Evaluations(a: HandEvaluation, b: HandEvaluation): number {
  // Triple 9 (values[0] === 999) beats everything
  const aTriple = a.values[0] === 999;
  const bTriple = b.values[0] === 999;
  if (aTriple && !bTriple) return 1;
  if (!aTriple && bTriple) return -1;
  if (aTriple && bTriple) return 0;
  // Compare closeness to 27 (values[0] = 100 - distance, higher is better)
  if (a.values[0] !== b.values[0]) return a.values[0] - b.values[0];
  // Tiebreak: higher total wins
  return (a.values[1] || 0) - (b.values[1] || 0);
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
  personalWilds?: number[],
  tableJokers?: Card[],
): HandEvaluation {
  // 999 — completely different scoring
  if (variation === 'nineNineNine') {
    return evaluate999Hand(cards);
  }

  // Best of Four
  if (variation === 'bestOfFour' && cards.length === 4) {
    if (selectedIndices && selectedIndices.length === 3) {
      return evaluateHand(selectedIndices.map(i => cards[i]));
    }
    return bestOfFourEvaluation(cards).evaluation;
  }

  const hand = cards.slice(0, 3);

  // AK-47 / Joker — use existing evaluateHandWithWilds
  if (variation === 'ak47' || variation === 'joker') {
    return evaluateHandWithWilds(hand, variation, jokerCard);
  }

  // Lallan-Kallan: black cards are wild
  if (variation === 'lallanKallan') {
    const wilds = hand.map((c, i) => (c.suit === 'spades' || c.suit === 'clubs') ? i : -1).filter(i => i >= 0);
    return evaluateHandWithWildIndices(hand, wilds);
  }

  // Hi-Low Joker: per-player wilds
  if (variation === 'hiLowJoker') {
    const wilds = personalWilds || getHiLowWildIndices(hand);
    return evaluateHandWithWildIndices(hand, wilds);
  }

  // Kiss-Miss-Bliss: per-player wilds (index 2 if pattern found)
  if (variation === 'kissMissBliss') {
    const wilds = personalWilds || getKMBPattern(hand).wildIndices;
    return evaluateHandWithWildIndices(hand, wilds);
  }

  // Rotating Joker: table jokers are wild
  if (variation === 'rotatingJoker' && tableJokers) {
    const wilds = hand.map((c, i) => tableJokers.some(j => j.rank === c.rank) ? i : -1).filter(i => i >= 0);
    return evaluateHandWithWildIndices(hand, wilds);
  }

  // Classic and Muflis
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
  personalWildsA?: number[],
  personalWildsB?: number[],
  tableJokers?: Card[],
): number {
  const evalA = evaluatePlayerHand(handA, variation, jokerCard, selectedA, personalWildsA, tableJokers);
  const evalB = evaluatePlayerHand(handB, variation, jokerCard, selectedB, personalWildsB, tableJokers);

  if (variation === 'muflis') {
    return compareEvaluationsMuflis(evalA, evalB);
  }
  if (variation === 'nineNineNine') {
    return compare999Evaluations(evalA, evalB);
  }
  return compareEvaluations(evalA, evalB);
}

/**
 * Determine the winner among active (non-folded) players.
 * Returns the winning player's ID.
 */
export function determineWinner(
  players: Record<string, { hand: Card[]; isFolded: boolean; selectedCards?: number[]; personalWilds?: number[] }>,
  variation: GameVariation,
  jokerCard?: Card,
  tableJokers?: Card[],
): { winnerId: string; evaluation: HandEvaluation } {
  const activePlayers = Object.entries(players).filter(([, p]) => !p.isFolded);
  
  if (activePlayers.length === 0) throw new Error('No active players');
  if (activePlayers.length === 1) {
    const [id, p] = activePlayers[0];
    return {
      winnerId: id,
      evaluation: evaluatePlayerHand(p.hand, variation, jokerCard, p.selectedCards, p.personalWilds, tableJokers),
    };
  }

  let winnerId = activePlayers[0][0];
  let winnerData = activePlayers[0][1];

  for (let i = 1; i < activePlayers.length; i++) {
    const [id, p] = activePlayers[i];
    const cmp = comparePlayerHands(
      winnerData.hand, p.hand, variation, jokerCard,
      winnerData.selectedCards, p.selectedCards,
      winnerData.personalWilds, p.personalWilds,
      tableJokers
    );
    if (cmp < 0) {
      // Challenger wins
      winnerId = id;
      winnerData = p;
    } else if (cmp === 0) {
      // Tie: player who comes later in the comparison loses (show requester loses)
      // Keep current winner
    }
  }

  return {
    winnerId,
    evaluation: evaluatePlayerHand(winnerData.hand, variation, jokerCard, winnerData.selectedCards, winnerData.personalWilds, tableJokers),
  };
}
