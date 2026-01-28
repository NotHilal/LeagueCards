import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Card from './Card';
import HPBar from './HPBar';
import GoldDisplay from './GoldDisplay';
import RegionSynergyPanel from './RegionSynergyPanel';
import SummonerSpellPanel from './SummonerSpellPanel';
import { useAuth } from '../context/AuthContext';

interface GameBoardProps {
  mode: 'solo' | 'multiplayer';
}

interface ItemCard {
  id: string;
  name: string;
  type: 'ITEM';
  goldCost?: number;
  atkBonus?: number;
  defBonus?: number;
  itemEffect?: string;
  description: string;
}

interface GameCard {
  id: string;
  name: string;
  type: 'MONSTER' | 'ITEM' | 'RUNE' | 'SUMMONER_SPELL' | 'JUNGLE_MONSTER';
  attack?: number;
  defense?: number;
  level?: number;
  description: string;
  image?: string;
  runeEffect?: string;
  runePath?: string;
  region?: string;
  goldCost?: number;
  atkBonus?: number;
  defBonus?: number;
  teamEffect?: string;
  summonerEffect?: string;
}

interface FieldCard {
  card: GameCard;
  position: 'ATTACK' | 'DEFENSE' | 'FACE_DOWN_DEFENSE';
  faceUp: boolean;
  turnsOnBoard: number;
  hasAttacked: boolean;
  hasChangedPosition: boolean;
  currentAttack: number;
  currentDefense: number;
  equippedItems: ItemCard[];
  isInvincible: boolean;
  attackModifier: number;
  defenseModifier: number;
  hasUsedSpell: boolean;
  hasUsedUltimate: boolean;
}

interface RegionBonus {
  region: string;
  count: number;
  twoPlus: boolean;
  fourPlus: boolean;
}

interface SummonerSpell {
  id: string;
  name: string;
  type: 'SUMMONER_SPELL';
  summonerEffect?: string;
}

interface PlayerState {
  id: string;
  name: string;
  lifePoints: number;
  deck: GameCard[];
  hand: GameCard[];
  field: {
    champions: (FieldCard | null)[];
    spellZone: (FieldCard | null)[];
    jungleMonster: FieldCard | null;
  };
  graveyard: GameCard[];
  gold: number;
  spellDeck: SummonerSpell[];
  usedSummonerSpells: string[];
  regionCounts: Record<string, number>;
  regionBonuses: RegionBonus[];
  hasUsedRevive: boolean;
  hasGottenNoxusKillGold: boolean;
}

interface GameState {
  players: [PlayerState, PlayerState];
  currentPlayer: 0 | 1;
  phase: 'DRAW' | 'STANDBY' | 'MAIN1' | 'BATTLE' | 'END';
  turn: number;
  winner?: string;
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

type GameMode = 'normal' | 'attack' | 'equip' | 'target_spell';
type SummonMode = 'attack' | 'defense';

const RUNE_DURATION = 3;

export default function GameBoard({ mode }: GameBoardProps) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [playerIndex, setPlayerIndex] = useState<0 | 1>(0);

  // Game mode state
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [summonMode, setSummonMode] = useState<SummonMode>('attack');
  const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [pendingSpellType, setPendingSpellType] = useState<string | null>(null);

  // Interrupt window state
  const [showInterruptWindow, setShowInterruptWindow] = useState(false);
  const [interruptCallback, setInterruptCallback] = useState<(() => void) | null>(null);
  const [isInInterruptMode, setIsInInterruptMode] = useState(false); // Allows spell usage during interrupt
  const previousPhaseRef = useRef<string | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI panels
  const [showSpellPanel, setShowSpellPanel] = useState(false);
  const [showSynergyPanel, setShowSynergyPanel] = useState(false);

  // Card preview state
  const [previewCard, setPreviewCard] = useState<GameCard | null>(null);

  // Drag and drop state
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  const [draggedCardType, setDraggedCardType] = useState<'MONSTER' | 'ITEM' | 'RUNE' | null>(null);

  // Pending monster drop state (for showing ATK/DEF choice after drop)
  const [pendingMonsterDrop, setPendingMonsterDrop] = useState<{
    cardIndex: number;
    fieldIndex: number;
  } | null>(null);
  const dragImageRef = useRef<HTMLDivElement | null>(null);

  // Pending item equip state (for showing champion selection popup)
  const [pendingItemEquip, setPendingItemEquip] = useState<{
    cardIndex: number;
    card: GameCard;
  } | null>(null);

  // Rune Deck state (kept for backwards compatibility)
  const [runeDeck, setRuneDeck] = useState<RuneCard[]>([]);
  const [usedRunes, setUsedRunes] = useState<Set<string>>(new Set());
  const [activeRunes, setActiveRunes] = useState<ActiveRune[]>([]);
  const [showRunePanel, setShowRunePanel] = useState(false);
  const [selectedDeckId] = useState<string | null>(null);

  // Fetch rune deck from selected deck
  useEffect(() => {
    const fetchDeckRunes = async () => {
      if (!selectedDeckId) return;

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

    newSocket.on('combat_result', (result: any) => {
      console.log('Combat result:', result);
      setGameMode('normal');
      setSelectedAttacker(null);
    });

    newSocket.on('action_error', (err: { error: string }) => {
      console.error('Action error:', err.error);
      alert(err.error);
    });

    newSocket.on('error', (err: { message: string }) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      newSocket.close();
    };
  }, [mode, roomId, user?.username]);

  // Detect when enemy enters battle phase and show interrupt window
  useEffect(() => {
    if (!gameState) return;

    const isMyTurn = gameState.currentPlayer === playerIndex;
    const currentPhase = gameState.phase;
    const prevPhase = previousPhaseRef.current;

    // Enemy is entering battle phase
    if (!isMyTurn && currentPhase === 'BATTLE' && prevPhase !== 'BATTLE') {
      const hasUnusedSpells = (currentPlayer?.spellDeck?.length || 0) > (currentPlayer?.usedSummonerSpells?.length || 0);
      if (hasUnusedSpells) {
        setShowInterruptWindow(true);
      }
    }

    previousPhaseRef.current = currentPhase;
  }, [gameState?.phase, gameState?.currentPlayer, playerIndex]);

  const currentPlayer = gameState?.players[playerIndex];

  // Activate a rune
  const activateRune = (rune: RuneCard) => {
    if (usedRunes.has(rune.cardId)) return;
    if (!gameState || gameState.currentPlayer !== playerIndex) return;

    setUsedRunes(prev => new Set([...prev, rune.cardId]));
    setActiveRunes(prev => [...prev, { rune, turnsRemaining: RUNE_DURATION }]);
    setShowRunePanel(false);
  };

  // Decrement rune durations
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

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Prevent closing preview
    if (!gameState) return;

    const currentPlayerState = gameState.players[playerIndex];
    const card = currentPlayerState.hand[index];

    // Show card preview
    if (card) {
      setPreviewCard(card);
    }

    if (gameMode === 'equip' && card?.type === 'ITEM') {
      setSelectedItemIndex(index);
      setSelectedCard(null);
    } else {
      setSelectedCard(selectedCard === index ? null : index);
      setSelectedItemIndex(null);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number, card: GameCard, cardElement: HTMLElement | null) => {
    if (!gameState || gameState.currentPlayer !== playerIndex || gameState.phase !== 'MAIN1') return;

    setDraggedCardIndex(index);
    setDraggedCardType(card.type as 'MONSTER' | 'ITEM' | 'RUNE');
    e.dataTransfer.effectAllowed = 'move';

    // Create custom drag image from the card element
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      e.dataTransfer.setDragImage(cardElement, rect.width / 2, rect.height / 2);
    }
  };

