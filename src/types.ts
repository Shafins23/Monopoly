export type PropertyColor = 
  | 'brown' | 'lightblue' | 'pink' | 'orange' | 'red' | 'yellow' | 'green' | 'darkblue' 
  | 'railroad' | 'utility' | 'none';

export interface Space {
  id: string;
  name: string;
  type: 'property' | 'railroad' | 'utility' | 'go' | 'tax' | 'chance' | 'community-chest' | 'jail' | 'free-parking' | 'go-to-jail';
  price?: number;
  rent?: number[];
  housePrice?: number;
  color?: PropertyColor;
  group?: string;
}

export interface Player {
  uid: string;
  name: string;
  color: string;
  token: string;
  balance: number;
  position: number;
  properties: string[]; // Space IDs
  jailStatus: {
    inJail: boolean;
    turnsInJail: number;
    hasGetOutFree: number;
  };
  isBankrupt: boolean;
}

export interface GameSettings {
  freeParkingPot: boolean;
  startingMoney: number;
  auctionOnDecline: boolean;
}

export interface LogEntry {
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'danger' | 'warning';
}

export interface GameState {
  status: 'waiting' | 'playing' | 'finished';
  hostId: string;
  players: Player[];
  turnIndex: number;
  dice: [number, number];
  consecutiveDoubles: number;
  chanceDeck: number[];
  communityChestDeck: number[];
  housesAvailable: number;
  hotelsAvailable: number;
  log: LogEntry[];
  pot: number;
  settings: GameSettings;
  winner?: string;
  lastRoll?: {
    doubles: boolean;
    val1: number;
    val2: number;
  };
  propertyState: Record<string, {
    ownerId: string | null;
    houses: number; // 5 = hotel
    isMortgaged: boolean;
  }>;
}

export interface TradeOffer {
  id: string;
  fromId: string;
  toId: string;
  offerCash: number;
  offerProperties: string[];
  requestCash: number;
  requestProperties: string[];
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}
