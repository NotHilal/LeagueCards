import mongoose from 'mongoose';

const packSchema = new mongoose.Schema({
  packId: {
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
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cardCount: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  image: {
    type: String
  },
  rarityOdds: {
    COMMON: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    RARE: {
      type: Number,
      default: 0.3,
      min: 0,
      max: 1
    },
    EPIC: {
      type: Number,
      default: 0.15,
      min: 0,
      max: 1
    },
    LEGENDARY: {
      type: Number,
      default: 0.05,
      min: 0,
      max: 1
    }
  },
  monsterRatio: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1
  },
  guaranteedRarity: {
    type: String,
    enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', null],
    default: null
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Pack = mongoose.model('Pack', packSchema);

export default Pack;
