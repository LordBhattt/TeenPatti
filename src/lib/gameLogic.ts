// ============================================================
// Game Logic — State machine & action handlers
// Pure functions: take state in, return new state out
// ============================================================

import { Room, Player, PlayerAction, ActionLogEntry, GameVariation, Card } from './types';
import { dealCards } from './deck';
import { evaluatePlayerHand, comparePlayerHands } from './handEvaluator';

// ── Room Creation & Joining ──────────────────────────────────

/**
 * Generate a 6-character room code (uppercase alphanumeric).
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Create a new room with the host as the first player.
 */
export function createRoom(
  roomCode: string,
  hostId: string,
  hostName: string,
  variation: GameVariation = 'classic',
  bootAmount: number = 10,
  startingChips: number = 1000,
): Room {
  const player: Player = {
    id: hostId,
    name: hostName,
    chips: startingChips,
    hand: [],
    hasSeen: false,
    isFolded: false,
    isConnected: true,
    currentRoundBet: 0,
  };

  return {
    id: roomCode,
    hostId,
    variation,
    bootAmount,
    startingChips,
    status: 'waiting',
    pot: 0,
    currentBet: bootAmount,
    currentTurn: '',
    dealerIndex: 0,
    playerOrder: [hostId],
    players: { [hostId]: player },
    actionLog: [],
    round: 0,
    createdAt: Date.now(),
  };
}

/**
 * Add a player to an existing room.
 */
export function joinRoom(room: Room, playerId: string, playerName: string): Room {
  if (room.status !== 'waiting' && room.status !== 'roundEnd') {
    throw new Error('Cannot join while game is in progress');
  }
  if (room.playerOrder.length >= 4) {
    throw new Error('Room is full (max 4 players)');
  }
  if (room.players[playerId]) {
    // Player already in room — update connection status
    return {
      ...room,
      players: {
        ...room.players,
        [playerId]: { ...room.players[playerId], isConnected: true, name: playerName },
      },
    };
  }

  const player: Player = {
    id: playerId,
    name: playerName,
    chips: room.startingChips,
    hand: [],
    hasSeen: false,
    isFolded: false,
    isConnected: true,
    currentRoundBet: 0,
  };

  return {
    ...room,
    playerOrder: [...room.playerOrder, playerId],
    players: { ...room.players, [playerId]: player },
  };
}

// ── Round Management ─────────────────────────────────────────

/**
 * Start a new round: shuffle, deal, collect boot, set turns.
 */
export function startRound(room: Room): Room {
  const activePlayers = room.playerOrder.filter(
    id => room.players[id] && room.players[id].chips >= room.bootAmount
  );

  if (activePlayers.length < 2) {
    throw new Error('Need at least 2 players with enough chips to start');
  }

  const cardsPerPlayer = room.variation === 'bestOfFour' ? 4 : 3;
  const { hands, remainingDeck } = dealCards(activePlayers, cardsPerPlayer);

  // Advance dealer
  const newDealerIndex = (room.round === 0) ? 0 : (room.dealerIndex + 1) % activePlayers.length;
  // First player after dealer starts
  const firstTurnIndex = (newDealerIndex + 1) % activePlayers.length;

  // Collect boot from all players
  const players: Record<string, Player> = {};
  for (const id of room.playerOrder) {
    const p = room.players[id];
    if (activePlayers.includes(id)) {
      players[id] = {
        ...p,
        hand: hands[id],
        hasSeen: false,
        isFolded: false,
        isConnected: p.isConnected,
        chips: p.chips - room.bootAmount,
        currentRoundBet: room.bootAmount,
        selectedCards: undefined,
      };
    } else {
      // Player doesn't have enough chips — sits out
      players[id] = {
        ...p,
        hand: [],
        hasSeen: false,
        isFolded: true,
        currentRoundBet: 0,
      };
    }
  }

  const pot = activePlayers.length * room.bootAmount;

  // For joker variation, reveal the top remaining card
  let jokerCard: Card | undefined;
  if (room.variation === 'joker' && remainingDeck.length > 0) {
    jokerCard = remainingDeck[0];
  }

  const logEntry: ActionLogEntry = {
    playerId: 'system',
    playerName: 'System',
    action: `Round ${room.round + 1} started. Boot: ${room.bootAmount} chips each.`,
    timestamp: Date.now(),
  };

  return {
    ...room,
    status: 'playing',
    pot,
    currentBet: room.bootAmount,
    currentTurn: activePlayers[firstTurnIndex],
    dealerIndex: newDealerIndex,
    playerOrder: room.playerOrder, // Keep original order
    players,
    actionLog: [logEntry],
    jokerCard,
    round: room.round + 1,
    lastWinner: undefined,
    deck: remainingDeck,
  };
}

