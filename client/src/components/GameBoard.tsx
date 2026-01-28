import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Card from './Card';
import HPBar from './HPBar';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-2xl text-lol-gold">Loading game...</div>
      </div>
    );
  }

  const currentPlayer = gameState.players[playerIndex];
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0];
  const isMyTurn = gameState.currentPlayer === playerIndex;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 overflow-hidden">
      <div className="flex flex-col p-2 relative" style={{ width: '100vw', maxWidth: '1450px', height: '100vh', maxHeight: '900px' }}>

        {/* EXIT BUTTON - Top left */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-2 left-2 px-3 py-1 bg-red-600/80 hover:bg-red-600 rounded text-xs transition-colors z-20"
        >
          Exit
        </button>

        {/* OPPONENT HAND - At the very top */}
        <div className="flex-shrink-0 flex justify-center py-1">
          <div className="flex gap-0.5">
            {opponent.hand.map((card, index) => (
              <div key={index} className="flex-shrink-0">
                <Card card={card} size="opponent-hand" faceDown={true} />
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GAME AREA */}
        <div className="flex-1 flex gap-3">

          {/* LEFT SIDE - Enemy GY/Deck with HP next to it */}
          <div className="flex items-start gap-4 flex-shrink-0">
            {/* Enemy Profile + HP - Next to deck, at top */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="w-14 h-14 border-2 border-slate-500 bg-gradient-to-br from-slate-700 to-slate-800 rounded flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-7 h-7 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="text-slate-300 text-xs font-bold truncate text-center max-w-[80px]">{opponent.name}</div>
              <HPBar current={opponent.lifePoints} max={8000} width="w-28" size="lg" variant="enemy" />
            </div>
            {/* Enemy GY & Deck */}
            <div className="flex flex-col gap-2">
              {/* Enemy Graveyard */}
              <div
                className="bg-gradient-to-br from-gray-700 to-gray-900 rounded border border-gray-600 flex flex-col items-center justify-center relative"
                style={{ width: '95px', height: '135px' }}
              >
                <span className="text-3xl mb-1">💀</span>
                <div className="text-[10px] text-gray-400">Graveyard</div>
                <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-gray-300">{opponent.graveyard.length}</div>
              </div>
              {/* Enemy Deck */}
              <div className="relative" style={{ width: '95px', height: '135px' }}>
                <div className="absolute top-1 left-1 w-full h-full bg-gradient-to-br from-red-900 to-red-950 rounded border border-red-800" style={{ width: '95px', height: '135px' }} />
                <div className="absolute top-0.5 left-0.5 w-full h-full bg-gradient-to-br from-red-800 to-red-900 rounded border border-red-700" style={{ width: '95px', height: '135px' }} />
                <div
                  className="relative bg-gradient-to-br from-red-700 to-red-800 rounded border border-red-600 flex flex-col items-center justify-center"
                  style={{ width: '95px', height: '135px' }}
                >
                  <span className="text-3xl mb-1">🎴</span>
                  <div className="text-[10px] text-red-200">Deck</div>
                  <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-white">{opponent.deck.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* PLAYER RUNE DECK - Left side (opposite to player's main deck) */}
          <div className="flex flex-col justify-end flex-shrink-0">
            <div className="relative" style={{ width: '95px', height: '135px' }}>
              <div className="absolute top-1 left-1 w-full h-full bg-gradient-to-br from-purple-900 to-purple-950 rounded border border-purple-800" style={{ width: '95px', height: '135px' }} />
              <div className="absolute top-0.5 left-0.5 w-full h-full bg-gradient-to-br from-purple-800 to-purple-900 rounded border border-purple-700" style={{ width: '95px', height: '135px' }} />
              <div
                className="relative bg-gradient-to-br from-purple-700 to-purple-800 rounded border border-purple-600 flex flex-col items-center justify-center cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all"
                style={{ width: '95px', height: '135px' }}
                onClick={() => setShowRunePanel(!showRunePanel)}
              >
                <span className="text-2xl mb-1">◆</span>
                <div className="text-[10px] text-purple-200">Runes</div>
                <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-purple-300">{runeDeck.length - usedRunes.size}</div>
              </div>
            </div>
          </div>

          {/* CENTER - Boards */}
          <div className="flex-1 flex flex-col gap-1 min-w-0">

            {/* Opponent Field */}
            <div className="flex-1 bg-gradient-to-b from-gray-800/40 to-gray-800/60 rounded-lg border border-gray-700/40 p-2 flex items-center justify-center">
              {/* Opponent Field Zones */}
              <div className="flex flex-col justify-center gap-2">
                {/* Opponent Items/Runes */}
                <div className="flex justify-center gap-3">
                  {opponent.field.itemsAndRunes.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-gray-700/30 border border-gray-600/40 rounded flex items-center justify-center"
                      style={{ width: '88px', height: '104px' }}
                    >
                      {slot ? (
                        <Card card={slot.card} size="small" faceDown={!slot.faceUp} />
                      ) : (
                        <div className="w-16 h-20 border border-dashed border-gray-600/30 rounded flex items-center justify-center">
                          <span className="text-gray-700 text-sm">◇</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Opponent Monsters */}
                <div className="flex justify-center gap-3">
                  {opponent.field.monsters.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-gray-700/30 border border-gray-600/40 rounded flex items-center justify-center"
                      style={{ width: '120px', height: '165px' }}
                    >
                      {slot ? (
                        <Card card={slot.card} size="field" />
                      ) : (
                        <div className="w-24 h-32 border border-dashed border-gray-600/30 rounded flex items-center justify-center">
                          <span className="text-gray-700 text-xl">⬡</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Line with Turn Info */}
            <div className="flex-shrink-0 flex items-center gap-3 py-1">
              {/* Turn + Phase indicator on the left */}
              <div
                className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap flex items-center gap-2 ${
                  isMyTurn
                    ? 'bg-green-600/20 text-green-400 border border-green-500/50'
                    : 'bg-red-600/20 text-red-400 border border-red-500/50'
                }`}
              >
                <span>Turn {gameState.turn}</span>
                <span className="text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded text-[10px]">{gameState.phase}</span>
                <span>• {isMyTurn ? 'Your Turn' : 'Enemy'}</span>
              </div>

              {/* Battle line */}
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-yellow-500/50" />
              <span className="text-yellow-500/60 text-xs">⚔</span>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-yellow-500/50" />
            </div>

            {/* Player Field */}
            <div className="flex-1 bg-gradient-to-t from-gray-800/40 to-gray-800/60 rounded-lg border border-blue-900/20 p-2 flex items-center justify-center">
              {/* Player Field Zones */}
              <div className="flex flex-col justify-center gap-2">
                {/* Player Monsters */}
                <div className="flex justify-center gap-3">
                  {currentPlayer.field.monsters.map((slot, index) => (
                    <div
                      key={index}
                      onClick={() => handleFieldClick('monsters', index)}
                      className={`bg-gray-700/30 border rounded flex items-center justify-center cursor-pointer transition-all ${
                        selectedCard !== null && currentPlayer.hand[selectedCard]?.type === 'MONSTER'
                          ? 'border-green-500 shadow-lg shadow-green-500/30'
                          : 'border-gray-600/40 hover:border-yellow-500/50'
                      }`}
                      style={{ width: '120px', height: '165px' }}
                    >
                      {slot ? (
                        <Card card={slot.card} size="field" />
                      ) : (
                        <div className="w-24 h-32 border border-dashed border-gray-600/30 rounded flex items-center justify-center">
                          <span className="text-gray-700 text-xl">⬡</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Player Items/Runes */}
                <div className="flex justify-center gap-3">
                  {currentPlayer.field.itemsAndRunes.map((slot, index) => (
                    <div
                      key={index}
                      onClick={() => handleFieldClick('itemsAndRunes', index)}
                      className={`bg-gray-700/30 border rounded flex items-center justify-center cursor-pointer transition-all ${
                        selectedCard !== null &&
                        (currentPlayer.hand[selectedCard]?.type === 'ITEM' ||
                          currentPlayer.hand[selectedCard]?.type === 'RUNE' ||
                          currentPlayer.hand[selectedCard]?.type === 'SUMMONER_SPELL')
                          ? 'border-green-500 shadow-lg shadow-green-500/30'
                          : 'border-gray-600/40 hover:border-yellow-500/50'
                      }`}
                      style={{ width: '88px', height: '104px' }}
                    >
                      {slot ? (
                        <Card card={slot.card} size="small" faceDown={!slot.faceUp} />
                      ) : (
                        <div className="w-16 h-20 border border-dashed border-gray-600/30 rounded flex items-center justify-center">
                          <span className="text-gray-700 text-sm">◇</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* OPPONENT RUNE DECK - Right side (opposite to opponent's main deck) */}
          <div className="flex flex-col justify-start flex-shrink-0">
            <div className="relative" style={{ width: '95px', height: '135px' }}>
              <div className="absolute top-1 left-1 w-full h-full bg-gradient-to-br from-purple-900 to-purple-950 rounded border border-purple-800" style={{ width: '95px', height: '135px' }} />
              <div className="absolute top-0.5 left-0.5 w-full h-full bg-gradient-to-br from-purple-800 to-purple-900 rounded border border-purple-700" style={{ width: '95px', height: '135px' }} />
              <div
                className="relative bg-gradient-to-br from-purple-700 to-purple-800 rounded border border-purple-600 flex flex-col items-center justify-center"
                style={{ width: '95px', height: '135px' }}
              >
                <span className="text-2xl mb-1">◆</span>
                <div className="text-[10px] text-purple-200">Runes</div>
                <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-purple-300">0</div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - End Turn + Player GY/Deck + HP */}
          <div className="flex flex-col justify-between flex-shrink-0">
            {/* Top spacer */}
            <div className="flex-1" />

            {/* END TURN - At battle line level */}
            <div className="py-2">
              <button
                onClick={handleEndTurn}
                disabled={!isMyTurn}
                className={`w-full px-2 py-3 rounded font-bold text-sm transition-all ${
                  isMyTurn
                    ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 shadow-lg shadow-yellow-500/40'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                END TURN
              </button>
            </div>

            {/* Bottom - Player GY/Deck with HP next to it */}
            <div className="flex-1 flex items-end gap-4">
              {/* Player GY & Deck */}
              <div className="flex flex-col gap-2">
                {/* Player Graveyard */}
                <div
                  className="bg-gradient-to-br from-gray-700 to-gray-900 rounded border border-gray-600 flex flex-col items-center justify-center relative"
                  style={{ width: '95px', height: '135px' }}
                >
                  <span className="text-3xl mb-1">💀</span>
                  <div className="text-[10px] text-gray-400">Graveyard</div>
                  <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-gray-300">{currentPlayer.graveyard.length}</div>
                </div>
                {/* Player Deck */}
                <div className="relative" style={{ width: '95px', height: '135px' }}>
                  <div className="absolute top-1 left-1 w-full h-full bg-gradient-to-br from-blue-900 to-blue-950 rounded border border-blue-800" style={{ width: '95px', height: '135px' }} />
                  <div className="absolute top-0.5 left-0.5 w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 rounded border border-blue-700" style={{ width: '95px', height: '135px' }} />
                  <div
                    className="relative bg-gradient-to-br from-blue-700 to-blue-800 rounded border border-blue-600 flex flex-col items-center justify-center"
                    style={{ width: '95px', height: '135px' }}
                  >
                    <span className="text-3xl mb-1">🎴</span>
                    <div className="text-[10px] text-blue-200">Deck</div>
                    <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-white">{currentPlayer.deck.length}</div>
                  </div>
                </div>
              </div>
              {/* Player Profile + HP - Next to deck, at bottom */}
              <div className="flex flex-col items-center gap-2 pb-1">
                <div className="w-14 h-14 border-2 border-yellow-500 bg-gradient-to-br from-indigo-700 to-purple-800 rounded flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/40">
                  <svg className="w-7 h-7 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="text-yellow-400 text-xs font-bold truncate text-center max-w-[80px]">{currentPlayer.name}</div>
                <HPBar current={currentPlayer.lifePoints} max={8000} width="w-28" size="lg" variant="player" />
              </div>
            </div>
          </div>
        </div>

        {/* PLAYER HAND - At the bottom with more space */}
        <div className="flex-shrink-0 flex justify-center items-end py-3 mt-2" style={{ minHeight: '160px' }}>
          <div className="flex gap-3">
            {currentPlayer.hand.map((card, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(index)}
                className={`cursor-pointer transition-all flex-shrink-0 ${
                  selectedCard === index
                    ? 'transform scale-110 -translate-y-4 z-10'
                    : 'hover:-translate-y-2'
                }`}
              >
                <Card card={card} size="hand" selected={selectedCard === index} />
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER - Runes only */}
        <div className="flex-shrink-0 flex justify-center items-center gap-4 py-1">
          {/* Active Runes */}
          {activeRunes.length > 0 && (
            <div className="flex gap-1">
              {activeRunes.map((ar, index) => (
                <div
                  key={index}
                  className="bg-purple-500/20 border border-purple-500/50 rounded px-2 py-1 flex items-center gap-1"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getPathColor(ar.rune.runePath)}`} />
                  <span className="text-purple-200 text-xs">{ar.rune.name}</span>
                  <span className="text-purple-400 text-[10px]">({ar.turnsRemaining})</span>
                </div>
              ))}
            </div>
          )}

          {runeDeck.length > 0 && (
            <button
              onClick={() => setShowRunePanel(!showRunePanel)}
              className="px-3 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500/30 transition-all"
            >
              ◆ Runes ({runeDeck.length - usedRunes.size}/{runeDeck.length})
            </button>
          )}
        </div>

        {/* Rune Panel Overlay */}
        {showRunePanel && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-slate-900/98 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-3">
              <h3 className="text-white font-bold">Rune Deck</h3>
              <p className="text-purple-200 text-xs">Activate once per duel</p>
            </div>
            <div className="p-3 space-y-2 max-h-[400px] overflow-auto">
              {runeDeck.map((rune) => {
                const isUsed = usedRunes.has(rune.cardId);
                const isActive = activeRunes.some((ar) => ar.rune.cardId === rune.cardId);
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
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPathColor(rune.runePath)} flex items-center justify-center text-white text-sm flex-shrink-0`}
                      >
                        ◆
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
                        <p className="text-purple-300 text-xs mt-1 line-clamp-2">{rune.runeEffect}</p>
                      </div>
                    </div>
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
      </div>
    </div>
  );
}
