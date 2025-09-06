export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  seatPosition?: number;
  chips?: number;
  isConnected: boolean;
}

export interface TableSettings {
  smallBlind: number;
  bigBlind: number;
  ante: number;
  anteEnabled: boolean;
  straddleEnabled: boolean;
  runItTwicePolicy: 'always' | 'ask' | 'not_allowed';
  decisionTimer: 20 | 40;
}

export interface Seat {
  position: number;
  player: Player | null;
  isEmpty: boolean;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  seats: Seat[];
  settings: TableSettings;
  gameStarted: boolean;
  maxPlayers: number;
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
}

export interface GameState {
  roomId: string;
  pot: number;
  communityCards: Card[];
  currentPlayerIndex: number;
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  currentBet: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  playerHands: { [playerId: string]: Card[] };
  playerActions: { [playerId: string]: PlayerAction };
  timeRemaining?: number;
}

export interface PlayerAction {
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
  amount?: number;
  timestamp: number;
}

export interface SocketEvents {
  // Client to Server
  join_room: (roomId: string, playerName: string) => void;
  create_room: (roomName: string, playerName: string) => void;
  claim_seat: (seatPosition: number) => void;
  leave_seat: () => void;
  update_settings: (settings: Partial<TableSettings>) => void;
  start_game: () => void;
  player_action: (action: PlayerAction) => void;
  
  // Server to Client
  room_joined: (room: Room, playerId: string) => void;
  room_created: (room: Room, playerId: string) => void;
  player_joined: (player: Player) => void;
  player_left: (playerId: string) => void;
  seat_claimed: (seatPosition: number, player: Player) => void;
  seat_released: (seatPosition: number) => void;
  settings_updated: (settings: TableSettings) => void;
  game_started: (gameState: GameState) => void;
  game_state_updated: (gameState: GameState) => void;
  player_action_made: (playerId: string, action: PlayerAction) => void;
  error: (message: string) => void;
}