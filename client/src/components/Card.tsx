interface ItemCard {
  id: string;
  name: string;
  atkBonus?: number;
  defBonus?: number;
  goldCost?: number;
}

interface CardProps {
  card: {
    id: string;
    name: string;
    type: 'MONSTER' | 'ITEM' | 'RUNE' | 'SUMMONER_SPELL' | 'JUNGLE_MONSTER';
    attack?: number;
    defense?: number;
    level?: number;
    description: string;
    region?: string;
    effect?: string;
    itemEffect?: string;
    runeEffect?: string;
    summonerEffect?: string;
    category?: string;
    runePath?: string;
    rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    image?: string;
    goldCost?: number;
    atkBonus?: number;
    defBonus?: number;
    teamEffect?: string;
  };
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'field' | 'hand' | 'opponent-hand';
  faceDown?: boolean;
  selected?: boolean;
  // Field card properties
  position?: 'ATTACK' | 'DEFENSE' | 'FACE_DOWN_DEFENSE';
  turnsOnBoard?: number;
  currentAttack?: number;
  currentDefense?: number;
  equippedItems?: ItemCard[];
  isInvincible?: boolean;
  hasAttacked?: boolean;
  isAttackTarget?: boolean;
  canAttack?: boolean;
}

export default function Card({
  card,
  size = 'medium',
  faceDown = false,
  selected = false,
  position,
  turnsOnBoard,
  currentAttack,
  currentDefense,
  equippedItems,
  isInvincible = false,
  hasAttacked = false,
  isAttackTarget = false,
  canAttack = false,
}: CardProps) {
  const sizeClasses = {
    tiny: 'w-12 h-[50px]',
    small: 'w-[72px] h-[90px]',
    medium: 'w-[104px] h-[145px]',
    large: 'w-48 h-[258px]',
    field: 'w-[105px] h-[150px]',
    hand: 'w-[105px] h-[140px]',
    'opponent-hand': 'w-12 h-[65px]',
  };

  // Defense position rotates the card
  const isDefensePosition = position === 'DEFENSE' || position === 'FACE_DOWN_DEFENSE';

  if (faceDown) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-purple-900 to-purple-700 border-2 border-purple-500 rounded-lg flex items-center justify-center ${
          isDefensePosition ? 'rotate-90' : ''
        }`}
      >
        <div className="text-4xl">🎴</div>
      </div>
    );
  }

  const getCardColor = () => {
    switch (card.type) {
      case 'MONSTER':
        return 'from-orange-600 to-orange-800';
      case 'ITEM':
        return 'from-green-600 to-green-800';
      case 'RUNE':
        return 'from-purple-600 to-purple-800';
      case 'SUMMONER_SPELL':
        return 'from-blue-600 to-blue-800';
      case 'JUNGLE_MONSTER':
        return 'from-teal-600 to-teal-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getRegionIcon = () => {
    const icons: Record<string, string> = {
      DEMACIA: '🛡️',
      NOXUS: '⚔️',
      FRELJORD: '❄️',
      PILTOVER: '⚙️',
      IONIA: '🌸',
      BILGEWATER: '🏴‍☠️',
      SHADOW_ISLES: '💀',
      SHURIMA: '☀️',
      THE_VOID: '🌀',
      IXTAL: '🌿',
      DARKIN: '😈',
      YORDLE: '🐾',
      RUNETERRA: '🌍',
    };
    return card.region ? icons[card.region] || '⭐' : '⭐';
  };

  const getRarityBorder = () => {
    if (!card.rarity) return 'border-gray-700';
    const borders: Record<string, string> = {
      COMMON: 'border-gray-500',
      RARE: 'border-blue-500',
      EPIC: 'border-purple-500',
      LEGENDARY: 'border-yellow-500',
    };
    return borders[card.rarity] || 'border-gray-700';
  };

  const getRarityGlow = () => {
    if (!card.rarity) return '';
    const glows: Record<string, string> = {
      COMMON: '',
      RARE: 'shadow-blue-500/30',
      EPIC: 'shadow-purple-500/50',
      LEGENDARY: 'shadow-yellow-500/70',
    };
    return glows[card.rarity] || '';
  };

  // Calculate displayed stats (use current if provided, else base)
  const displayAttack = currentAttack !== undefined ? currentAttack : card.attack;
  const displayDefense = currentDefense !== undefined ? currentDefense : card.defense;

  // Check if stats are modified
  const isAtkModified = currentAttack !== undefined && currentAttack !== card.attack;
  const isDefModified = currentDefense !== undefined && currentDefense !== card.defense;

  // Ultimate ready check (5+ turns on board)
  const isUltimateReady = turnsOnBoard !== undefined && turnsOnBoard >= 5;

  // Get border styling
  const getBorderStyle = () => {
    if (isAttackTarget) return 'border-red-500 shadow-lg shadow-red-500/50';
    if (canAttack) return 'border-green-500 shadow-lg shadow-green-500/50 animate-pulse';
    if (selected) return 'border-yellow-400 shadow-lg shadow-yellow-400/50';
    if (isInvincible) return 'border-cyan-400 shadow-lg shadow-cyan-400/60';
    return getRarityBorder();
  };

  return (
    <div className={`relative ${isDefensePosition ? 'rotate-90' : ''}`}>
      <div
        className={`${sizeClasses[size]} bg-gradient-to-b ${getCardColor()} border-2 ${getBorderStyle()} ${getRarityGlow()} rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all relative`}
      >
        {/* Invincible overlay */}
        {isInvincible && (
          <div className="absolute inset-0 bg-cyan-400/20 z-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
              🛡️
            </div>
          </div>
        )}

        {/* Has attacked indicator */}
        {hasAttacked && (
          <div className="absolute top-0 right-0 bg-red-500/80 text-white text-[8px] px-1 rounded-bl z-10">
            ATK'D
          </div>
        )}

        {/* Card Header */}
        <div className="bg-black bg-opacity-50 p-1">
          <div className="text-xs font-bold truncate text-white">{card.name}</div>
        </div>

        {/* Card Image Area */}
        <div className="h-1/2 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center text-4xl relative overflow-hidden">
          {card.image ? (
            <img
              src={card.image.startsWith('/') ? `http://localhost:3001${card.image}` : `http://localhost:3001/images/cards/${card.image}`}
              alt={card.name}
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
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ display: card.image ? 'none' : 'flex' }}
          >
            {card.type === 'MONSTER' ? getRegionIcon() : card.type === 'ITEM' ? '⚔️' : card.type === 'RUNE' ? '🔮' : card.type === 'JUNGLE_MONSTER' ? '🐉' : '✨'}
          </div>

          {/* Position indicator */}
          {position && (
            <div className={`absolute bottom-0 left-0 text-[8px] px-1 py-0.5 rounded-tr ${
              position === 'ATTACK' ? 'bg-orange-500/80 text-white' : 'bg-blue-500/80 text-white'
            }`}>
              {position === 'ATTACK' ? 'ATK' : 'DEF'}
            </div>
          )}

          {/* Ultimate ready indicator */}
          {isUltimateReady && (
            <div className="absolute top-0 left-0 bg-yellow-500/90 text-black text-[8px] px-1 rounded-br font-bold animate-pulse">
              ULT!
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-1 bg-black bg-opacity-60 h-1/2 flex flex-col">
          <div className="text-[0.5rem] text-gray-300 mb-1 flex justify-between">
            <span>
              {card.type}
              {card.level && ` ⭐ Lv${card.level}`}
            </span>
            {turnsOnBoard !== undefined && (
              <span className="text-yellow-400">T{turnsOnBoard}</span>
            )}
          </div>

          <div className="text-[0.45rem] text-gray-100 flex-1 overflow-hidden">
            {card.description?.substring(0,
              size === 'tiny' || size === 'opponent-hand' ? 15 :
              size === 'small' ? 30 :
              size === 'field' ? 45 :
              60
            )}...
          </div>

          {/* Stats display for monsters */}
          {(card.type === 'MONSTER' || card.type === 'JUNGLE_MONSTER') && (
            <div className="flex justify-between text-[0.6rem] font-bold mt-1">
              <span className={isAtkModified ? (currentAttack! > card.attack! ? 'text-green-400' : 'text-red-400') : 'text-orange-400'}>
                ATK {displayAttack}
                {isAtkModified && <span className="text-[0.4rem]"> ({card.attack})</span>}
              </span>
              <span className={isDefModified ? (currentDefense! > card.defense! ? 'text-green-400' : 'text-red-400') : 'text-blue-400'}>
                DEF {displayDefense}
                {isDefModified && <span className="text-[0.4rem]"> ({card.defense})</span>}
              </span>
            </div>
          )}

          {/* Gold cost for items */}
          {card.type === 'ITEM' && card.goldCost !== undefined && (
            <div className="flex justify-between text-[0.6rem] font-bold mt-1">
              <span className="text-yellow-400">{card.goldCost}g</span>
              <span className="text-gray-400">
                {card.atkBonus ? `+${card.atkBonus} ATK` : ''}
                {card.atkBonus && card.defBonus ? ' ' : ''}
                {card.defBonus ? `+${card.defBonus} DEF` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Equipped items indicator */}
        {equippedItems && equippedItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-green-600/90 text-white text-[7px] text-center py-0.5">
            {equippedItems.length} item{equippedItems.length > 1 ? 's' : ''} equipped
          </div>
        )}
      </div>

      {/* Equipped items tooltip on hover - only show in larger sizes */}
      {equippedItems && equippedItems.length > 0 && size !== 'tiny' && size !== 'opponent-hand' && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 z-20">
          {equippedItems.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="w-4 h-4 bg-green-600 rounded-sm border border-green-400 flex items-center justify-center text-[8px]"
              title={`${item.name}: +${item.atkBonus || 0} ATK, +${item.defBonus || 0} DEF`}
            >
              ⚔️
            </div>
          ))}
          {equippedItems.length > 3 && (
            <div className="w-4 h-4 bg-green-600 rounded-sm border border-green-400 flex items-center justify-center text-[8px] text-white">
              +{equippedItems.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
