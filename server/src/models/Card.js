import mongoose from 'mongoose';

// Champion ability sub-schema
const abilitySchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  effect: { type: String }, // Effect identifier for game logic
}, { _id: false });

const cardSchema = new mongoose.Schema({
  cardId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['MONSTER', 'ITEM', 'RUNE', 'SUMMONER_SPELL', 'JUNGLE_MONSTER']
  },
  // Monster-specific fields
  monsterType: {
    type: String,
    enum: ['NORMAL', 'EFFECT', 'FUSION', 'SYNCHRO', 'XYZ'],
    required: function() { return this.type === 'MONSTER'; }
  },
  region: {
    type: String,
    enum: ['DEMACIA', 'NOXUS', 'FRELJORD', 'PILTOVER', 'IONIA', 'BILGEWATER', 'SHADOW_ISLES', 'SHURIMA', 'THE_VOID', 'IXTAL', 'DARKIN', 'YORDLE', 'RUNETERRA'],
    required: function() { return this.type === 'MONSTER'; }
  },
  level: {
    type: Number,
    min: 1,
    max: 12,
    required: function() { return this.type === 'MONSTER'; }
  },
  attack: {
    type: Number,
    min: 0,
    required: function() { return this.type === 'MONSTER' || this.type === 'JUNGLE_MONSTER'; }
  },
  defense: {
    type: Number,
    min: 0,
    required: function() { return this.type === 'MONSTER' || this.type === 'JUNGLE_MONSTER'; }
  },
  // Champion abilities (passive, spell, ultimate)
  abilities: {
    passive: abilitySchema,
    spell: abilitySchema,
    ultimate: abilitySchema,
  },
  // Item-specific fields
  itemEffect: {
    type: String,
    required: function() { return this.type === 'ITEM'; }
  },
  category: {
    type: String,
    enum: ['AD', 'AP', 'TANK', 'SUPPORT', 'BOOTS', 'CONSUMABLE', 'JUNGLE']
  },
  // Item gold cost and stat bonuses
  goldCost: {
    type: Number,
    min: 0,
    default: 0
  },
  atkBonus: {
    type: Number,
    default: 0
  },
  defBonus: {
    type: Number,
    default: 0
  },
  // Jungle monster fields
  teamEffect: {
    type: String,
    required: function() { return this.type === 'JUNGLE_MONSTER'; }
  },
  // Rune-specific fields
  runeEffect: {
    type: String,
    required: function() { return this.type === 'RUNE'; }
  },
  runePath: {
    type: String,
    enum: ['PRECISION', 'DOMINATION', 'SORCERY', 'RESOLVE', 'INSPIRATION']
  },
  // Summoner Spell-specific fields
  summonerEffect: {
    type: String,
    required: function() { return this.type === 'SUMMONER_SPELL'; }
  },
  // Common fields
  rarity: {
    type: String,
    required: true,
    enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY']
  },
  effect: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  // Meta fields
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Card = mongoose.model('Card', cardSchema);

export default Card;
