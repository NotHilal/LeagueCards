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
  spellType?: 'NORMAL_SPELL' | 'CONTINUOUS_SPELL' | 'EQUIP_SPELL' | 'NORMAL_TRAP' | 'CONTINUOUS_TRAP' | 'EQUIP_TRAP';
  attack?: number;
  defense?: number;
  level?: number;
  description: string;
  image?: string;
  itemEffect?: string;
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
  phase: 'DRAW' | 'STANDBY' | 'MAIN1' | 'BATTLE' | 'MAIN2' | 'END';
  turn: number;
  winner?: string;
  effectMessages?: string[];
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

interface ChampionAction {
  championIndex: number;
  champion: FieldCard;
}

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

  // Effect messages state
  const [effectMessages, setEffectMessages] = useState<string[]>([]);

  // Champion action panel state
  const [selectedChampionAction, setSelectedChampionAction] = useState<ChampionAction | null>(null);

  // Attack target selection state
  const [showAttackTargets, setShowAttackTargets] = useState(false);

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
      // Show effect messages
      if (result.effectMessages && result.effectMessages.length > 0) {
        setEffectMessages(result.effectMessages);
        // Auto-clear after 5 seconds
        setTimeout(() => setEffectMessages([]), 5000);
      }
    });

    newSocket.on('turn_changed', (data: any) => {
      console.log('Turn changed:', data);
      // Show effect messages from turn change
      if (data.effectMessages && data.effectMessages.length > 0) {
        setEffectMessages(data.effectMessages);
        setTimeout(() => setEffectMessages([]), 5000);
      }
    });

    newSocket.on('spell_played', (data: any) => {
      console.log('Spell played:', data);
      if (data.effectMessages && data.effectMessages.length > 0) {
        setEffectMessages(data.effectMessages);
        setTimeout(() => setEffectMessages([]), 5000);
      }
    });

    newSocket.on('item_equipped', (data: any) => {
      console.log('Item equipped:', data);
      if (data.effectMessages && data.effectMessages.length > 0) {
        setEffectMessages(data.effectMessages);
        setTimeout(() => setEffectMessages([]), 5000);
      }
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
    const isMainPhase = gameState?.phase === 'MAIN1' || gameState?.phase === 'MAIN2';
    if (!gameState || gameState.currentPlayer !== playerIndex || !isMainPhase) return;

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
      const isEquipCard = card.spellType === 'EQUIP_SPELL' || card.spellType === 'EQUIP_TRAP';

      // Equip cards require a champion on the field
      if (isEquipCard && !hasChampions) {
        setDraggedCardIndex(null);
        setDraggedCardType(null);
        return; // Can't play equip cards without champions
      }

      if (isEquipCard && hasChampions) {
        // Show popup to choose champion for equip cards
        setPendingItemEquip({
          cardIndex: draggedCardIndex,
          card: card,
        });
        setDraggedCardIndex(null);
        setDraggedCardType(null);
        return;
      } else {
        // Non-equip items (Normal/Continuous spells/traps) - place in spell zone
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
      // For items, check if it's an equip card
      if (card.type === 'ITEM') {
        const hasChampions = currentPlayerState.field.champions.some(c => c !== null);
        const isEquipCard = card.spellType === 'EQUIP_SPELL' || card.spellType === 'EQUIP_TRAP';

        // Equip cards require a champion on the field
        if (isEquipCard && !hasChampions) {
          return; // Can't play equip cards without champions
        }

        if (isEquipCard && hasChampions) {
          // Show popup to choose champion for equip cards
          setPendingItemEquip({
            cardIndex: selectedCard,
            card: card,
          });
          return;
        }
      }

      // Non-equip items, runes, or summoner spells go to spell zone
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

    // Attack mode is handled by the attack target panel
    // Champion action bubbles are handled inline in the render
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

  const handleChangePhase = (targetPhase?: 'MAIN1' | 'BATTLE' | 'MAIN2') => {
    if (!socket || !gameState) return;
    if (gameState.currentPlayer !== playerIndex) return;

    // For solo mode, update locally
    if (mode === 'solo') {
      if (targetPhase) {
        gameState.phase = targetPhase;
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
      onClick={() => {
        setPreviewCard(null);
        setSelectedChampionAction(null);
      }}
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

        {/* Effect Messages Overlay */}
        {effectMessages.length > 0 && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="bg-black/90 border-2 border-yellow-500/70 rounded-xl p-4 shadow-2xl shadow-yellow-500/20 max-w-md">
              <div className="text-yellow-400 text-sm font-bold mb-2 text-center">Effect Activated!</div>
              <div className="space-y-1">
                {effectMessages.map((msg, idx) => (
                  <div key={idx} className="text-white text-sm text-center animate-pulse">
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card Preview Panel - Large readable version */}
        {previewCard && (
          <div className="fixed top-[60px] right-[200px] z-40 pointer-events-none">
            <div className="relative pointer-events-auto">
              {/* Outer glow */}
              <div className={`absolute -inset-2 rounded-2xl blur-lg opacity-50 ${
                previewCard.type === 'MONSTER' ? 'bg-orange-500' :
                previewCard.type === 'ITEM' ? 'bg-green-500' :
                previewCard.type === 'RUNE' ? 'bg-purple-500' : 'bg-blue-500'
              }`} />

              <div className={`relative w-[260px] h-[360px] rounded-xl overflow-hidden shadow-2xl border-2 flex flex-col ${
                previewCard.type === 'MONSTER' ? 'border-orange-400/80' :
                previewCard.type === 'ITEM' ? 'border-green-400/80' :
                previewCard.type === 'RUNE' ? 'border-purple-400/80' : 'border-blue-400/80'
              } bg-gradient-to-b from-slate-800 to-slate-950`}>

                {/* Header with name and type */}
                <div className={`px-3 py-2 ${
                  previewCard.type === 'MONSTER' ? 'bg-gradient-to-r from-orange-600 to-orange-800' :
                  previewCard.type === 'ITEM' ? 'bg-gradient-to-r from-green-600 to-green-800' :
                  previewCard.type === 'RUNE' ? 'bg-gradient-to-r from-purple-600 to-purple-800' : 'bg-gradient-to-r from-blue-600 to-blue-800'
                }`}>
                  <h3 className="text-white font-bold text-base drop-shadow-lg">{previewCard.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/90 text-xs font-medium bg-black/30 px-2 py-0.5 rounded">
                      {previewCard.type === 'ITEM' || previewCard.type === 'RUNE' ? (
                        previewCard.spellType?.replace('_', ' ').replace('SPELL', 'Magic').replace('TRAP', 'Trap') || previewCard.type
                      ) : previewCard.type}
                    </span>
                    {previewCard.region && (
                      <span className="text-yellow-300 text-xs font-medium">{previewCard.region}</span>
                    )}
                    {previewCard.runePath && (
                      <span className="text-purple-300 text-xs font-medium">{previewCard.runePath}</span>
                    )}
                  </div>
                </div>

                {/* Image Area */}
                <div className="h-[110px] bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center relative">
                  {previewCard.image ? (
                    <img
                      src={previewCard.image.startsWith('/') ? `http://localhost:3001${previewCard.image}` : `http://localhost:3001/images/cards/${previewCard.image}`}
                      alt={previewCard.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl drop-shadow-lg">
                      {previewCard.type === 'MONSTER' ? '⚔️' : previewCard.type === 'ITEM' ? '🛡️' : previewCard.type === 'RUNE' ? '🔮' : '✨'}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Stats Bar */}
                <div className="flex items-center justify-center gap-3 px-3 py-2 bg-black/70">
                  {/* Monster stats */}
                  {(previewCard.type === 'MONSTER' || previewCard.type === 'JUNGLE_MONSTER') && (
                    <>
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-orange-700 px-3 py-1 rounded-lg shadow-lg">
                        <span className="text-base">⚔️</span>
                        <span className="text-white font-bold text-lg">{previewCard.attack}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1 rounded-lg shadow-lg">
                        <span className="text-base">🛡️</span>
                        <span className="text-white font-bold text-lg">{previewCard.defense}</span>
                      </div>
                      {previewCard.level && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-600 to-yellow-700 px-2 py-1 rounded-lg">
                          <span className="text-sm">⭐</span>
                          <span className="text-white font-bold text-sm">Lv{previewCard.level}</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* Item/Rune cost */}
                  {(previewCard.type === 'ITEM' || previewCard.type === 'RUNE') && previewCard.goldCost && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-600 to-amber-700 px-3 py-1 rounded-lg shadow-lg">
                      <span className="text-base">💰</span>
                      <span className="text-yellow-100 font-bold text-lg">{previewCard.goldCost}g</span>
                    </div>
                  )}
                  {/* Item bonus stats */}
                  {previewCard.type === 'ITEM' && previewCard.atkBonus && (
                    <div className="flex items-center gap-1 bg-orange-600/80 px-2 py-1 rounded-lg">
                      <span className="text-white font-bold text-sm">+{previewCard.atkBonus} ATK</span>
                    </div>
                  )}
                  {previewCard.type === 'ITEM' && previewCard.defBonus && (
                    <div className="flex items-center gap-1 bg-blue-600/80 px-2 py-1 rounded-lg">
                      <span className="text-white font-bold text-sm">+{previewCard.defBonus} DEF</span>
                    </div>
                  )}
                </div>

                {/* Effect Text - Main focus */}
                <div className="p-3 bg-slate-900/95 flex-1 overflow-auto">
                  {/* Item Effect */}
                  {previewCard.itemEffect && (
                    <div>
                      <span className="text-green-400 text-[10px] font-bold uppercase tracking-wide">Effect</span>
                      <p className="text-green-300 text-sm leading-relaxed mt-1">{previewCard.itemEffect}</p>
                    </div>
                  )}
                  {/* Rune Effect */}
                  {previewCard.runeEffect && (
                    <div>
                      <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wide">Effect</span>
                      <p className="text-purple-300 text-sm leading-relaxed mt-1">{previewCard.runeEffect}</p>
                    </div>
                  )}
                  {/* Summoner Spell Effect */}
                  {previewCard.summonerEffect && (
                    <div>
                      <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wide">Effect</span>
                      <p className="text-blue-300 text-sm leading-relaxed mt-1">{previewCard.summonerEffect}</p>
                    </div>
                  )}
                  {/* Team Effect for Jungle Monsters */}
                  {previewCard.teamEffect && (
                    <div>
                      <span className="text-teal-400 text-[10px] font-bold uppercase tracking-wide">Team Buff</span>
                      <p className="text-teal-300 text-sm leading-relaxed mt-1">{previewCard.teamEffect}</p>
                    </div>
                  )}
                  {/* Monster/Champion description */}
                  {previewCard.type === 'MONSTER' && previewCard.description && (
                    <p className="text-gray-300 text-xs leading-relaxed italic">{previewCard.description}</p>
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

        {/* Attack Target Selection - Game-style Bar */}
        {gameMode === 'attack' && selectedAttacker !== null && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl blur opacity-50 animate-pulse" />

            <div className="relative bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-orange-500/50 rounded-xl px-5 py-3 shadow-2xl">
              {/* Top accent line */}
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent" />

              <div className="flex items-center gap-5">
                {/* Attacker info */}
                <div className="flex items-center gap-2 pr-4 border-r border-orange-500/30">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg">⚔️</span>
                  </div>
                  <div>
                    <div className="text-orange-300 text-[10px] uppercase tracking-wider">Attacker</div>
                    <div className="text-white font-bold text-sm">{currentPlayerState.field.champions[selectedAttacker]?.card.name}</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-orange-400 text-xl">→</div>

                {/* Target Options */}
                <div className="flex items-center gap-2">
                  {opponent.field.champions.some(c => c !== null) ? (
                    // Show enemy champions as targets
                    opponent.field.champions.map((champion, index) => {
                      if (!champion) return null;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (socket) {
                              socket.emit('declare_attack', {
                                roomId: mode === 'multiplayer' ? roomId : `solo_${socket.id}`,
                                attackerIndex: selectedAttacker,
                                targetIndex: index
                              });
                            }
                            setGameMode('normal');
                            setSelectedAttacker(null);
                          }}
                          className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <div className="px-4 py-2 bg-gradient-to-b from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30 flex items-center gap-2">
                            <span className="text-white font-bold text-sm">{champion.card.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              champion.position === 'ATTACK'
                                ? 'bg-orange-500/50 text-orange-200'
                                : 'bg-blue-500/50 text-blue-200'
                            }`}>
                              {champion.position === 'ATTACK' ? `⚔${champion.currentAttack}` : `🛡${champion.currentDefense}`}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })
                  ) : (
                    // Direct attack option
                    <button
                      onClick={() => {
                        if (socket) {
                          socket.emit('declare_attack', {
                            roomId: mode === 'multiplayer' ? roomId : `solo_${socket.id}`,
                            attackerIndex: selectedAttacker,
                            targetIndex: -1
                          });
                        }
                        setGameMode('normal');
                        setSelectedAttacker(null);
                      }}
                      className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <div className="px-5 py-2 bg-gradient-to-b from-orange-400 via-orange-500 to-red-600 shadow-lg shadow-orange-500/50 flex items-center gap-2">
                        <span className="text-2xl">💥</span>
                        <div>
                          <div className="text-white font-bold text-sm">DIRECT ATTACK</div>
                          <div className="text-orange-200 text-xs">{currentPlayerState.field.champions[selectedAttacker]?.currentAttack} damage</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>

                {/* Cancel */}
                <button
                  onClick={() => {
                    setGameMode('normal');
                    setSelectedAttacker(null);
                  }}
                  className="ml-2 px-3 py-2 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-gray-300 rounded-lg text-xs font-bold transition-all border border-gray-500/50"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Mode indicator for non-attack modes */}
        {gameMode !== 'normal' && gameMode !== 'attack' && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/95 border border-yellow-500/50 rounded-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-sm font-bold">
                {gameMode === 'equip' && 'Select Champion to Equip'}
                {gameMode === 'target_spell' && `Select Target for ${pendingSpellType}`}
              </span>
              <button
                onClick={cancelMode}
                className="px-2 py-1 bg-red-500/50 hover:bg-red-500 rounded text-xs text-white"
              >
                Cancel
              </button>
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

            {/* Battle Line with Turn Info - Enhanced Phase UI */}
            <div className="flex-shrink-0 py-2">
              <div className="flex items-center justify-center gap-4">
                {/* Turn Counter - Left */}
                <span className="text-gray-400 text-sm font-medium">Turn {gameState.turn}</span>

                {/* Turn Status */}
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  isMyTurn
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {isMyTurn ? 'YOUR TURN' : 'ENEMY TURN'}
                </div>

                {/* Phase Selector - Centered clickable buttons */}
                <div className="flex items-center gap-1">
                  {(['MAIN1', 'BATTLE', 'MAIN2'] as const).map((phase, idx) => {
                    const phaseOrder = ['MAIN1', 'BATTLE', 'MAIN2'];
                    const currentPhaseIdx = phaseOrder.indexOf(gameState.phase);
                    const thisPhaseIdx = phaseOrder.indexOf(phase);
                    const isCurrentPhase = gameState.phase === phase;
                    const isPastPhase = thisPhaseIdx < currentPhaseIdx;
                    const isFuturePhase = thisPhaseIdx > currentPhaseIdx;

                    const phaseLabels: Record<string, string> = {
                      'MAIN1': 'M1',
                      'BATTLE': 'BTL',
                      'MAIN2': 'M2',
                    };
                    const phaseColors: Record<string, string> = {
                      'MAIN1': 'from-green-500 to-emerald-600',
                      'BATTLE': 'from-orange-500 to-red-600',
                      'MAIN2': 'from-teal-500 to-cyan-600',
                    };

                    return (
                      <div key={phase} className="flex items-center">
                        <button
                          onClick={() => isMyTurn && isFuturePhase && handleChangePhase(phase)}
                          disabled={!isMyTurn || isPastPhase || isCurrentPhase}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            isCurrentPhase
                              ? `bg-gradient-to-r ${phaseColors[phase]} text-white shadow-md`
                              : isPastPhase
                                ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                                : isMyTurn && isFuturePhase
                                  ? 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/80 hover:text-white cursor-pointer'
                                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {phaseLabels[phase]}
                        </button>
                        {idx < 2 && <div className="w-2 h-px bg-slate-600 mx-0.5" />}
                      </div>
                    );
                  })}
                </div>

                {/* End Turn Button */}
                <button
                  onClick={() => isMyTurn && handleEndTurn()}
                  disabled={!isMyTurn}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    isMyTurn
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:scale-105 cursor-pointer'
                      : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  END
                </button>
              </div>
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
                    const isSelected = selectedChampionAction?.championIndex === index;
                    const canChangePosition = slot && !slot.hasChangedPosition && slot.turnsOnBoard > 0 && (gameState.phase === 'MAIN1' || gameState.phase === 'MAIN2') && isMyTurn;

                    return (
                      <div
                        key={index}
                        className="relative"
                        onClick={(e) => {
                          if (selectedCard !== null && currentPlayerState.hand[selectedCard]?.type === 'MONSTER') {
                            handleFieldClick('champions', index);
                          } else if (gameMode === 'equip' && selectedItemIndex !== null) {
                            handleFieldClick('champions', index);
                          } else if (slot && isMyTurn && gameMode === 'normal') {
                            e.stopPropagation();
                            handleFieldCardClick(e, slot, false);
                            // Toggle action bubbles
                            if (isSelected) {
                              setSelectedChampionAction(null);
                            } else {
                              setSelectedChampionAction({ championIndex: index, champion: slot });
                            }
                          }
                        }}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropOnField('champions', index)}
                      >
                        {/* Action Bubbles */}
                        {isSelected && slot && gameMode === 'normal' && (
                          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
                            {/* Attack Button - Battle Phase only */}
                            {gameState.phase === 'BATTLE' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canAttackNow) {
                                    setSelectedAttacker(index);
                                    setGameMode('attack');
                                    setSelectedChampionAction(null);
                                  }
                                }}
                                disabled={!canAttackNow}
                                className={`group relative overflow-hidden rounded-lg transition-all duration-200 ${
                                  canAttackNow
                                    ? 'hover:scale-110 hover:-translate-y-1'
                                    : 'opacity-40 cursor-not-allowed'
                                }`}
                                title={slot.hasAttacked ? 'Already attacked' : slot.position !== 'ATTACK' ? 'In Defense' : slot.turnsOnBoard === 0 ? 'Summoning sickness' : 'Attack'}
                              >
                                <div className={`px-4 py-2 flex items-center gap-2 ${
                                  canAttackNow
                                    ? 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/50'
                                    : 'bg-gradient-to-b from-gray-500 to-gray-600'
                                }`}>
                                  <span className="text-lg drop-shadow-md">⚔️</span>
                                  <span className="text-white font-bold text-sm drop-shadow-md">ATTACK</span>
                                </div>
                                {canAttackNow && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            )}

                            {/* Change Position Button - Main Phases only */}
                            {(gameState.phase === 'MAIN1' || gameState.phase === 'MAIN2') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canChangePosition) {
                                    const newPosition = slot.position === 'ATTACK' ? 'DEFENSE' : 'ATTACK';
                                    // Update local state immediately for solo mode
                                    if (mode === 'solo') {
                                      slot.position = newPosition;
                                      slot.hasChangedPosition = true;
                                      setGameState({ ...gameState });
                                    }
                                    if (socket) {
                                      socket.emit('game_action', {
                                        roomId: mode === 'multiplayer' ? roomId : `solo_${socket.id}`,
                                        action: {
                                          type: 'CHANGE_POSITION',
                                          data: { cardFieldIndex: index, newPosition }
                                        }
                                      });
                                    }
                                    setSelectedChampionAction(null);
                                  }
                                }}
                                disabled={!canChangePosition}
                                className={`group relative overflow-hidden rounded-lg transition-all duration-200 ${
                                  canChangePosition
                                    ? 'hover:scale-110 hover:-translate-y-1'
                                    : 'opacity-40 cursor-not-allowed'
                                }`}
                                title={slot.hasChangedPosition ? 'Already changed' : slot.turnsOnBoard === 0 ? 'Summoning sickness' : 'Change Position'}
                              >
                                <div className={`px-4 py-2 flex items-center gap-2 ${
                                  canChangePosition
                                    ? slot.position === 'ATTACK'
                                      ? 'bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 shadow-lg shadow-blue-500/50'
                                      : 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/50'
                                    : 'bg-gradient-to-b from-gray-500 to-gray-600'
                                }`}>
                                  <span className="text-lg drop-shadow-md">{slot.position === 'ATTACK' ? '🛡️' : '⚔️'}</span>
                                  <span className="text-white font-bold text-sm drop-shadow-md">
                                    {slot.position === 'ATTACK' ? 'DEFEND' : 'ATTACK'}
                                  </span>
                                </div>
                                {canChangePosition && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        <div
                          className={`bg-gray-700/30 border rounded flex items-center justify-center cursor-pointer transition-all ${
                            draggedCardType === 'MONSTER' && !slot
                              ? 'border-green-500 shadow-lg shadow-green-500/30 bg-green-500/10'
                              : selectedCard !== null && currentPlayerState.hand[selectedCard]?.type === 'MONSTER'
                                ? 'border-green-500 shadow-lg shadow-green-500/30'
                                : gameMode === 'equip' && slot
                                  ? 'border-green-500 shadow-lg shadow-green-500/30'
                                  : isSelected
                                    ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
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
                              selected={selectedAttacker === index || isSelected}
                              canAttack={canAttackNow && gameMode !== 'attack'}
                            />
                          ) : (
                            <div className="w-24 h-32 border border-dashed border-gray-600/30 rounded flex items-center justify-center">
                              <span className="text-gray-700 text-xl">⬡</span>
                            </div>
                          )}
                        </div>
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

          {/* RIGHT SIDE - Player GY/Deck */}
          <div className="flex flex-col justify-between flex-shrink-0">
            <div className="flex-1" />

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
              const isMainPhase = gameState.phase === 'MAIN1' || gameState.phase === 'MAIN2';
              const isDraggable = isMyTurn && isMainPhase && (card.type === 'MONSTER' || card.type === 'ITEM' || card.type === 'RUNE');
              const showPositionBubbles = isSelected && isMonster && isMyTurn && gameMode === 'normal' && isMainPhase;
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
