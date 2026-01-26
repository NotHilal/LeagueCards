import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDatabase from './config/database.js';
import authRoutes from './routes/auth.js';
import protect from './middleware/auth.js';
import Card from './models/Card.js';
import Pack from './models/Pack.js';
import { getStarterDeck } from './cards.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDatabase();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "http://localhost:3001", "data:", "blob:"]
    }
  }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit body size
app.use(mongoSanitize()); // Prevent NoSQL injection

// Serve static files (images)
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many attempts, please try again later.'
    });
  }
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Max 1000 requests per minute (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please slow down.'
    });
  }
});

// Store active game rooms
const rooms = new Map();
const players = new Map();

// Auth Routes (with rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// Apply general rate limiter to all API routes
app.use('/api', apiLimiter);

// API Routes
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await Card.find({ enabled: true });
    res.json(cards);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

app.get('/api/packs', async (req, res) => {
  try {
    const packs = await Pack.find({ enabled: true });
    res.json(packs);
  } catch (error) {
    console.error('Get packs error:', error);
    res.status(500).json({ error: 'Failed to fetch packs' });
  }
});

// Helper function to open a pack using database cards
async function openPackFromDB(packId) {
  const pack = await Pack.findOne({ packId, enabled: true });
  if (!pack) return null;

  const pulledCards = [];
  const { cardCount, rarityOdds, guaranteedRarity } = pack;
  const monsterRatio = pack.monsterRatio !== undefined ? pack.monsterRatio : 0.5;

  // Get all enabled cards from database
  const allCards = await Card.find({ enabled: true });
  const monsterCards = allCards.filter(c => c.type === 'MONSTER');
  const spellTrapCards = allCards.filter(c => c.type === 'SPELL' || c.type === 'TRAP');

  // Generate cards based on odds
  for (let i = 0; i < cardCount; i++) {
    const isLastCard = i === cardCount - 1;

    // If this is the last card and we have a guaranteed rarity, ensure we meet it
    if (isLastCard && guaranteedRarity) {
      const hasGuaranteed = pulledCards.some(card =>
        card.rarity === guaranteedRarity || card.rarity === 'LEGENDARY'
      );

      if (!hasGuaranteed) {
        // Force guaranteed rarity
        const guaranteedCards = allCards.filter(c =>
          c.rarity === guaranteedRarity || c.rarity === 'LEGENDARY'
        );
        const randomCard = guaranteedCards[Math.floor(Math.random() * guaranteedCards.length)];
        pulledCards.push(randomCard);
        continue;
      }
    }

    // Determine card type based on monster ratio
    const typeRoll = Math.random();
    const isMonster = typeRoll < monsterRatio;
    const typeFilteredCards = isMonster ? monsterCards : spellTrapCards;

    // Normal random card based on rarity odds
    const random = Math.random();
    let rarity;
    let cumulative = 0;

    for (const [rarityKey, odds] of Object.entries(rarityOdds.toObject())) {
      cumulative += odds;
      if (random <= cumulative) {
        rarity = rarityKey;
        break;
      }
    }

    // Filter by both type and rarity
    let availableCards = typeFilteredCards.filter(c => c.rarity === rarity);

    // Fallback: if no cards match both type and rarity, try just rarity
    if (availableCards.length === 0) {
      availableCards = allCards.filter(c => c.rarity === rarity);
    }

    // Final fallback: just use type-filtered cards
    if (availableCards.length === 0) {
      availableCards = typeFilteredCards.length > 0 ? typeFilteredCards : allCards;
    }

    if (availableCards.length > 0) {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      pulledCards.push(randomCard);
    }
  }

  return {
    pack: pack,
    cards: pulledCards
  };
}