// ── Get Active Players ───────────────────────────────────────

function getActivePlayers(room: Room): string[] {
  return room.playerOrder.filter(id => {
    const p = room.players[id];
    return p && !p.isFolded;
  });
}

function getNextTurn(room: Room, currentId: string): string {
  const active = getActivePlayers(room);
  const idx = active.indexOf(currentId);
  if (idx === -1) return active[0];
  return active[(idx + 1) % active.length];
}

// ── Action Handlers ──────────────────────────────────────────

/**
 * Process a player action and return the updated room state.
 */
export function handleAction(room: Room, playerId: string, action: PlayerAction): Room {
  if (room.status !== 'playing') {
    throw new Error('Game is not in playing state');
  }
  if (room.currentTurn !== playerId) {
    throw new Error('Not your turn');
  }

  const player = room.players[playerId];
  if (!player || player.isFolded) {
    throw new Error('Player not found or already folded');
  }

  switch (action.type) {
    case 'see':
      return handleSee(room, playerId);
    case 'blind':
      return handleBlind(room, playerId);
    case 'chaal':
      return handleChaal(room, playerId);
    case 'raise':
      return handleRaise(room, playerId, action.amount);
    case 'fold':
      return handleFold(room, playerId);
    case 'show':
      return handleShow(room, playerId);
    case 'selectCards':
      return handleSelectCards(room, playerId, action.selectedIndices);
    default:
      throw new Error('Unknown action');
  }
}

/**
 * See cards (look at hand). Doesn't cost anything, just reveals cards.
 */
function handleSee(room: Room, playerId: string): Room {
  const player = room.players[playerId];
  if (player.hasSeen) {
    throw new Error('Already seen cards');
  }

  const log: ActionLogEntry = {
    playerId,
    playerName: player.name,
    action: 'looked at their cards',
    timestamp: Date.now(),
  };

  return {
    ...room,
    players: {
      ...room.players,
      [playerId]: { ...player, hasSeen: true },
    },
    actionLog: [...room.actionLog, log],
  };
}

/**
 * Blind bet — bet without seeing cards. Costs 1x current stake.
 */
function handleBlind(room: Room, playerId: string): Room {
  const player = room.players[playerId];
  if (player.hasSeen) {
    throw new Error('Cannot play blind after seeing cards');
  }

  const betAmount = room.currentBet; // 1x for blind
  if (player.chips < betAmount) {
    throw new Error('Not enough chips');
  }

  const log: ActionLogEntry = {
    playerId,
    playerName: player.name,
    action: 'played blind',
    amount: betAmount,
    timestamp: Date.now(),
  };

  const updatedRoom: Room = {
    ...room,
    pot: room.pot + betAmount,
    players: {
      ...room.players,
      [playerId]: {
        ...player,
        chips: player.chips - betAmount,
        currentRoundBet: player.currentRoundBet + betAmount,
      },
    },
    actionLog: [...room.actionLog, log],
  };

  // Move to next turn
  updatedRoom.currentTurn = getNextTurn(updatedRoom, playerId);
  return updatedRoom;
}

