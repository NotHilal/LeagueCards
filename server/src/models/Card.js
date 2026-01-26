import mongoose from 'mongoose';

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
    enum: ['MONSTER', 'ITEM', 'RUNE', 'SUMMONER_SPELL']
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
    required: function() { return this.type === 'MONSTER'; }
  },
  defense: {
    type: Number,
    min: 0,
    required: function() { return this.type === 'MONSTER'; }
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
