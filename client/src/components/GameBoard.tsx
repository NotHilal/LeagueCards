import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Card from './Card';

interface GameBoardProps {
  mode: 'solo' | 'multiplayer';
}

interface GameCard {
  id: string;
  name: string;
  type: 'MONSTER' | 'SPELL' | 'TRAP';
  attack?: number;
  defense?: number;
  level?: number;
  description: string;
  image?: string;
}

interface PlayerState {
  id: string;
  name: string;
  lifePoints: number;
  deck: GameCard[];
  hand: GameCard[];
  field: {
    monsters: (any | null)[];
    spellTrap: (any | null)[];
  };
  graveyard: GameCard[];
}

interface GameState {
  players: [PlayerState, PlayerState];
  currentPlayer: 0 | 1;
  phase: string;
  turn: number;
}

export default function GameBoard({ mode }: GameBoardProps) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [playerIndex, setPlayerIndex] = useState<0 | 1>(0);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');

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

    return () => {
      newSocket.close();
    };
  }, [mode, roomId]);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
  };

  const handleFieldClick = (zone: 'monsters' | 'spellTrap', index: number) => {
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
    } else if (zone === 'spellTrap' && (card.type === 'SPELL' || card.type === 'TRAP')) {
      currentPlayerState.field.spellTrap[index] = { card, faceUp: card.type === 'SPELL' };
      currentPlayerState.hand.splice(selectedCard, 1);
      setSelectedCard(null);
      setGameState({ ...gameState });
    }
  };

  const handleEndTurn = () => {
    if (!socket || !gameState) return;

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
    <div className="game-board min-h-screen p-4">
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
        <div className="text-lg">
          Phase: <span className="text-lol-blue">{gameState.phase}</span>
        </div>
      </div>

      {/* Opponent Field */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold">{opponent.name}</div>
          <div className="text-xl text-red-400">LP: {opponent.lifePoints}</div>
        </div>

        {/* Opponent Spell/Trap Zone */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {opponent.field.spellTrap.map((slot, index) => (
            <div
              key={index}
              className="aspect-[2/3] bg-gray-700 border-2 border-gray-600 rounded flex items-center justify-center"
            >
              {slot ? (
                <Card card={slot.card} size="small" faceDown={!slot.faceUp} />
              ) : (
                <span className="text-gray-500 text-xs">S/T</span>
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

        {/* Player Spell/Trap Zone */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {currentPlayer.field.spellTrap.map((slot, index) => (
            <div
              key={index}
              onClick={() => handleFieldClick('spellTrap', index)}
              className={`aspect-[2/3] bg-gray-700 border-2 rounded flex items-center justify-center cursor-pointer hover:border-lol-gold transition-colors ${
                selectedCard !== null &&
                (currentPlayer.hand[selectedCard]?.type === 'SPELL' ||
                  currentPlayer.hand[selectedCard]?.type === 'TRAP')
                  ? 'border-green-500'
                  : 'border-gray-600'
              }`}
            >
              {slot ? (
                <Card card={slot.card} size="small" faceDown={!slot.faceUp} />
              ) : (
                <span className="text-gray-500 text-xs">S/T</span>
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
