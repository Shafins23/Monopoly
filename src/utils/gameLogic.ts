import { nanoid } from 'nanoid';
import { GameState, Player, Space, LogEntry } from '../types';
import { BOARD_SPACES } from '../constants';

export function createInitialGameState(hostId: string, hostName: string, settings = {
  freeParkingPot: false,
  startingMoney: 1500,
  auctionOnDecline: false
}): GameState {
  const host: Player = {
    uid: hostId,
    name: hostName,
    color: '#3B82F6',
    token: '🎩',
    balance: settings.startingMoney,
    position: 0,
    properties: [],
    jailStatus: { inJail: false, turnsInJail: 0, hasGetOutFree: 0 },
    isBankrupt: false
  };

  const propertyState: GameState['propertyState'] = {};
  BOARD_SPACES.forEach(space => {
    if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
      propertyState[space.id] = { ownerId: null, houses: 0, isMortgaged: false };
    }
  });

  return {
    status: 'waiting',
    hostId,
    players: [host],
    turnIndex: 0,
    dice: [1, 1],
    consecutiveDoubles: 0,
    chanceDeck: shuffle([...Array(16).keys()]),
    communityChestDeck: shuffle([...Array(16).keys()]),
    housesAvailable: 32,
    hotelsAvailable: 12,
    log: [{ message: `${hostName} created the room.`, timestamp: Date.now(), type: 'info' }],
    pot: 0,
    settings,
    propertyState
  };
}

function shuffle(array: any[]) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const TOKENS = ['🎩', '🚗', '🚢', '🐕', '🚲', '🦖', '🐧', '🦆'];
export const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export function calculateRent(state: GameState, spaceId: string, player: Player): number {
  const space = BOARD_SPACES.find(s => s.id === spaceId);
  const propState = state.propertyState[spaceId];
  if (!space || !propState || !propState.ownerId || propState.isMortgaged) return 0;

  const owner = state.players.find(p => p.uid === propState.ownerId)!;

  if (space.type === 'property') {
    // If owner has full set and no houses, rent is double
    const colorGroup = BOARD_SPACES.filter(s => s.color === space.color);
    const hasFullSet = colorGroup.every(s => state.propertyState[s.id].ownerId === owner.uid);
    
    if (propState.houses === 0) {
      return hasFullSet ? (space.rent![0] * 2) : space.rent![0];
    }
    return space.rent![propState.houses];
  }

  if (space.type === 'railroad') {
    const railroadsOwned = BOARD_SPACES.filter(s => 
      s.type === 'railroad' && state.propertyState[s.id].ownerId === owner.uid
    ).length;
    return 25 * Math.pow(2, railroadsOwned - 1);
  }

  if (space.type === 'utility') {
    const diceTotal = state.dice[0] + state.dice[1];
    const utilitiesOwned = BOARD_SPACES.filter(s => 
      s.type === 'utility' && state.propertyState[s.id].ownerId === owner.uid
    ).length;
    return utilitiesOwned === 1 ? diceTotal * 4 : diceTotal * 10;
  }

  return 0;
}

export const CHANCE_CARDS = [
  "Advance to GO (Collect $200)",
  "Advance to Illinois Ave. If you pass GO, collect $200",
  "Advance to St. Charles Place. If you pass GO, collect $200",
  "Advance to nearest Railroad. Pay owner 2x rent.",
  "Advance to nearest Utility. Pay owner 10x dice roll.",
  "Bank pays you dividend of $50",
  "Get Out of Jail Free card",
  "Go Back 3 Spaces",
  "Go to Jail",
  "Make general repairs on all your property: $25 per house, $100 per hotel",
  "Pay poor tax of $15",
  "Take a trip to Reading Railroad. If you pass GO, collect $200",
  "Take a walk on the Boardwalk. Advance token to Boardwalk",
  "You have been elected Chairman of the Board. Pay each player $50",
  "Your building loan matures. Collect $150",
  "You have won a crossword competition. Collect $100"
];

export const COMMUNITY_CHEST_CARDS = [
  "Advance to GO (Collect $200)",
  "Bank error in your favor. Collect $200",
  "Doctor's fees. Pay $50",
  "From sale of stock you get $50",
  "Get Out of Jail Free card",
  "Go to Jail",
  "Grand Opera Night. Collect $50 from every player for opening night seats",
  "Holiday Fund matures. Receive $100",
  "Income tax refund. Collect $20",
  "It is your birthday. Collect $10 from every player",
  "Life insurance matures. Collect $100",
  "Pay hospital fees of $100",
  "Pay school fees of $150",
  "Receive $25 consultancy fee",
  "You are assessed for street repairs: $40 per house, $115 per hotel",
  "You have won second prize in a beauty contest. Collect $10"
];