/**
 * Chaal — bet after seeing cards. Costs 2x current stake.
 */
function handleChaal(room: Room, playerId: string): Room {
  const player = room.players[playerId];
  if (!player.hasSeen) {
    throw new Error('Must see cards before chaal');
  }

  const betAmount = room.currentBet * 2; // 2x for seen
  if (player.chips < betAmount) {
    throw new Error('Not enough chips');
  }

  const log: ActionLogEntry = {
    playerId,
    playerName: player.name,
    action: 'played chaal',
    amount: betAmount,
    timestamp: Date.now(),
  };

  const updatedRoom: Room = {
    ...room,
    pot: room.pot + betAmount,
    players: {
      ...room.players,
      [playerId]: {
        ...player,
        chips: player.chips - betAmount,
        currentRoundBet: player.currentRoundBet + betAmount,
      },
    },
    actionLog: [...room.actionLog, log],
  };

  updatedRoom.currentTurn = getNextTurn(updatedRoom, playerId);
  return updatedRoom;
}

/**
 * Raise — increase the stake. Blind raises to 2x, Seen raises to 2x (doubling the blind stake).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleRaise(room: Room, playerId: string, _amount?: number): Room {
  const player = room.players[playerId];
  const isSeen = player.hasSeen;
  
  // Raise doubles the current bet (blind value)
  const newBet = room.currentBet * 2;
  const betAmount = isSeen ? newBet * 2 : newBet; // Seen pays 2x the new blind stake
  
  if (player.chips < betAmount) {
    throw new Error('Not enough chips');
  }

  // Cap the bet at a reasonable limit (pot limit style)
  const maxBet = room.bootAmount * 128; // Max 128x boot
  const cappedBet = Math.min(newBet, maxBet);

  const log: ActionLogEntry = {
    playerId,
    playerName: player.name,
    action: `raised (${isSeen ? 'seen' : 'blind'})`,
    amount: betAmount,
    timestamp: Date.now(),
  };

  const updatedRoom: Room = {
    ...room,
    currentBet: cappedBet,
    pot: room.pot + betAmount,
    players: {
      ...room.players,
      [playerId]: {
        ...player,
        chips: player.chips - betAmount,
        currentRoundBet: player.currentRoundBet + betAmount,
      },
    },
    actionLog: [...room.actionLog, log],
  };

  updatedRoom.currentTurn = getNextTurn(updatedRoom, playerId);
  return updatedRoom;
}

/**
 * Fold — player drops out of the round.
 */
function handleFold(room: Room, playerId: string): Room {
  const player = room.players[playerId];

  const log: ActionLogEntry = {
    playerId,
    playerName: player.name,
    action: 'folded',
    timestamp: Date.now(),
  };

  const updatedRoom: Room = {
    ...room,
    players: {
      ...room.players,
      [playerId]: { ...player, isFolded: true },
    },
    actionLog: [...room.actionLog, log],
  };

  // Check if only one player remains
  const active = getActivePlayers(updatedRoom);
  if (active.length === 1) {
    // Last remaining player wins
    return resolveWinner(updatedRoom, active[0]);
  }

  updatedRoom.currentTurn = getNextTurn(updatedRoom, playerId);
  return updatedRoom;
}

/**
 * Show — request showdown when only 2 players remain.
 */
