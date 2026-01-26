import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Allow multiple null values
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  gold: {
    type: Number,
    default: 1000
  },
  cards: [{
    cardId: String,
    count: {
      type: Number,
      default: 1
    }
  }],
  decks: [{
    name: String,
    cards: [String],
    runes: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 5;
        },
        message: 'Rune deck cannot have more than 5 runes'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    packsOpened: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add card to collection
userSchema.methods.addCardToCollection = function(cardId) {
  const existingCard = this.cards.find(c => c.cardId === cardId);

  if (existingCard) {
    existingCard.count += 1;
  } else {
    this.cards.push({ cardId, count: 1 });
  }
};

// Method to add multiple cards
userSchema.methods.addCardsToCollection = function(cardIds) {
  cardIds.forEach(cardId => {
    this.addCardToCollection(cardId);
  });
};

// Method to check if user has enough gold
userSchema.methods.hasEnoughGold = function(amount) {
  return this.gold >= amount;
};

// Method to deduct gold
userSchema.methods.deductGold = function(amount) {
  if (this.hasEnoughGold(amount)) {
    this.gold -= amount;
    return true;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;
