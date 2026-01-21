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
    enum: ['MONSTER', 'SPELL', 'TRAP']
  },
  // Monster-specific fields
  monsterType: {
    type: String,
    enum: ['NORMAL', 'EFFECT', 'FUSION', 'SYNCHRO', 'XYZ'],
    required: function() { return this.type === 'MONSTER'; }
  },
  attribute: {
    type: String,
    enum: ['LIGHT', 'DARK', 'FIRE', 'WATER', 'WIND', 'EARTH'],
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
  // Spell-specific fields
  spellEffect: {
    type: String,
    required: function() { return this.type === 'SPELL'; }
  },
  // Trap-specific fields
  trapEffect: {
    type: String,
    required: function() { return this.type === 'TRAP'; }
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