function handleShow(room: Room, playerId: string): Room {
  const active = getActivePlayers(room);
  if (active.length !== 2) {
    throw new Error('Show is only available when 2 players remain');
  }

  const player = room.players[playerId];
  const opponentId = active.find(id => id !== playerId)!;
  const opponent = room.players[opponentId];

  // Show cost: seen pays 2x stake, blind pays 1x stake
  const showCost = player.hasSeen ? room.currentBet * 2 : room.currentBet;
  
  if (player.chips < showCost) {
    throw new Error('Not enough chips for show');
  }

  // Pay show cost
  const updatedPlayers = {
    ...room.players,
    [playerId]: {
      ...player,
      chips: player.chips - showCost,
      currentRoundBet: player.currentRoundBet + showCost,
      hasSeen: true, // Both see cards at showdown
    },
    [opponentId]: {
      ...opponent,
      hasSeen: true,
    },
  };

  const showRoom: Room = {
    ...room,
    pot: room.pot + showCost,
    players: updatedPlayers,
    status: 'showdown',
  };

  // Determine winner
  const cmp = comparePlayerHands(
    showRoom.players[playerId].hand,
    showRoom.players[opponentId].hand,
    showRoom.variation,
    showRoom.jokerCard,
    showRoom.players[playerId].selectedCards,
    showRoom.players[opponentId].selectedCards,
  );

  // If tie or requester loses, requester loses. If requester wins, requester wins.
  const winnerId = cmp > 0 ? playerId : opponentId;

  const log: ActionLogEntry = {
    playerId,
    playerName: player.name,
    action: 'requested show',
    amount: showCost,
    timestamp: Date.now(),
  };

  return resolveWinner({ ...showRoom, actionLog: [...showRoom.actionLog, log] }, winnerId);
}

/**
 * Select cards (Best of Four variation).
 */
function handleSelectCards(room: Room, playerId: string, selectedIndices: number[]): Room {
  if (room.variation !== 'bestOfFour') {
    throw new Error('Card selection only available in Best of Four');
  }
  if (selectedIndices.length !== 3) {
    throw new Error('Must select exactly 3 cards');
  }

  const player = room.players[playerId];
  if (player.hand.length !== 4) {
    throw new Error('Player does not have 4 cards');
  }

  return {
    ...room,
    players: {
      ...room.players,
      [playerId]: { ...player, selectedCards: selectedIndices },
    },
  };
}

// ── Winner Resolution ────────────────────────────────────────

function resolveWinner(room: Room, winnerId: string): Room {
  const winner = room.players[winnerId];
  const evaluation = evaluatePlayerHand(
    winner.hand,
    room.variation,
    room.jokerCard,
    winner.selectedCards,
  );

  const log: ActionLogEntry = {
    playerId: winnerId,
    playerName: winner.name,
    action: `won with ${evaluation.displayName}!`,
    amount: room.pot,
    timestamp: Date.now(),
  };

  return {
    ...room,
    status: 'roundEnd',
    currentTurn: '',
    players: {
      ...room.players,
      [winnerId]: {
        ...winner,
        chips: winner.chips + room.pot,
      },
    },
    actionLog: [...room.actionLog, log],
    lastWinner: {
      playerId: winnerId,
      playerName: winner.name,
      handType: evaluation.displayName,
      potWon: room.pot,
    },
  };
}

/**
 * Check if the game should end (a player has 0 chips).
 */
export function shouldGameEnd(room: Room): boolean {
  return room.playerOrder.some(id => room.players[id]?.chips <= 0);
}

/**
 * Get valid actions for a player given the current state.
 */
export function getValidActions(room: Room, playerId: string): PlayerAction['type'][] {
  if (room.status !== 'playing' || room.currentTurn !== playerId) {
    return [];
  }

  const player = room.players[playerId];
  if (!player || player.isFolded) return [];

  const actions: PlayerAction['type'][] = ['fold'];
  const active = getActivePlayers(room);

  if (!player.hasSeen) {
    actions.push('see');   // Can look at cards
    actions.push('blind'); // Can bet blind
  } else {
    actions.push('chaal'); // Can bet (seen)
  }

  // Raise: available if bet hasn't hit cap
  const maxBet = room.bootAmount * 128;
  if (room.currentBet * 2 <= maxBet) {
    actions.push('raise');
  }

  // Show: only when 2 players remain
  if (active.length === 2) {
    actions.push('show');
  }

  // Card selection for Best of Four
  if (room.variation === 'bestOfFour' && player.hand.length === 4 && !player.selectedCards) {
    actions.push('selectCards');
  }

  return actions;
}
