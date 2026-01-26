// Card Types
export enum CardType {
  MONSTER = 'MONSTER',
  ITEM = 'ITEM',
  RUNE = 'RUNE',
  SUMMONER_SPELL = 'SUMMONER_SPELL',
}

export enum MonsterType {
  NORMAL = 'NORMAL',
  EFFECT = 'EFFECT',
  FUSION = 'FUSION',
  SYNCHRO = 'SYNCHRO',
}

export enum Region {
  DEMACIA = 'DEMACIA',       // 14 - Justice & Light
  NOXUS = 'NOXUS',           // 16 - Strength & Conquest
  FRELJORD = 'FRELJORD',     // 14 - Ice & Survival
  PILTOVER = 'PILTOVER',     // 20 - Technology (includes Zaun)
  IONIA = 'IONIA',           // 18 - Spirit & Balance
  BILGEWATER = 'BILGEWATER', // 11 - Pirates & Sea
  SHADOW_ISLES = 'SHADOW_ISLES', // 12 - Undead & Death
  SHURIMA = 'SHURIMA',       // 20 - Ancient (includes Targon)
  THE_VOID = 'THE_VOID',     //  9 - Otherworldly
  IXTAL = 'IXTAL',           //  7 - Elemental Jungle
  DARKIN = 'DARKIN',         //  5 - Corrupted Ascended
  YORDLE = 'YORDLE',         // 14 - Bandle City
  RUNETERRA = 'RUNETERRA',   // 11 - Wanderers
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
  region: Region;
  level: number;
  attack: number;
  defense: number;
  effect?: string;
}

export interface ItemCard extends Card {
  type: CardType.ITEM;
  itemEffect: string;
  category?: 'AD' | 'AP' | 'TANK' | 'SUPPORT' | 'BOOTS' | 'CONSUMABLE' | 'JUNGLE';
}

export interface RuneCard extends Card {
  type: CardType.RUNE;
  runeEffect: string;
  runePath?: 'PRECISION' | 'DOMINATION' | 'SORCERY' | 'RESOLVE' | 'INSPIRATION';
}

export interface SummonerSpellCard extends Card {
  type: CardType.SUMMONER_SPELL;
  summonerEffect: string;
}

export type GameCard = MonsterCard | ItemCard | RuneCard | SummonerSpellCard;

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
    itemsAndRunes: (FieldCard | null)[];
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
