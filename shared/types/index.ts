// Card Types
export enum CardType {
  MONSTER = 'MONSTER',
  ITEM = 'ITEM',
  RUNE = 'RUNE',
  SUMMONER_SPELL = 'SUMMONER_SPELL',
  JUNGLE_MONSTER = 'JUNGLE_MONSTER',
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

// Summoner Spell Types (for reactive play during enemy turn)
export enum SummonerSpellType {
  FLASH = 'FLASH',         // Revive champion from graveyard
  IGNITE = 'IGNITE',       // 400 damage to enemy HP
  HEAL = 'HEAL',           // +600 HP
  BARRIER = 'BARRIER',     // 1 champion invincible this turn
  EXHAUST = 'EXHAUST',     // Target champion ATK = 0 this turn
  TELEPORT = 'TELEPORT',   // Summon champion from hand
  SMITE = 'SMITE',         // Destroy 1 enemy champion
}

// Champion Ability Types
export interface ChampionAbility {
  name: string;
  description: string;
  effect: string; // Effect identifier for game logic
}

export interface ChampionAbilities {
  passive?: ChampionAbility;  // Always active effect
  spell?: ChampionAbility;    // Usable once per turn
  ultimate?: ChampionAbility; // Unlocks after 5 turns on board, usable once
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
  abilities?: ChampionAbilities; // Champion abilities (passive, spell, ultimate)
}

export interface JungleMonsterCard extends Card {
  type: CardType.JUNGLE_MONSTER;
  attack: number;
  defense: number;
  teamEffect: string; // Global effect when on field (e.g., "All allied champions gain +100 ATK")
}

export interface ItemCard extends Card {
  type: CardType.ITEM;
  itemEffect: string;
  category?: 'AD' | 'AP' | 'TANK' | 'SUPPORT' | 'BOOTS' | 'CONSUMABLE' | 'JUNGLE';
  goldCost?: number;       // Gold required to equip
  atkBonus?: number;       // Attack bonus when equipped
  defBonus?: number;       // Defense bonus when equipped
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

export type GameCard = MonsterCard | ItemCard | RuneCard | SummonerSpellCard | JungleMonsterCard;

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
  // Combat tracking
  turnsOnBoard: number;           // Track for ultimate unlock (>= 5 turns)
  hasAttacked: boolean;           // Whether this card has attacked this turn
  hasChangedPosition: boolean;    // Whether position was changed this turn
  // Stat modifiers
  currentAttack: number;          // Base + bonuses (items, synergies)
  currentDefense: number;         // Base + bonuses
  equippedItems: ItemCard[];      // Attached items
  // Status effects
  isInvincible: boolean;          // Barrier effect
  attackModifier: number;         // Temporary ATK modifier (e.g., Exhaust sets to 0)
  defenseModifier: number;        // Temporary DEF modifier
  // Ability tracking
  hasUsedSpell: boolean;          // Whether spell ability was used this turn
  hasUsedUltimate: boolean;       // Whether ultimate was used (one-time)
}

// Region synergy bonuses
export interface RegionBonus {
  region: Region;
  count: number;
  twoPlus: boolean;   // 2+ bonus active
  fourPlus: boolean;  // 4+ bonus active
}

export interface PlayerState {
  id: string;
  name: string;
  lifePoints: number;
  deck: GameCard[];
  hand: GameCard[];
  field: {
    champions: (FieldCard | null)[];      // 5 champion zones
    spellZone: (FieldCard | null)[];      // 5 item/trap zones (renamed from itemsAndRunes)
    jungleMonster: FieldCard | null;      // 1 dedicated jungle zone
  };
  graveyard: GameCard[];
  banished: GameCard[];
  // Gold economy
  gold: number;                           // In-game currency (start: 500)
  // Summoner spells (reactive, enemy turn only)
  spellDeck: SummonerSpellCard[];         // 5-slot spell deck
  usedSummonerSpells: string[];           // One-time use tracking (spell IDs)
  // Region synergies
  regionCounts: Record<string, number>;   // Count of champions by region
  regionBonuses: RegionBonus[];           // Active region bonuses
  // Special trackers
  hasUsedRevive: boolean;                 // Shadow Isles 4+ tracker (once per game)
  hasGottenNoxusKillGold: boolean;        // Noxus 4+ tracker (first kill bonus)
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
  type:
    | 'SUMMON'              // Place champion on field (free)
    | 'ATTACK'              // Declare attack
    | 'SET_CARD'            // Set card face-down in DEF position
    | 'ACTIVATE_SPELL'      // Activate summoner spell (enemy turn only)
    | 'EQUIP_ITEM'          // Equip item to champion (costs gold)
    | 'CHANGE_POSITION'     // Toggle ATK/DEF position
    | 'USE_ABILITY'         // Use champion spell or ultimate
    | 'SUMMON_JUNGLE'       // Place jungle monster in jungle zone
    | 'END_PHASE'           // Move to next phase
    | 'END_TURN';           // End turn
  playerId: string;
  data?: {
    // For SUMMON/SET_CARD
    cardIndex?: number;      // Index in hand
    zoneIndex?: number;      // Target zone index
    // For ATTACK
    attackerIndex?: number;  // Index of attacking champion
    targetIndex?: number;    // Index of target (or -1 for direct attack)
    // For EQUIP_ITEM
    itemIndex?: number;      // Index of item in hand
    championIndex?: number;  // Index of champion to equip
    // For ACTIVATE_SPELL
    spellId?: string;        // Summoner spell ID
    targetPlayerId?: string; // Target player (for some spells)
    targetCardIndex?: number;// Target card index (for some spells)
    // For CHANGE_POSITION
    cardFieldIndex?: number; // Index of card on field
    newPosition?: CardPosition;
    // For USE_ABILITY
    abilityType?: 'spell' | 'ultimate';
    abilityTargetIndex?: number;
  };
}

// Combat result for damage calculation
export interface CombatResult {
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
  damageToAttackerOwner: number;
  damageToDefenderOwner: number;
  attackerCard?: FieldCard;
  defenderCard?: FieldCard;
}