  const handleDragEnd = () => {
    setDraggedCardIndex(null);
    setDraggedCardType(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnField = (zone: 'champions' | 'spellZone', index: number) => {
    if (draggedCardIndex === null || !gameState) return;
    if (gameState.currentPlayer !== playerIndex) return;

    const currentPlayerState = gameState.players[playerIndex];
    const card = currentPlayerState.hand[draggedCardIndex];

    if (!card) return;

    // Monster to champions zone - show ATK/DEF choice first
    if (zone === 'champions' && card.type === 'MONSTER') {
      if (currentPlayerState.field.champions[index] !== null) return;

      // Store pending drop and show position selection
      setPendingMonsterDrop({
        cardIndex: draggedCardIndex,
        fieldIndex: index,
      });
      setDraggedCardIndex(null);
      setDraggedCardType(null);
      return;
    }
    // Item to spell zone - show equip popup if there are champions
    else if (zone === 'spellZone' && card.type === 'ITEM') {
      const hasChampions = currentPlayerState.field.champions.some(c => c !== null);

      if (hasChampions) {
        // Show popup to choose champion
        setPendingItemEquip({
          cardIndex: draggedCardIndex,
          card: card,
        });
        setDraggedCardIndex(null);
        setDraggedCardType(null);
        return;
      } else {
        // General item - apply effect to all champions or place in spell zone
        if (currentPlayerState.field.spellZone[index] !== null) return;

        const fieldCard: FieldCard = {
          card,
          position: 'DEFENSE',
          faceUp: true,
          turnsOnBoard: 0,
          hasAttacked: false,
          hasChangedPosition: false,
          currentAttack: 0,
          currentDefense: 0,
          equippedItems: [],
          isInvincible: false,
          attackModifier: 0,
          defenseModifier: 0,
          hasUsedSpell: false,
          hasUsedUltimate: false,
        };

        currentPlayerState.field.spellZone[index] = fieldCard;
        currentPlayerState.hand.splice(draggedCardIndex, 1);
        setSelectedCard(null);
        setGameState({ ...gameState });
      }
    }
    // Rune to spell zone
    else if (zone === 'spellZone' && card.type === 'RUNE') {
      if (currentPlayerState.field.spellZone[index] !== null) return;

      const fieldCard: FieldCard = {
        card,
        position: 'DEFENSE',
        faceUp: false,
        turnsOnBoard: 0,
        hasAttacked: false,
        hasChangedPosition: false,
        currentAttack: 0,
        currentDefense: 0,
        equippedItems: [],
        isInvincible: false,
        attackModifier: 0,
        defenseModifier: 0,
        hasUsedSpell: false,
        hasUsedUltimate: false,
      };

      currentPlayerState.field.spellZone[index] = fieldCard;
      currentPlayerState.hand.splice(draggedCardIndex, 1);
      setSelectedCard(null);
      setGameState({ ...gameState });
    }

    setDraggedCardIndex(null);
    setDraggedCardType(null);
  };

  // Confirm monster placement with chosen position
  const confirmMonsterPlacement = (position: 'attack' | 'defense') => {
    if (!pendingMonsterDrop || !gameState) return;

    const currentPlayerState = gameState.players[playerIndex];
    const card = currentPlayerState.hand[pendingMonsterDrop.cardIndex];

    if (!card) {
      setPendingMonsterDrop(null);
      return;
    }

    const fieldPosition = position === 'defense' ? 'FACE_DOWN_DEFENSE' : 'ATTACK';
    const faceUp = position === 'attack';

    const fieldCard: FieldCard = {
      card,
      position: fieldPosition,
      faceUp,
      turnsOnBoard: 0,
      hasAttacked: false,
      hasChangedPosition: false,
      currentAttack: card.attack || 0,
      currentDefense: card.defense || 0,
      equippedItems: [],
      isInvincible: false,
      attackModifier: 0,
      defenseModifier: 0,
      hasUsedSpell: false,
      hasUsedUltimate: false,
    };

    currentPlayerState.field.champions[pendingMonsterDrop.fieldIndex] = fieldCard;
    currentPlayerState.hand.splice(pendingMonsterDrop.cardIndex, 1);
    setSelectedCard(null);
    setPendingMonsterDrop(null);
    setGameState({ ...gameState });
  };

  const cancelMonsterPlacement = () => {
    setPendingMonsterDrop(null);
  };

  // Equip item to a specific champion
  const equipItemToChampion = (championIndex: number) => {
    if (!pendingItemEquip || !gameState) return;

    const currentPlayerState = gameState.players[playerIndex];
    const card = currentPlayerState.hand[pendingItemEquip.cardIndex];

    if (!card) {
      setPendingItemEquip(null);
      return;
    }

    const champion = currentPlayerState.field.champions[championIndex];
    if (!champion) {
      setPendingItemEquip(null);
      return;
    }

    // Check if player has enough gold
    const goldCost = card.goldCost || 0;
    if (currentPlayerState.gold < goldCost) {
      alert('Not enough gold!');
      setPendingItemEquip(null);
      return;
    }

    // Deduct gold
    currentPlayerState.gold -= goldCost;

    // Add item to champion's equipped items
    if (!champion.equippedItems) {
      champion.equippedItems = [];
    }
    champion.equippedItems.push({
      id: card.id,
      name: card.name,
      atkBonus: card.atkBonus,
      defBonus: card.defBonus,
      goldCost: card.goldCost,
    });

    // Apply stat bonuses
    champion.currentAttack += card.atkBonus || 0;
    champion.currentDefense += card.defBonus || 0;

    // Place item in spell zone
    const emptySpellSlot = currentPlayerState.field.spellZone.findIndex(slot => slot === null);
    if (emptySpellSlot !== -1) {
      const fieldCard: FieldCard = {
        card,
        position: 'DEFENSE',
        faceUp: true,
        turnsOnBoard: 0,
        hasAttacked: false,
        hasChangedPosition: false,
        currentAttack: 0,
        currentDefense: 0,
        equippedItems: [],
        isInvincible: false,
        attackModifier: 0,
        defenseModifier: 0,
        hasUsedSpell: false,
        hasUsedUltimate: false,
      };
      currentPlayerState.field.spellZone[emptySpellSlot] = fieldCard;
    }

    // Remove item from hand
    currentPlayerState.hand.splice(pendingItemEquip.cardIndex, 1);

    setPendingItemEquip(null);
    setSelectedCard(null);
    setGameState({ ...gameState });
  };

  const cancelItemEquip = () => {
    setPendingItemEquip(null);
  };

  // Preview field card - can always see your own cards, only face-up for opponent
  const handleFieldCardClick = (e: React.MouseEvent, fieldCard: FieldCard | null, isOpponent: boolean) => {
    e.stopPropagation(); // Prevent closing preview when clicking cards
    if (fieldCard) {
      // Can see own cards (even face-down) or opponent's face-up cards
      if (!isOpponent || fieldCard.faceUp) {
        setPreviewCard(fieldCard.card);
      }
    }
  };

  const handleFieldClick = (zone: 'champions' | 'spellZone', index: number) => {
    if (selectedCard === null || !gameState) return;
    if (gameState.currentPlayer !== playerIndex) return;

    const currentPlayerState = gameState.players[playerIndex];
    const card = currentPlayerState.hand[selectedCard];

    if (!card) return;

    // Equip mode - equip item to champion
    if (gameMode === 'equip' && selectedItemIndex !== null && zone === 'champions') {
      const champion = currentPlayerState.field.champions[index];
      if (champion && socket) {
        socket.emit('equip_item', {
          roomId: mode === 'multiplayer' ? roomId : `solo_${socket.id}`,
          itemIndex: selectedItemIndex,
          championIndex: index,
        });
        setGameMode('normal');
        setSelectedItemIndex(null);
      }
      return;
    }

    // Normal placement
    if (zone === 'champions' && card.type === 'MONSTER') {
      if (currentPlayerState.field.champions[index] !== null) return;

      // Use summonMode to determine position
      const position = summonMode === 'defense' ? 'FACE_DOWN_DEFENSE' : 'ATTACK';
      const faceUp = summonMode === 'attack';

      const fieldCard: FieldCard = {
        card,
        position,
        faceUp,
        turnsOnBoard: 0,
        hasAttacked: false,
        hasChangedPosition: false,
        currentAttack: card.attack || 0,
        currentDefense: card.defense || 0,
        equippedItems: [],
        isInvincible: false,
        attackModifier: 0,
        defenseModifier: 0,
        hasUsedSpell: false,
        hasUsedUltimate: false,
      };

      currentPlayerState.field.champions[index] = fieldCard;
      currentPlayerState.hand.splice(selectedCard, 1);
      setSelectedCard(null);
      setSummonMode('attack'); // Reset to attack mode after summoning
      setGameState({ ...gameState });
    } else if (zone === 'spellZone' && (card.type === 'ITEM' || card.type === 'RUNE' || card.type === 'SUMMONER_SPELL')) {
      // For items, show champion selection popup if there are champions
      if (card.type === 'ITEM') {
        const hasChampions = currentPlayerState.field.champions.some(c => c !== null);

        if (hasChampions) {
          // Show popup to choose champion (treat all items as equipable for now)
          setPendingItemEquip({
            cardIndex: selectedCard,
            card: card,
          });
          return;
        }
      }

      // Non-equipable items, runes, or summoner spells go to spell zone
      if (currentPlayerState.field.spellZone[index] !== null) return;

      const fieldCard: FieldCard = {
        card,
        position: 'DEFENSE',
        faceUp: card.type !== 'RUNE',
        turnsOnBoard: 0,
        hasAttacked: false,
        hasChangedPosition: false,
        currentAttack: 0,
        currentDefense: 0,
        equippedItems: [],
        isInvincible: false,
        attackModifier: 0,
        defenseModifier: 0,
        hasUsedSpell: false,
        hasUsedUltimate: false,
      };

      currentPlayerState.field.spellZone[index] = fieldCard;
      currentPlayerState.hand.splice(selectedCard, 1);
      setSelectedCard(null);
      setGameState({ ...gameState });
    }
  };

  const handleChampionClick = (index: number, isOpponent: boolean) => {
    if (!gameState) return;

    const isMyTurn = gameState.currentPlayer === playerIndex;

    // Attack mode - selecting target
    if (gameMode === 'attack' && selectedAttacker !== null && isOpponent && isMyTurn) {
      if (socket) {
        socket.emit('declare_attack', {
          roomId: mode === 'multiplayer' ? roomId : `solo_${socket.id}`,
          attackerIndex: selectedAttacker,
          targetIndex: index,
        });
      }
      return;
    }

    // Selecting own champion as attacker
    if (!isOpponent && isMyTurn && gameState.phase === 'BATTLE') {
      const champion = gameState.players[playerIndex].field.champions[index];
      if (champion && !champion.hasAttacked && champion.position === 'ATTACK' && champion.turnsOnBoard > 0) {
        setGameMode('attack');
        setSelectedAttacker(index);
      }
    }
  };

  const handleDirectAttack = () => {
    if (!gameState || !socket) return;
    if (gameMode !== 'attack' || selectedAttacker === null) return;

    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponent = gameState.players[opponentIndex];
    const hasDefenders = opponent.field.champions.some(c => c !== null);

    if (!hasDefenders) {
      socket.emit('declare_attack', {
        roomId: mode === 'multiplayer' ? roomId : `solo_${socket.id}`,
        attackerIndex: selectedAttacker,
        targetIndex: -1,
      });
    }
  };

  const handleChangePosition = (index: number) => {
    if (!gameState || !socket) return;
    if (gameState.currentPlayer !== playerIndex) return;
    if (gameState.phase !== 'MAIN1') return;

    const champion = gameState.players[playerIndex].field.champions[index];
    if (!champion || champion.hasChangedPosition || champion.turnsOnBoard === 0) return;

    const newPosition = champion.position === 'ATTACK' ? 'DEFENSE' : 'ATTACK';

    // Update locally for solo mode
    if (mode === 'solo') {
      champion.position = newPosition;
      champion.hasChangedPosition = true;
      champion.faceUp = true;
      setGameState({ ...gameState });
    } else {
      socket.emit('game_action', {
        roomId: roomId,
        action: {
          type: 'CHANGE_POSITION',
          data: { cardFieldIndex: index, newPosition },
        },
      });
    }
  };

  const handleChangePhase = () => {
    if (!socket || !gameState) return;
    if (gameState.currentPlayer !== playerIndex) return;

    // For solo mode, update locally
    if (mode === 'solo') {
      const phaseOrder = ['DRAW', 'STANDBY', 'MAIN1', 'BATTLE', 'END'];
      const currentIndex = phaseOrder.indexOf(gameState.phase);
      if (currentIndex < phaseOrder.length - 1) {
        gameState.phase = phaseOrder[currentIndex + 1] as any;
        setGameState({ ...gameState });
      }
    } else {
      socket.emit('change_phase', roomId);
    }
  };

  const handleUseSummonerSpell = (spellType: string, data?: any) => {
    if (!socket || !gameState) return;

    if (data?.needsTarget) {
      setPendingSpellType(spellType);
      setGameMode('target_spell');
      setShowSpellPanel(false);
      setShowInterruptWindow(false);
      return;
    }

    // For solo mode, handle spell effects locally
    if (mode === 'solo') {
      const player = gameState.players[playerIndex];

      if (spellType === 'IGNITE') {
        const opponentIdx = playerIndex === 0 ? 1 : 0;
        gameState.players[opponentIdx].lifePoints = Math.max(0, gameState.players[opponentIdx].lifePoints - 400);
        if (!player.usedSummonerSpells) player.usedSummonerSpells = [];
        player.usedSummonerSpells.push('IGNITE');
        setGameState({ ...gameState });
      } else if (spellType === 'HEAL') {
        player.lifePoints = Math.min(8000, player.lifePoints + 600);
        if (!player.usedSummonerSpells) player.usedSummonerSpells = [];
        player.usedSummonerSpells.push('HEAL');
        setGameState({ ...gameState });
      }
      // Add other spell effects as needed
    } else {
      socket.emit('use_summoner_spell', {
        roomId: roomId,
        spellType,
        data,
      });
    }

    setShowSpellPanel(false);
    setShowInterruptWindow(false);
    setIsInInterruptMode(false);

    // Continue AI attacks after spell is used (if it's AI's turn)
    if (mode === 'solo' && gameState.currentPlayer !== playerIndex) {
      setTimeout(() => continueAIAttacks(gameState), 500);
    }
  };

  const handleInterruptSkip = () => {
    setShowInterruptWindow(false);
    setIsInInterruptMode(false);
    // Clear the AI timeout and continue attacks immediately
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    // Continue AI attacks after skip
    if (gameState) {
      setTimeout(() => continueAIAttacks(gameState), 500);
    }
  };

  const handleInterruptUseSpell = () => {
    setShowInterruptWindow(false);
    setIsInInterruptMode(true); // Keep interrupt mode active so spells can be used
    // Clear the AI timeout - attacks will continue after spell is used
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setShowSpellPanel(true);
  };

  const handleEndTurn = () => {
    if (!socket || !gameState) return;

    setGameMode('normal');
    setSelectedAttacker(null);
    setSelectedCard(null);
    setSelectedItemIndex(null);
    setSummonMode('attack');

    decrementRuneDurations();

    if (mode === 'multiplayer' && roomId) {
      socket.emit('end_turn', roomId);
    } else {
      // Solo mode - simple AI turn simulation
      const newState = { ...gameState };
      newState.currentPlayer = newState.currentPlayer === 0 ? 1 : 0;

      const currentPlayer = newState.players[newState.currentPlayer];
      if (currentPlayer.deck.length > 0) {
        const drawnCard = currentPlayer.deck.shift()!;
        currentPlayer.hand.push(drawnCard);
      }

      currentPlayer.gold = (currentPlayer.gold || 500) + 100;

      currentPlayer.field.champions.forEach(fc => {
        if (fc) {
          fc.turnsOnBoard++;
          fc.hasAttacked = false;
          fc.hasChangedPosition = false;
          fc.hasUsedSpell = false;
          fc.isInvincible = false;
          fc.attackModifier = 0;
        }
      });

      newState.phase = 'MAIN1';
      newState.turn++;
      setGameState(newState);

      if (newState.currentPlayer === 1) {
        setTimeout(() => {
          performAIMove(newState);
        }, 1500);
      }
    }
  };

  const performAIMove = (state: GameState) => {
    const aiPlayer = state.players[1];
    const humanPlayer = state.players[0];

    // AI: Summon monsters
    const monsterCard = aiPlayer.hand.findIndex(c => c.type === 'MONSTER');
    if (monsterCard !== -1) {
      const emptySlot = aiPlayer.field.champions.findIndex(slot => slot === null);
      if (emptySlot !== -1) {
        const card = aiPlayer.hand[monsterCard];
        aiPlayer.field.champions[emptySlot] = {
          card,
          position: 'ATTACK',
          faceUp: true,
          turnsOnBoard: 0,
          hasAttacked: false,
          hasChangedPosition: false,
          currentAttack: card.attack || 0,
          currentDefense: card.defense || 0,
          equippedItems: [],
          isInvincible: false,
          attackModifier: 0,
          defenseModifier: 0,
          hasUsedSpell: false,
          hasUsedUltimate: false,
        };
        aiPlayer.hand.splice(monsterCard, 1);
      }
    }

    // Show interrupt window before AI attacks
    const hasAttackers = aiPlayer.field.champions.some(fc => fc && fc.turnsOnBoard > 0 && fc.position === 'ATTACK');
    const playerHasSpells = (humanPlayer.spellDeck?.length || 0) > (humanPlayer.usedSummonerSpells?.length || 0);

    if (hasAttackers && playerHasSpells) {
      state.phase = 'BATTLE';
      setGameState({ ...state });
      setShowInterruptWindow(true);
      setIsInInterruptMode(true); // Enable interrupt mode

      // Wait for player to respond, then continue AI attacks
      aiTimeoutRef.current = setTimeout(() => {
        setShowInterruptWindow(false);
        setIsInInterruptMode(false);
        continueAIAttacks(state);
      }, 5000); // 5 second window to respond
    } else {
      state.phase = 'BATTLE';
      setGameState({ ...state });
      setTimeout(() => continueAIAttacks(state), 500);
    }
  };

  const continueAIAttacks = (state: GameState) => {
    const aiPlayer = state.players[1];
    const humanPlayer = state.players[0];

    // AI: Attack with available champions
    aiPlayer.field.champions.forEach((fc, idx) => {
      if (fc && !fc.hasAttacked && fc.position === 'ATTACK' && fc.turnsOnBoard > 0) {
        const targetIdx = humanPlayer.field.champions.findIndex(c => c !== null);

        if (targetIdx !== -1) {
          const target = humanPlayer.field.champions[targetIdx]!;
          const atkValue = fc.currentAttack || fc.card.attack || 0;
          const defValue = target.position === 'ATTACK'
            ? (target.currentAttack || target.card.attack || 0)
            : (target.currentDefense || target.card.defense || 0);

          if (atkValue >= defValue) {
            fc.hasAttacked = true;

            if (target.position === 'ATTACK') {
              if (atkValue > defValue) {
                humanPlayer.graveyard.push(target.card);
                humanPlayer.field.champions[targetIdx] = null;
                humanPlayer.lifePoints -= (atkValue - defValue);
              } else if (atkValue === defValue) {
                humanPlayer.graveyard.push(target.card);
                humanPlayer.field.champions[targetIdx] = null;
                aiPlayer.graveyard.push(fc.card);
                aiPlayer.field.champions[idx] = null;
              }
            } else {
              if (atkValue > defValue) {
                humanPlayer.graveyard.push(target.card);
                humanPlayer.field.champions[targetIdx] = null;
              }
            }
          }
        } else {
          fc.hasAttacked = true;
          humanPlayer.lifePoints -= (fc.currentAttack || fc.card.attack || 0);
        }
      }
    });

    if (humanPlayer.lifePoints <= 0) {
      state.winner = aiPlayer.id;
    }

    // End AI turn
    state.currentPlayer = 0;
    state.phase = 'MAIN1';
    state.turn++;

    humanPlayer.field.champions.forEach(fc => {
      if (fc) {
        fc.turnsOnBoard++;
        fc.hasAttacked = false;
        fc.hasChangedPosition = false;
        fc.hasUsedSpell = false;
        fc.isInvincible = false;
        fc.attackModifier = 0;
      }
    });

    humanPlayer.gold = (humanPlayer.gold || 500) + 100;

    if (humanPlayer.deck.length > 0) {
      const drawnCard = humanPlayer.deck.shift()!;
      humanPlayer.hand.push(drawnCard);
    }

    setGameState({ ...state });
  };

  const cancelMode = () => {
    setGameMode('normal');
    setSelectedAttacker(null);
    setSelectedItemIndex(null);
    setPendingSpellType(null);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-2xl text-lol-gold">Loading game...</div>
      </div>
    );
  }

  const currentPlayerState = gameState.players[playerIndex];
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0];
  const isMyTurn = gameState.currentPlayer === playerIndex;
  const canUseSummonerSpells = !isMyTurn || isInInterruptMode; // Allow during interrupt mode

