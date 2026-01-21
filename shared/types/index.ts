// Card Types
export enum CardType {
  MONSTER = 'MONSTER',
  SPELL = 'SPELL',
  TRAP = 'TRAP',
}

export enum MonsterType {
  NORMAL = 'NORMAL',
  EFFECT = 'EFFECT',
  FUSION = 'FUSION',
  SYNCHRO = 'SYNCHRO',
}

export enum Attribute {
  FIRE = 'FIRE',
  WATER = 'WATER',
  EARTH = 'EARTH',
  WIND = 'WIND',
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  image?: string;
}

export interface MonsterCard extends Card {
  type: CardType.MONSTER;
  monsterType: MonsterType;
  attribute: Attribute;
  level: number;
  attack: number;
  defense: number;
  effect?: string;
}

export interface SpellCard extends Card {
  type: CardType.SPELL;
  spellEffect: string;
}

export interface TrapCard extends Card {
  type: CardType.TRAP;
  trapEffect: string;
}

export type GameCard = MonsterCard | SpellCard | TrapCard;

// Game State Types
export enum GamePhase {
  DRAW = 'DRAW',
  STANDBY = 'STANDBY',
  MAIN1 = 'MAIN1',
  BATTLE = 'BATTLE',
  MAIN2 = 'MAIN2',
  END = 'END',
}

export enum CardPosition {
  ATTACK = 'ATTACK',
  DEFENSE = 'DEFENSE',
  FACE_DOWN_DEFENSE = 'FACE_DOWN_DEFENSE',
}

export interface FieldCard {
  card: GameCard;
  position?: CardPosition;
  faceUp: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  lifePoints: number;
  deck: GameCard[];
  hand: GameCard[];
  field: {
    monsters: (FieldCard | null)[];
    spellTrap: (FieldCard | null)[];
  };
  graveyard: GameCard[];
  banished: GameCard[];
}

export interface GameState {
  id: string;
  players: [PlayerState, PlayerState];
  currentPlayer: 0 | 1;
  phase: GamePhase;
  turn: number;
  winner?: string;
}

// Multiplayer Types
export interface RoomInfo {
  id: string;
  host: string;
  players: string[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
}

export interface GameAction {
  type: 'SUMMON' | 'ATTACK' | 'SET_CARD' | 'ACTIVATE_SPELL' | 'END_PHASE' | 'END_TURN';
  playerId: string;
  data?: any;
}