// Protected: Open pack and save to user collection
app.post('/api/open-pack', protect, async (req, res) => {
  try {
    const { packId } = req.body;
    const pack = await Pack.findOne({ packId, enabled: true });

    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    // Check if user has enough gold
    if (!req.user.hasEnoughGold(pack.price)) {
      return res.status(400).json({ error: 'Not enough gold' });
    }

    // Deduct gold
    req.user.deductGold(pack.price);

    // Open pack
    const result = await openPackFromDB(packId);

    // Add cards to user collection
    const cardIds = result.cards.map(card => card.cardId);
    req.user.addCardsToCollection(cardIds);

    // Update stats
    req.user.stats.packsOpened += 1;

    // Save user
    await req.user.save();

    // Transform cards to match frontend format
    const transformedCards = result.cards.map(card => ({
      id: card.cardId,
      name: card.name,
      type: card.type,
      rarity: card.rarity,
      description: card.description,
      attack: card.attack,
      defense: card.defense,
      level: card.level,
      attribute: card.attribute,
      effect: card.effect,
      spellEffect: card.spellEffect,
      trapEffect: card.trapEffect,
      image: card.image
    }));

    res.json({
      pack: result.pack,
      cards: transformedCards,
      newGold: req.user.gold,
      collection: req.user.cards
    });
  } catch (error) {
    console.error('Pack opening error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected: Add gold to user (for testing)
app.post('/api/add-gold', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const goldAmount = amount || 10000;

    req.user.gold += goldAmount;
    await req.user.save();

    res.json({
      success: true,
      newGold: req.user.gold,
      added: goldAmount
    });
  } catch (error) {
    console.error('Add gold error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected: Get user's collection
app.get('/api/user/collection', protect, async (req, res) => {
  try {
    // Get full card details for user's collection from database
    const cardIds = req.user.cards.map(item => item.cardId);
    const cardsFromDB = await Card.find({ cardId: { $in: cardIds } });

    const userCollection = req.user.cards.map(item => {
      const card = cardsFromDB.find(c => c.cardId === item.cardId);
      return card ? { ...card.toObject(), count: item.count } : null;
    }).filter(Boolean);

    res.json(userCollection);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected: Get user's gold
app.get('/api/user/gold', protect, (req, res) => {
  res.json({ gold: req.user.gold });
});

// Protected: Get user's decks
app.get('/api/user/decks', protect, (req, res) => {
  try {
    const decks = req.user.decks || [];
    res.json(decks);
  } catch (error) {
    console.error('Get decks error:', error);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

// Protected: Create a new deck
app.post('/api/user/decks', protect, async (req, res) => {
  try {
    const { name, cards, runes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Deck name is required' });
    }

    // Validate runes if provided
    if (runes && runes.length > 5) {
      return res.status(400).json({ error: 'Deck cannot have more than 5 runes' });
    }

    const newDeck = {
      name: name.trim(),
      cards: cards || [],
      runes: runes || [],
      createdAt: new Date()
    };

    req.user.decks.push(newDeck);
    await req.user.save();

    // Return the created deck with its _id
    const createdDeck = req.user.decks[req.user.decks.length - 1];
    res.status(201).json(createdDeck);
  } catch (error) {
    console.error('Create deck error:', error);
    res.status(500).json({ error: 'Failed to create deck' });
  }
});

// Protected: Update a deck
app.put('/api/user/decks/:deckId', protect, async (req, res) => {
  try {
    const { deckId } = req.params;
    const { name, cards, runes } = req.body;

    const deck = req.user.decks.id(deckId);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Deck name cannot be empty' });
      }
      deck.name = name.trim();
    }

    if (cards !== undefined) {
      deck.cards = cards;
    }

    if (runes !== undefined) {
      if (runes.length > 5) {
        return res.status(400).json({ error: 'Deck cannot have more than 5 runes' });
      }
      deck.runes = runes;
    }

    await req.user.save();
    res.json(deck);
  } catch (error) {
    console.error('Update deck error:', error);
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

// Protected: Delete a deck
app.delete('/api/user/decks/:deckId', protect, async (req, res) => {
  try {
    const { deckId } = req.params;

    const deck = req.user.decks.id(deckId);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    req.user.decks.pull(deckId);
    await req.user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete deck error:', error);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

// Protected: Get a specific deck with full card and rune details
app.get('/api/user/decks/:deckId/full', protect, async (req, res) => {
  try {
    const { deckId } = req.params;
    const deck = req.user.decks.id(deckId);

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Get full card details
    const cardIds = deck.cards || [];
    const runeIds = deck.runes || [];

    const [cards, runes] = await Promise.all([
      cardIds.length > 0 ? Card.find({ cardId: { $in: cardIds } }) : [],
      runeIds.length > 0 ? Card.find({ cardId: { $in: runeIds }, type: 'RUNE' }) : []
    ]);

    res.json({
      _id: deck._id,
      name: deck.name,
      cardIds: cardIds,
      cards: cards,
      runeIds: runeIds,
      runes: runes,
      createdAt: deck.createdAt
    });
  } catch (error) {
    console.error('Get full deck error:', error);
    res.status(500).json({ error: 'Failed to fetch deck details' });
  }
});

app.get('/api/starter-deck', (req, res) => {
  res.json(getStarterDeck());
});

// Helper function to create initial player state
function createPlayerState(playerId, playerName) {
  const deck = getStarterDeck();
  const hand = deck.splice(0, 5); // Draw initial 5 cards

  return {
    id: playerId,
    name: playerName,
    lifePoints: 8000,
    deck: deck,
    hand: hand,
    field: {
      monsters: [null, null, null, null, null],
      itemsAndRunes: [null, null, null, null, null]
    },
    graveyard: [],
    banished: []
  };
}

// Helper function to create initial game state
function createGameState(roomId, player1, player2) {
  return {
    id: roomId,
    players: [
      createPlayerState(player1.id, player1.name),
      createPlayerState(player2.id, player2.name)
    ],
    currentPlayer: 0,
    phase: 'DRAW',
    turn: 1,
    winner: null
  };
}

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Player joins with username
  socket.on('join', (username) => {
    players.set(socket.id, { id: socket.id, name: username });
    socket.emit('joined', { playerId: socket.id, username });
  });

  // Create a new game room
  socket.on('create_room', () => {
    const roomId = `room_${Date.now()}`;
    const player = players.get(socket.id);

    rooms.set(roomId, {
      id: roomId,
      host: socket.id,
      players: [player],
      maxPlayers: 2,
      status: 'waiting',
      gameState: null
    });

    socket.join(roomId);
    socket.emit('room_created', { roomId, room: rooms.get(roomId) });
    io.emit('rooms_updated', Array.from(rooms.values()));
  });

  // Join an existing room
  socket.on('join_room', (roomId) => {
    const room = rooms.get(roomId);
    const player = players.get(socket.id);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    room.players.push(player);
    socket.join(roomId);

    // If room is full, start the game
    if (room.players.length === 2) {
      room.status = 'playing';
      room.gameState = createGameState(roomId, room.players[0], room.players[1]);
      io.to(roomId).emit('game_start', room.gameState);
    }

    io.to(roomId).emit('player_joined', { room });
    io.emit('rooms_updated', Array.from(rooms.values()));
  });

  // Get available rooms
  socket.on('get_rooms', () => {
    socket.emit('rooms_list', Array.from(rooms.values()).filter(r => r.status === 'waiting'));
  });

  // Game action (summon, attack, etc.)
  socket.on('game_action', ({ roomId, action }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    // Process game action (simplified for now)
    console.log('Game action:', action);

    // Broadcast updated game state
    io.to(roomId).emit('game_update', room.gameState);
  });

  // End turn
  socket.on('end_turn', (roomId) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const gameState = room.gameState;

    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 0 ? 1 : 0;

    // Draw a card for new player
    const currentPlayerState = gameState.players[gameState.currentPlayer];
    if (currentPlayerState.deck.length > 0) {
      const drawnCard = currentPlayerState.deck.shift();
      currentPlayerState.hand.push(drawnCard);
    }

    // Reset phase
    gameState.phase = 'DRAW';
    if (gameState.currentPlayer === 0) {
      gameState.turn++;
    }

    io.to(roomId).emit('game_update', gameState);
    io.to(roomId).emit('turn_changed', {
      currentPlayer: gameState.currentPlayer,
      turn: gameState.turn
    });
  });

  // Start solo game vs AI
  socket.on('start_solo', () => {
    const player = players.get(socket.id);

    if (!player) {
      socket.emit('error', { message: 'Player not found. Please join first.' });
      return;
    }

    const aiPlayer = { id: 'ai', name: 'AI Opponent' };
    const gameState = createGameState(`solo_${socket.id}`, player, aiPlayer);

    socket.emit('solo_game_start', gameState);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove player from rooms
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        // Delete room if empty
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('player_left', { room });
        }
      }
    });

    players.delete(socket.id);
    io.emit('rooms_updated', Array.from(rooms.values()));
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Server running on port ${PORT}`);
});