  // Check if selected card is a monster for showing summon mode toggle
  const selectedCardIsMonster = selectedCard !== null && currentPlayerState.hand[selectedCard]?.type === 'MONSTER';

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-950 overflow-hidden"
      onClick={() => setPreviewCard(null)}
    >
      <div className="flex flex-col p-2 relative" style={{ width: '100vw', maxWidth: '1450px', height: '100vh', maxHeight: '900px' }}>

        {/* TOP BAR - Exit, Gold, Synergies */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1 bg-red-600/80 hover:bg-red-600 rounded text-xs transition-colors"
          >
            Exit
          </button>

          <div className="flex items-center gap-4">
            {currentPlayerState.regionBonuses && currentPlayerState.regionBonuses.length > 0 && (
              <button
                onClick={() => setShowSynergyPanel(!showSynergyPanel)}
                className="px-3 py-1 bg-purple-600/60 hover:bg-purple-600/80 rounded text-xs text-purple-200 border border-purple-500/50"
              >
                Synergies ({currentPlayerState.regionBonuses.length})
              </button>
            )}
          </div>
        </div>

        {/* Synergy Panel Overlay */}
        {showSynergyPanel && currentPlayerState.regionBonuses && (
          <div className="absolute top-12 right-2 z-30">
            <RegionSynergyPanel regionBonuses={currentPlayerState.regionBonuses} />
            <button
              onClick={() => setShowSynergyPanel(false)}
              className="mt-2 w-full text-center text-slate-400 text-sm hover:text-white"
            >
              Close
            </button>
          </div>
        )}

        {/* Card Preview Panel */}
        {previewCard && (
          <div className="fixed top-[80px] right-[250px] z-40 pointer-events-none">
            {/* Custom large readable card */}
            <div className="relative pointer-events-auto">
              {/* Outer glow */}
              <div className={`absolute -inset-1 rounded-2xl blur-md opacity-60 ${
                previewCard.type === 'MONSTER' ? 'bg-orange-500' :
                previewCard.type === 'ITEM' ? 'bg-green-500' :
                previewCard.type === 'RUNE' ? 'bg-purple-500' : 'bg-blue-500'
              }`} />

              <div className={`relative w-[200px] h-[310px] rounded-xl overflow-hidden shadow-2xl border-2 flex flex-col ${
                previewCard.type === 'MONSTER' ? 'border-orange-400/80' :
                previewCard.type === 'ITEM' ? 'border-green-400/80' :
                previewCard.type === 'RUNE' ? 'border-purple-400/80' : 'border-blue-400/80'
              } bg-gradient-to-b from-slate-800 to-slate-950`}>

                {/* Header */}
                <div className={`px-2 py-1.5 ${
                  previewCard.type === 'MONSTER' ? 'bg-gradient-to-r from-orange-600/90 to-orange-800/90' :
                  previewCard.type === 'ITEM' ? 'bg-gradient-to-r from-green-600/90 to-green-800/90' :
                  previewCard.type === 'RUNE' ? 'bg-gradient-to-r from-purple-600/90 to-purple-800/90' : 'bg-gradient-to-r from-blue-600/90 to-blue-800/90'
                }`}>
                  <h3 className="text-white font-bold text-sm drop-shadow-lg truncate">{previewCard.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-white/80 text-[10px] font-medium">{previewCard.type}</span>
                    {previewCard.region && (
                      <span className="text-yellow-300 text-[10px] font-medium">• {previewCard.region}</span>
                    )}
                  </div>
                </div>

                {/* Image Area */}
                <div className="h-[145px] bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center relative">
                  {previewCard.image ? (
                    <img
                      src={previewCard.image.startsWith('/') ? `http://localhost:3001${previewCard.image}` : `http://localhost:3001/images/cards/${previewCard.image}`}
                      alt={previewCard.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl drop-shadow-lg">
                      {previewCard.type === 'MONSTER' ? '⚔️' : previewCard.type === 'ITEM' ? '🛡️' : previewCard.type === 'RUNE' ? '🔮' : '✨'}
                    </span>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Stats for Monsters */}
                {(previewCard.type === 'MONSTER' || previewCard.type === 'JUNGLE_MONSTER') && (
                  <div className="flex justify-center gap-2 px-2 py-1.5 bg-black/60">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-orange-600 to-orange-700 px-2 py-1 rounded-md shadow-lg">
                      <span className="text-sm">⚔️</span>
                      <span className="text-white font-bold text-sm">{previewCard.attack}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-1 rounded-md shadow-lg">
                      <span className="text-sm">🛡️</span>
                      <span className="text-white font-bold text-sm">{previewCard.defense}</span>
                    </div>
                  </div>
                )}

                {/* Item stats */}
                {previewCard.type === 'ITEM' && (previewCard.atkBonus || previewCard.defBonus || previewCard.goldCost) && (
                  <div className="flex justify-center gap-1 px-2 py-1.5 bg-black/60">
                    {previewCard.goldCost && (
                      <div className="flex items-center bg-yellow-600/80 px-1.5 py-0.5 rounded-md">
                        <span className="text-yellow-200 font-bold text-xs">{previewCard.goldCost}g</span>
                      </div>
                    )}
                    {previewCard.atkBonus && (
                      <div className="flex items-center bg-orange-600/80 px-1.5 py-0.5 rounded-md">
                        <span className="text-white font-bold text-xs">+{previewCard.atkBonus}</span>
                      </div>
                    )}
                    {previewCard.defBonus && (
                      <div className="flex items-center bg-blue-600/80 px-1.5 py-0.5 rounded-md">
                        <span className="text-white font-bold text-xs">+{previewCard.defBonus}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="p-2 bg-slate-900/95 flex-1 overflow-auto">
                  <p className="text-gray-200 text-xs leading-relaxed">{previewCard.description}</p>
                  {previewCard.itemEffect && (
                    <p className="text-green-400 text-xs mt-1 italic border-t border-green-500/30 pt-1">{previewCard.itemEffect}</p>
                  )}
                  {previewCard.runeEffect && (
                    <p className="text-purple-400 text-xs mt-1 italic border-t border-purple-500/30 pt-1">{previewCard.runeEffect}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Monster Drop - Position Selection */}
        {pendingMonsterDrop && gameState && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 border-2 border-yellow-500 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Choose Position</h3>
              <p className="text-gray-300 text-sm mb-4">
                Summoning: {gameState.players[playerIndex].hand[pendingMonsterDrop.cardIndex]?.name}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => confirmMonsterPlacement('attack')}
                  className="px-6 py-3 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-lg shadow-lg flex flex-col items-center gap-1"
                >
                  <span className="text-2xl">⚔️</span>
                  <span>ATK Position</span>
                  <span className="text-xs text-orange-200">Face-up</span>
                </button>
                <button
                  onClick={() => confirmMonsterPlacement('defense')}
                  className="px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg flex flex-col items-center gap-1"
                >
                  <span className="text-2xl">🛡️</span>
                  <span>DEF Position</span>
                  <span className="text-xs text-blue-200">Face-down</span>
                </button>
              </div>
              <button
                onClick={cancelMonsterPlacement}
                className="mt-4 text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Pending Item Equip - Champion Selection */}
        {pendingItemEquip && gameState && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-6 text-center max-w-lg">
              <h3 className="text-xl font-bold text-green-400 mb-2">Equip Item</h3>
              <p className="text-gray-300 text-sm mb-2">
                {pendingItemEquip.card.name}
              </p>
              <div className="flex justify-center gap-2 mb-3">
                {pendingItemEquip.card.goldCost && (
                  <span className="text-yellow-400 text-sm bg-yellow-500/20 px-2 py-1 rounded">
                    {pendingItemEquip.card.goldCost}g
                  </span>
                )}
                {pendingItemEquip.card.atkBonus && (
                  <span className="text-orange-400 text-sm bg-orange-500/20 px-2 py-1 rounded">
                    +{pendingItemEquip.card.atkBonus} ATK
                  </span>
                )}
                {pendingItemEquip.card.defBonus && (
                  <span className="text-blue-400 text-sm bg-blue-500/20 px-2 py-1 rounded">
                    +{pendingItemEquip.card.defBonus} DEF
                  </span>
                )}
              </div>
              {/* Item Effect */}
              {(pendingItemEquip.card.itemEffect || pendingItemEquip.card.description) && (
                <div className="bg-slate-800/80 rounded-lg px-3 py-2 mb-4 border border-green-500/30">
                  <p className="text-green-300 text-xs italic">
                    {pendingItemEquip.card.itemEffect || pendingItemEquip.card.description}
                  </p>
                </div>
              )}
              <p className="text-gray-400 text-xs mb-4">Select a champion to equip:</p>
              <div className="flex flex-wrap gap-3 justify-center mb-4">
                {currentPlayerState.field.champions.map((champion, index) => {
                  if (!champion) return null;
                  const goldCost = pendingItemEquip.card.goldCost || 0;
                  const canAfford = currentPlayerState.gold >= goldCost;
                  return (
                    <button
                      key={index}
                      onClick={() => equipItemToChampion(index)}
                      disabled={!canAfford}
                      className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 w-[100px] ${
                        canAfford
                          ? 'bg-slate-800 border-green-500/50 hover:border-green-500 hover:bg-slate-700 cursor-pointer'
                          : 'bg-slate-800/50 border-gray-600 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Champion Image */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                        {champion.card.image ? (
                          <img
                            src={champion.card.image.startsWith('/') ? `http://localhost:3001${champion.card.image}` : `http://localhost:3001/images/cards/${champion.card.image}`}
                            alt={champion.card.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) {
                                (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center text-2xl"
                          style={{ display: champion.card.image ? 'none' : 'flex' }}
                        >
                          ⚔️
                        </div>
                      </div>
                      <span className="text-white text-xs font-medium truncate max-w-[90px]">
                        {champion.card.name}
                      </span>
                      <div className="flex gap-1 text-[10px]">
                        <span className="text-orange-400">{champion.currentAttack}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-blue-400">{champion.currentDefense}</span>
                      </div>
                      {champion.equippedItems && champion.equippedItems.length > 0 && (
                        <span className="text-green-400 text-[10px]">
                          {champion.equippedItems.length} item(s)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {currentPlayerState.gold < (pendingItemEquip.card.goldCost || 0) && (
                <p className="text-red-400 text-xs mb-2">
                  Not enough gold! Need {pendingItemEquip.card.goldCost}g, have {currentPlayerState.gold}g
                </p>
              )}
              <button
                onClick={cancelItemEquip}
                className="text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mode indicator */}
        {gameMode !== 'normal' && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/95 border border-yellow-500/50 rounded-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-sm font-bold">
                {gameMode === 'attack' && 'Select Attack Target'}
                {gameMode === 'equip' && 'Select Champion to Equip'}
                {gameMode === 'target_spell' && `Select Target for ${pendingSpellType}`}
              </span>
              <button
                onClick={cancelMode}
                className="px-2 py-1 bg-red-500/50 hover:bg-red-500 rounded text-xs text-white"
              >
                Cancel
              </button>
              {gameMode === 'attack' && !opponent.field.champions.some(c => c !== null) && (
                <button
                  onClick={handleDirectAttack}
                  className="px-2 py-1 bg-orange-500/50 hover:bg-orange-500 rounded text-xs text-white"
                >
                  Direct Attack
                </button>
              )}
            </div>
          </div>
        )}


        {/* Interrupt Window */}
        {showInterruptWindow && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-900 border-2 border-blue-500 rounded-lg p-6 text-center max-w-md">
              <h3 className="text-xl font-bold text-blue-400 mb-2">Enemy Battle Phase!</h3>
              <p className="text-white mb-4">
                Your opponent is about to attack. Do you want to activate a Summoner Spell?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleInterruptUseSpell}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded"
                >
                  Use Spell
                </button>
                <button
                  onClick={handleInterruptSkip}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OPPONENT HAND */}
        <div className="flex-shrink-0 flex justify-center py-1 mt-8">
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

          {/* LEFT SIDE - Enemy GY/Deck with HP */}
          <div className="flex items-start gap-4 flex-shrink-0">
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="w-14 h-14 border-2 border-slate-500 bg-gradient-to-br from-slate-700 to-slate-800 rounded flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-7 h-7 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="text-slate-300 text-xs font-bold truncate text-center max-w-[80px]">{opponent.name}</div>
              <HPBar current={opponent.lifePoints} max={8000} width="w-28" size="lg" variant="enemy" />
              <GoldDisplay amount={opponent.gold || 500} />
            </div>
            <div className="flex flex-col gap-2">
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
              {/* Enemy Graveyard */}
              <div
                className="bg-gradient-to-br from-gray-700 to-gray-900 rounded border border-gray-600 flex flex-col items-center justify-center relative"
                style={{ width: '95px', height: '135px' }}
              >
                <span className="text-3xl mb-1">💀</span>
                <div className="text-[10px] text-gray-400">Graveyard</div>
                <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-gray-300">{opponent.graveyard.length}</div>
              </div>
            </div>
          </div>

          {/* CENTER - Boards */}
          <div className="flex-1 flex flex-col gap-1 min-w-0">

            {/* Opponent Field */}
            <div className="flex-1 bg-gradient-to-b from-gray-800/40 to-gray-800/60 rounded-lg border border-gray-700/40 p-2 flex items-center justify-center relative">
              {/* Opponent Spell Deck - Absolute positioned (right side, opposite to player's) */}
              <div
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                style={{ width: '95px', height: '135px' }}
              >
                <div className="absolute top-0.5 left-0.5 w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 rounded border border-blue-700" style={{ width: '95px', height: '135px' }} />
                <div
                  className="relative bg-gradient-to-br from-blue-700 to-blue-800 rounded border border-blue-600 flex flex-col items-center justify-center"
                  style={{ width: '95px', height: '135px' }}
                >
                  <span className="text-2xl mb-1">✨</span>
                  <div className="text-[10px] text-blue-200">Spells</div>
                  <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-blue-300">
                    {(opponent.spellDeck?.length || 5) - (opponent.usedSummonerSpells?.length || 0)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                {/* Opponent Spell Zone */}
                <div className="flex justify-center gap-3">
                  {opponent.field.spellZone.map((slot, index) => (
                    <div
                      key={index}
                      onClick={(e) => slot && handleFieldCardClick(e, slot, true)}
                      className={`bg-gray-700/30 border border-gray-600/40 rounded flex items-center justify-center ${slot ? 'cursor-pointer hover:border-gray-500' : ''}`}
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
                {/* Opponent Champions */}
                <div className="flex justify-center gap-3">
                  {opponent.field.champions.map((slot, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        if (slot) handleFieldCardClick(e, slot, true);
                        handleChampionClick(index, true);
                      }}
                      className={`bg-gray-700/30 border rounded flex items-center justify-center transition-all cursor-pointer ${
                        gameMode === 'attack' ? 'border-red-500/50 hover:border-red-500' : 'border-gray-600/40 hover:border-gray-500'
                      }`}
                      style={{ width: '120px', height: '165px' }}
                    >
                      {slot ? (
                        <Card
                          card={slot.card}
                          size="field"
                          faceDown={!slot.faceUp}
                          position={slot.position}
                          turnsOnBoard={slot.turnsOnBoard}
                          currentAttack={slot.currentAttack}
                          currentDefense={slot.currentDefense}
                          equippedItems={slot.equippedItems}
                          isInvincible={slot.isInvincible}
                          hasAttacked={slot.hasAttacked}
                          isAttackTarget={gameMode === 'attack'}
                        />
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

              {isMyTurn && (
                <div className="flex gap-1">
                  {gameState.phase === 'MAIN1' && (
                    <button
                      onClick={handleChangePhase}
                      className="px-2 py-0.5 bg-orange-500/50 hover:bg-orange-500 rounded text-[10px] text-white"
                    >
                      → Battle
                    </button>
                  )}
                  {gameState.phase === 'BATTLE' && (
                    <button
                      onClick={handleEndTurn}
                      className="px-2 py-0.5 bg-green-500/50 hover:bg-green-500 rounded text-[10px] text-white"
                    >
                      End Turn
                    </button>
                  )}
                </div>
              )}

              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-yellow-500/50" />
              <span className="text-yellow-500/60 text-xs">⚔</span>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-yellow-500/50" />
            </div>

            {/* Player Field */}
            <div className="flex-1 bg-gradient-to-t from-gray-800/40 to-gray-800/60 rounded-lg border border-blue-900/20 p-2 flex items-center justify-center relative">
              {/* Player Spell Deck - Absolute positioned */}
              <div
                className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                style={{ width: '95px', height: '135px' }}
                onClick={() => setShowSpellPanel(true)}
              >
                <div className="absolute top-0.5 left-0.5 w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 rounded border border-blue-700" style={{ width: '95px', height: '135px' }} />
                <div
                  className={`relative bg-gradient-to-br from-blue-700 to-blue-800 rounded border flex flex-col items-center justify-center transition-all ${
                    canUseSummonerSpells ? 'border-blue-400 shadow-lg shadow-blue-500/50 animate-pulse' : 'border-blue-600'
                  }`}
                  style={{ width: '95px', height: '135px' }}
                >
                  <span className="text-2xl mb-1">✨</span>
                  <div className="text-[10px] text-blue-200">Spells</div>
                  <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-blue-300">
                    {(currentPlayerState.spellDeck?.length || 5) - (currentPlayerState.usedSummonerSpells?.length || 0)}
                  </div>
                  {canUseSummonerSpells && (
                    <div className="absolute bottom-1 left-1 right-1 bg-green-500/80 text-white text-[8px] text-center rounded py-0.5">
                      READY!
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                {/* Player Champions */}
                <div className="flex justify-center gap-3">
                  {currentPlayerState.field.champions.map((slot, index) => {
                    const canAttackNow = slot && !slot.hasAttacked && slot.position === 'ATTACK' && slot.turnsOnBoard > 0 && gameState.phase === 'BATTLE' && isMyTurn;

                    return (
                      <div
                        key={index}
                        onClick={(e) => {
                          if (selectedCard !== null && currentPlayerState.hand[selectedCard]?.type === 'MONSTER') {
                            handleFieldClick('champions', index);
                          } else if (gameMode === 'equip' && selectedItemIndex !== null) {
                            handleFieldClick('champions', index);
                          } else if (slot) {
                            handleFieldCardClick(e, slot, false);
                            handleChampionClick(index, false);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (slot) handleChangePosition(index);
                        }}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropOnField('champions', index)}
                        className={`bg-gray-700/30 border rounded flex items-center justify-center cursor-pointer transition-all ${
                          draggedCardType === 'MONSTER' && !slot
                            ? 'border-green-500 shadow-lg shadow-green-500/30 bg-green-500/10'
                            : selectedCard !== null && currentPlayerState.hand[selectedCard]?.type === 'MONSTER'
                              ? 'border-green-500 shadow-lg shadow-green-500/30'
                              : gameMode === 'equip' && slot
                                ? 'border-green-500 shadow-lg shadow-green-500/30'
                                : selectedAttacker === index
                                  ? 'border-yellow-500 shadow-lg shadow-yellow-500/50'
                                  : canAttackNow
                                    ? 'border-orange-500/50 hover:border-orange-500'
                                    : 'border-gray-600/40 hover:border-yellow-500/50'
                        }`}
                        style={{ width: '120px', height: '165px' }}
                      >
                        {slot ? (
                          <Card
                            card={slot.card}
                            size="field"
                            faceDown={!slot.faceUp}
                            position={slot.position}
                            turnsOnBoard={slot.turnsOnBoard}
                            currentAttack={slot.currentAttack}
                            currentDefense={slot.currentDefense}
                            equippedItems={slot.equippedItems}
                            isInvincible={slot.isInvincible}
                            hasAttacked={slot.hasAttacked}
                            selected={selectedAttacker === index}
                            canAttack={canAttackNow && gameMode !== 'attack'}
                          />
                        ) : (
                          <div className="w-24 h-32 border border-dashed border-gray-600/30 rounded flex items-center justify-center">
                            <span className="text-gray-700 text-xl">⬡</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Player Spell Zone */}
                <div className="flex justify-center gap-3">
                  {currentPlayerState.field.spellZone.map((slot, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        if (slot) {
                          handleFieldCardClick(e, slot, false);
                        } else {
                          handleFieldClick('spellZone', index);
                        }
                      }}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnField('spellZone', index)}
                      className={`bg-gray-700/30 border rounded flex items-center justify-center cursor-pointer transition-all ${
                        (draggedCardType === 'ITEM' || draggedCardType === 'RUNE') && !slot
                          ? 'border-green-500 shadow-lg shadow-green-500/30 bg-green-500/10'
                          : selectedCard !== null &&
                            (currentPlayerState.hand[selectedCard]?.type === 'ITEM' ||
                              currentPlayerState.hand[selectedCard]?.type === 'RUNE' ||
                              currentPlayerState.hand[selectedCard]?.type === 'SUMMONER_SPELL')
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

          {/* RIGHT SIDE - End Turn + Player GY/Deck */}
          <div className="flex flex-col justify-between flex-shrink-0">
            <div className="flex-1" />

            {/* Action buttons */}
            <div className="py-2 space-y-2">
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

            <div className="flex-1 flex items-end gap-4">
              <div className="flex flex-col gap-2">
                {/* Player Graveyard */}
                <div
                  className="bg-gradient-to-br from-gray-700 to-gray-900 rounded border border-gray-600 flex flex-col items-center justify-center relative"
                  style={{ width: '95px', height: '135px' }}
                >
                  <span className="text-3xl mb-1">💀</span>
                  <div className="text-[10px] text-gray-400">Graveyard</div>
                  <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-gray-300">{currentPlayerState.graveyard.length}</div>
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
                    <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs font-bold text-white">{currentPlayerState.deck.length}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 pb-1">
                <div className="w-14 h-14 border-2 border-yellow-500 bg-gradient-to-br from-indigo-700 to-purple-800 rounded flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/40">
                  <svg className="w-7 h-7 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="text-yellow-400 text-xs font-bold truncate text-center max-w-[80px]">{currentPlayerState.name}</div>
                <HPBar current={currentPlayerState.lifePoints} max={8000} width="w-28" size="lg" variant="player" />
                <GoldDisplay amount={currentPlayerState.gold || 500} />
              </div>
            </div>
          </div>
        </div>

        {/* PLAYER HAND */}
        <div className="flex-shrink-0 flex justify-center items-end py-3 mt-2" style={{ minHeight: '160px' }}>
          <div className="flex gap-3">
            {currentPlayerState.hand.map((card, index) => {
              const isSelected = selectedCard === index;
              const isMonster = card.type === 'MONSTER';
              const isDraggable = isMyTurn && gameState.phase === 'MAIN1' && (card.type === 'MONSTER' || card.type === 'ITEM' || card.type === 'RUNE');
              const showPositionBubbles = isSelected && isMonster && isMyTurn && gameMode === 'normal' && gameState.phase === 'MAIN1';
              const isPendingDrop = pendingMonsterDrop?.cardIndex === index;

              return (
                <div
                  key={index}
                  draggable={isDraggable && !isPendingDrop}
                  onDragStart={(e) => {
                    const cardEl = e.currentTarget.querySelector('.card-drag-handle') as HTMLElement;
                    handleDragStart(e, index, card, cardEl || e.currentTarget);
                  }}
                  onDragEnd={handleDragEnd}
                  className={`cursor-pointer transition-all flex-shrink-0 relative ${
                    draggedCardIndex === index
                      ? 'opacity-50'
                      : isPendingDrop
                        ? 'transform scale-110 -translate-y-4 z-10 ring-2 ring-yellow-500'
                        : isSelected
                          ? 'transform scale-110 -translate-y-4 z-10'
                          : selectedItemIndex === index
                            ? 'transform scale-110 -translate-y-4 z-10 ring-2 ring-green-500'
                            : isDraggable
                              ? 'hover:-translate-y-2 cursor-grab active:cursor-grabbing'
                              : 'hover:-translate-y-2'
                  }`}
                >
                  {/* ATK/DEF Position Bubbles - for click selection */}
                  {showPositionBubbles && !pendingMonsterDrop && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSummonMode('attack');
                        }}
                        className={`px-3 py-2 rounded-full text-xs font-bold transition-all shadow-lg ${
                          summonMode === 'attack'
                            ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                            : 'bg-orange-500/70 text-white hover:bg-orange-500'
                        }`}
                      >
                        ATK
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSummonMode('defense');
                        }}
                        className={`px-3 py-2 rounded-full text-xs font-bold transition-all shadow-lg ${
                          summonMode === 'defense'
                            ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                            : 'bg-blue-500/70 text-white hover:bg-blue-500'
                        }`}
                      >
                        DEF
                      </button>
                    </div>
                  )}
                  <div className="card-drag-handle" onClick={(e) => handleCardClick(e, index)}>
                    <Card card={card} size="hand" selected={isSelected} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER - Active Runes */}
        <div className="flex-shrink-0 flex justify-center items-center gap-4 py-1">
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

          {currentPlayerState.regionBonuses && currentPlayerState.regionBonuses.length > 0 && (
            <RegionSynergyPanel regionBonuses={currentPlayerState.regionBonuses} compact={true} />
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
              <h3 className="text-white font-bold">Runes</h3>
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

        {/* Summoner Spell Panel */}
        {showSpellPanel && (
          <SummonerSpellPanel
            spells={currentPlayerState.spellDeck || []}
            usedSpells={currentPlayerState.usedSummonerSpells || []}
            canUse={canUseSummonerSpells}
            onUseSpell={handleUseSummonerSpell}
            onClose={() => {
              setShowSpellPanel(false);
              // If in interrupt mode and closing without using spell, continue AI attacks
              if (isInInterruptMode && mode === 'solo' && gameState.currentPlayer !== playerIndex) {
                setIsInInterruptMode(false);
                setTimeout(() => continueAIAttacks(gameState), 500);
              }
            }}
            playerHand={currentPlayerState.hand}
            playerGraveyard={currentPlayerState.graveyard}
            playerField={currentPlayerState.field.champions}
            opponentField={opponent.field.champions}
          />
        )}

        {/* Winner overlay */}
        {gameState.winner && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 border-2 border-yellow-500 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                {gameState.winner === currentPlayerState.id ? 'Victory!' : 'Defeat'}
              </h2>
              <p className="text-white mb-6">
                {gameState.winner === currentPlayerState.id
                  ? 'Congratulations! You won the duel!'
                  : 'Better luck next time!'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded"
              >
                Return to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
