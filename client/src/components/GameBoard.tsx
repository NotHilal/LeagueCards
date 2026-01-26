import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Card from './Card';
import { useAuth } from '../context/AuthContext';

interface GameBoardProps {
  mode: 'solo' | 'multiplayer';
}

interface GameCard {
  id: string;
  name: string;
  type: 'MONSTER' | 'ITEM' | 'RUNE' | 'SUMMONER_SPELL';
  attack?: number;
  defense?: number;
  level?: number;
  description: string;
  image?: string;
  runeEffect?: string;
  runePath?: string;
}

interface PlayerState {
  id: string;
  name: string;
  lifePoints: number;
  deck: GameCard[];
  hand: GameCard[];
  field: {
    monsters: (any | null)[];
    itemsAndRunes: (any | null)[];
  };
  graveyard: GameCard[];
}

interface GameState {
  players: [PlayerState, PlayerState];
  currentPlayer: 0 | 1;
  phase: string;
  turn: number;
}

interface RuneCard {
  cardId: string;
  id: string;
  name: string;
  runeEffect?: string;
  runePath?: string;
  rarity?: string;
}

interface ActiveRune {
  rune: RuneCard;
  turnsRemaining: number;
}

const RUNE_DURATION = 3; // Default duration in turns

export default function GameBoard({ mode }: GameBoardProps) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [playerIndex, setPlayerIndex] = useState<0 | 1>(0);

  // Rune Deck state
  const [runeDeck, setRuneDeck] = useState<RuneCard[]>([]);
  const [usedRunes, setUsedRunes] = useState<Set<string>>(new Set());
  const [activeRunes, setActiveRunes] = useState<ActiveRune[]>([]);
  const [showRunePanel, setShowRunePanel] = useState(false);

  // Fetch rune deck from selected deck
  // TODO: Pass deckId as prop when deck selection is implemented
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeckRunes = async () => {
      if (!selectedDeckId) {
        // No deck selected yet - runes will be empty
        // In the future, implement deck selection before starting a game
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/api/user/decks/${selectedDeckId}/full`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const runes = (data.runes || []).map((r: any) => ({
            ...r,
            id: r.cardId || r.id
          }));
          setRuneDeck(runes);
        }
      } catch (err) {
        console.error('Failed to fetch deck runes:', err);
      }
    };
    if (token && selectedDeckId) {
      fetchDeckRunes();
    }
  }, [token, selectedDeckId]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');

      if (mode === 'solo') {
        // Must join first before starting solo game
        newSocket.emit('join', user?.username || 'Player');
      }
    });

    newSocket.on('joined', () => {
      console.log('Joined server, starting solo game...');
      if (mode === 'solo') {
        newSocket.emit('start_solo');
      }
    });

    newSocket.on('solo_game_start', (state: GameState) => {
      setGameState(state);
      setPlayerIndex(0);
    });

    newSocket.on('game_update', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('error', (err: { message: string }) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      newSocket.close();
    };
  }, [mode, roomId, user?.username]);

  // Activate a rune
  const activateRune = (rune: RuneCard) => {
    if (usedRunes.has(rune.cardId)) return;
    if (!gameState || gameState.currentPlayer !== playerIndex) return;

    // Mark rune as used
    setUsedRunes(prev => new Set([...prev, rune.cardId]));

    // Add to active runes
    setActiveRunes(prev => [...prev, { rune, turnsRemaining: RUNE_DURATION }]);

    // Close panel after activation
    setShowRunePanel(false);
  };

  // Decrement rune durations (called at end of player's turn)
  const decrementRuneDurations = () => {
    setActiveRunes(prev =>
      prev
        .map(ar => ({ ...ar, turnsRemaining: ar.turnsRemaining - 1 }))
        .filter(ar => ar.turnsRemaining > 0)
    );
  };

  const getPathColor = (path?: string) => {
    const colors: Record<string, string> = {
      PRECISION: 'from-yellow-400 to-yellow-600',
      DOMINATION: 'from-red-400 to-red-600',
      SORCERY: 'from-blue-400 to-blue-600',
      RESOLVE: 'from-green-400 to-green-600',
      INSPIRATION: 'from-purple-400 to-purple-600',
    };
    return colors[path || ''] || 'from-purple-400 to-purple-600';
  };

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
  };

  const handleFieldClick = (zone: 'monsters' | 'itemsAndRunes', index: number) => {
    if (selectedCard === null || !gameState) return;

    const currentPlayerState = gameState.players[playerIndex];
    const card = currentPlayerState.hand[selectedCard];

    if (!card) return;

    // Simple placement logic
    if (zone === 'monsters' && card.type === 'MONSTER') {
      currentPlayerState.field.monsters[index] = { card, position: 'ATTACK', faceUp: true };
      currentPlayerState.hand.splice(selectedCard, 1);
      setSelectedCard(null);
      setGameState({ ...gameState });
    } else if (zone === 'itemsAndRunes' && (card.type === 'ITEM' || card.type === 'RUNE' || card.type === 'SUMMONER_SPELL')) {
      currentPlayerState.field.itemsAndRunes[index] = { card, faceUp: card.type !== 'RUNE' };
      currentPlayerState.hand.splice(selectedCard, 1);
      setSelectedCard(null);
      setGameState({ ...gameState });
    }
  };

  const handleEndTurn = () => {
    if (!socket || !gameState) return;

    // Decrement active rune durations when player ends their turn
    decrementRuneDurations();

    if (mode === 'multiplayer' && roomId) {
      socket.emit('end_turn', roomId);
    } else {
      // Solo mode - simple AI turn simulation
      const newState = { ...gameState };
      newState.currentPlayer = newState.currentPlayer === 0 ? 1 : 0;

      // Draw card
      const currentPlayer = newState.players[newState.currentPlayer];
      if (currentPlayer.deck.length > 0) {
        const drawnCard = currentPlayer.deck.shift()!;
        currentPlayer.hand.push(drawnCard);
      }

      newState.turn++;
      setGameState(newState);

      // AI move after a delay
      if (newState.currentPlayer === 1) {
        setTimeout(() => {
          performAIMove(newState);
        }, 1500);
      }
    }
  };

  const performAIMove = (state: GameState) => {
    const aiPlayer = state.players[1];

    // Simple AI: play first monster card if available
    const monsterCard = aiPlayer.hand.findIndex(c => c.type === 'MONSTER');
    if (monsterCard !== -1) {
      const emptySlot = aiPlayer.field.monsters.findIndex(slot => slot === null);
      if (emptySlot !== -1) {
        aiPlayer.field.monsters[emptySlot] = {
          card: aiPlayer.hand[monsterCard],
          position: 'ATTACK',
          faceUp: true,
        };
        aiPlayer.hand.splice(monsterCard, 1);
      }
    }

    // End AI turn
    state.currentPlayer = 0;
    state.turn++;

    // Draw card for player
    if (state.players[0].deck.length > 0) {
      const drawnCard = state.players[0].deck.shift()!;
      state.players[0].hand.push(drawnCard);
    }

    setGameState({ ...state });
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lol-dark">
        <div className="text-2xl text-lol-gold">Loading game...</div>
      </div>
    );
  }

  const currentPlayer = gameState.players[playerIndex];
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0];
  const isMyTurn = gameState.currentPlayer === playerIndex;

  return (
    <div className="game-board min-h-screen p-4 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Exit Game
        </button>
        <div className="text-xl font-bold text-lol-gold">
          Turn {gameState.turn} - {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-lg">
            Phase: <span className="text-lol-blue">{gameState.phase}</span>
          </div>
          {/* Rune Deck Button */}
          {runeDeck.length > 0 && (
            <button
              onClick={() => setShowRunePanel(!showRunePanel)}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                showRunePanel
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500/30'
              }`}
            >
              <span>&#9830;</span> Runes ({runeDeck.length - usedRunes.size}/{runeDeck.length})
            </button>
          )}
        </div>
      </div>

      {/* Active Runes Display */}
      {activeRunes.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {activeRunes.map((ar, index) => (
            <div
              key={index}
              className="bg-purple-500/20 border border-purple-500/50 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getPathColor(ar.rune.runePath)}`} />
              <span className="text-purple-200 text-sm font-medium">{ar.rune.name}</span>
              <span className="text-purple-400 text-xs">({ar.turnsRemaining} turns)</span>
            </div>
          ))}
        </div>
      )}

      {/* Rune Panel Overlay */}
      {showRunePanel && (
        <div className="absolute top-20 right-4 z-50 w-80 bg-slate-900/95 border border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-3">
            <h3 className="text-white font-bold">Rune Deck</h3>
            <p className="text-purple-200 text-xs">Activate once per duel</p>
          </div>
          <div className="p-3 space-y-2 max-h-[400px] overflow-auto">
            {runeDeck.map((rune) => {
              const isUsed = usedRunes.has(rune.cardId);
              const isActive = activeRunes.some(ar => ar.rune.cardId === rune.cardId);
              return (
                <div
                  key={rune.cardId}
                  className={`rounded-lg p-3 border transition-all ${
                    isUsed
                      ? 'bg-slate-800/50 border-slate-700/50 opacity-50'
                      : isActive
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'bg-slate-800/80 border-slate-700/50 hover:border-purple-500/50 cursor-pointer'
                  }`}
                  onClick={() => !isUsed && isMyTurn && activateRune(rune)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPathColor(rune.runePath)} flex items-center justify-center text-white flex-shrink-0`}>
                      &#9830;
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm">{rune.name}</p>
                        {isUsed && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                            {isActive ? 'Active' : 'Used'}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{rune.runePath}</p>
                      <p className="text-purple-300 text-xs mt-1 line-clamp-2">{rune.runeEffect}</p>
                    </div>
                  </div>
                  {!isUsed && isMyTurn && (
                    <div className="mt-2 text-center">
                      <span className="text-purple-400 text-xs">Click to activate ({RUNE_DURATION} turns)</span>
                    </div>
                  )}
                  {!isMyTurn && !isUsed && (
                    <div className="mt-2 text-center">
                      <span className="text-slate-500 text-xs">Wait for your turn</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="bg-slate-800/50 px-4 py-2 border-t border-slate-700/50">
            <button
              onClick={() => setShowRunePanel(false)}
              className="w-full text-center text-slate-400 text-sm hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Opponent Field */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold">{opponent.name}</div>
          <div className="text-xl text-red-400">LP: {opponent.lifePoints}</div>
        </div>

        {/* Opponent Items/Runes Zone */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {opponent.field.itemsAndRunes.map((slot, index) => (
            <div
              key={index}
              className="aspect-[2/3] bg-gray-700 border-2 border-gray-600 rounded flex items-center justify-center"
            >
              {slot ? (
                <Card card={slot.card} size="small" faceDown={!slot.faceUp} />
              ) : (
                <span className="text-gray-500 text-xs">I/R</span>
              )}
            </div>
          ))}
        </div>

        {/* Opponent Monster Zone */}
        <div className="grid grid-cols-5 gap-2">
          {opponent.field.monsters.map((slot, index) => (
            <div
              key={index}
              className="aspect-[2/3] bg-gray-700 border-2 border-gray-600 rounded flex items-center justify-center"
            >
              {slot ? (
                <Card card={slot.card} size="small" />
              ) : (
                <span className="text-gray-500 text-xs">Monster</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 text-sm text-gray-400">
          Hand: {opponent.hand.length} | Deck: {opponent.deck.length} | Graveyard:{' '}
          {opponent.graveyard.length}
        </div>
      </div>

      {/* Player Field */}
      <div className="p-4 bg-gray-800 rounded-lg">
        {/* Player Monster Zone */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {currentPlayer.field.monsters.map((slot, index) => (
            <div
              key={index}
              onClick={() => handleFieldClick('monsters', index)}
              className={`aspect-[2/3] bg-gray-700 border-2 rounded flex items-center justify-center cursor-pointer hover:border-lol-gold transition-colors ${
                selectedCard !== null && currentPlayer.hand[selectedCard]?.type === 'MONSTER'
                  ? 'border-green-500'
                  : 'border-gray-600'
              }`}
            >
              {slot ? (
                <Card card={slot.card} size="small" />
              ) : (
                <span className="text-gray-500 text-xs">Monster</span>
              )}
            </div>
          ))}
        </div>

        {/* Player Items/Runes Zone */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {currentPlayer.field.itemsAndRunes.map((slot, index) => (
            <div
              key={index}
              onClick={() => handleFieldClick('itemsAndRunes', index)}
              className={`aspect-[2/3] bg-gray-700 border-2 rounded flex items-center justify-center cursor-pointer hover:border-lol-gold transition-colors ${
                selectedCard !== null &&
                (currentPlayer.hand[selectedCard]?.type === 'ITEM' ||
                  currentPlayer.hand[selectedCard]?.type === 'RUNE' ||
                  currentPlayer.hand[selectedCard]?.type === 'SUMMONER_SPELL')
                  ? 'border-green-500'
                  : 'border-gray-600'
              }`}
            >
              {slot ? (
                <Card card={slot.card} size="small" faceDown={!slot.faceUp} />
              ) : (
                <span className="text-gray-500 text-xs">I/R</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold">{currentPlayer.name}</div>
          <div className="text-xl text-green-400">LP: {currentPlayer.lifePoints}</div>
        </div>

        {/* Player Hand */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Your Hand:</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {currentPlayer.hand.map((card, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(index)}
                className={`cursor-pointer transition-transform ${
                  selectedCard === index ? 'transform scale-110 -translate-y-2' : ''
                }`}
              >
                <Card card={card} size="medium" selected={selectedCard === index} />
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleEndTurn}
            disabled={!isMyTurn}
            className={`btn-primary flex-1 ${
              !isMyTurn ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            End Turn
          </button>
          <div className="text-sm text-gray-400 flex items-center">
            Deck: {currentPlayer.deck.length} | Graveyard: {currentPlayer.graveyard.length}
          </div>
        </div>
      </div>
    </div>
  );
}
