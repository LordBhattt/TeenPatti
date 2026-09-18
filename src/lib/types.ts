// ============================================================
// Core Types for Teen Patti (3 Patti) Multiplayer Game
// ============================================================

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  /** Numeric value: 2=2, 3=3, ..., J=11, Q=12, K=13, A=14 */
  value: number;
}

// Hand ranking types, ordered from strongest to weakest
export enum HandType {
  TRAIL = 6,          // Three of a kind
  PURE_SEQUENCE = 5,  // Straight flush
  SEQUENCE = 4,       // Straight
  COLOR = 3,          // Flush
  PAIR = 2,           // Two of a kind
  HIGH_CARD = 1,      // Nothing
}

export interface HandEvaluation {
  type: HandType;
  /** Values used for tiebreaking, highest first. 
   *  e.g., for PAIR: [pairValue, kicker], for HIGH_CARD: [high, mid, low] */
  values: number[];
  /** Human-readable name like "Trail of Kings" */
  displayName: string;
}

export type GameVariation = 'classic' | 'ak47' | 'muflis' | 'joker' | 'bestOfFour';

export type RoomStatus = 'waiting' | 'playing' | 'showdown' | 'roundEnd';

export type PlayerAction = 
  | { type: 'blind' }
  | { type: 'see' }
  | { type: 'chaal' }
  | { type: 'raise'; amount: number }
  | { type: 'fold' }
  | { type: 'show' }
  | { type: 'selectCards'; selectedIndices: number[] };

export interface ActionLogEntry {
  playerId: string;
  playerName: string;
  action: string;
  amount?: number;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  /** Cards in hand (3 for normal, 4 for bestOfFour before selection) */
  hand: Card[];
  /** Selected 3-card indices for bestOfFour variation */
  selectedCards?: number[];
  hasSeen: boolean;
  isFolded: boolean;
  isConnected: boolean;
  /** Total bet this round */
  currentRoundBet: number;
}

export interface Room {
  id: string;
  hostId: string;
  variation: GameVariation;
  bootAmount: number;
  startingChips: number;
  status: RoomStatus;
  pot: number;
  /** Current blind-equivalent stake (seen players pay 2x this) */
  currentBet: number;
  /** ID of player whose turn it is */
  currentTurn: string;
  /** Index of dealer in playerOrder */
  dealerIndex: number;
  /** Ordered array of player IDs for turn rotation */
  playerOrder: string[];
  /** Map of playerId -> Player */
  players: Record<string, Player>;
  actionLog: ActionLogEntry[];
  /** Revealed joker card for 'joker' variation */
  jokerCard?: Card;
  /** Current round number */
  round: number;
  /** Winner of the last round */
  lastWinner?: {
    playerId: string;
    playerName: string;
    handType: string;
    potWon: number;
  };
  /** Remaining deck (stored for joker reveal) */
  deck?: Card[];
  createdAt: number;
}

// Display helpers
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export const RANK_DISPLAY: Record<Rank, string> = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
  '7': '7', '8': '8', '9': '9', '10': '10',
  'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A',
};

export const VARIATION_NAMES: Record<GameVariation, string> = {
  classic: 'Classic',
  ak47: 'AK-47',
  muflis: 'Muflis (Lowball)',
  joker: 'Joker',
  bestOfFour: 'Best of Four',
};

export const HAND_TYPE_NAMES: Record<HandType, string> = {
  [HandType.TRAIL]: 'Trail',
  [HandType.PURE_SEQUENCE]: 'Pure Sequence',
  [HandType.SEQUENCE]: 'Sequence',
  [HandType.COLOR]: 'Color',
  [HandType.PAIR]: 'Pair',
  [HandType.HIGH_CARD]: 'High Card',
};
