interface CardProps {
  card: {
    id: string;
    name: string;
    type: 'MONSTER' | 'ITEM' | 'RUNE' | 'SUMMONER_SPELL';
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
  };
  size?: 'small' | 'medium' | 'large';
  faceDown?: boolean;
  selected?: boolean;
}

export default function Card({ card, size = 'medium', faceDown = false, selected = false }: CardProps) {
  const sizeClasses = {
    small: 'w-20',
    medium: 'w-32',
    large: 'w-48',
  };

  if (faceDown) {
    return (
      <div
        className={`${sizeClasses[size]} aspect-[2/3] bg-gradient-to-br from-purple-900 to-purple-700 border-2 border-purple-500 rounded-lg flex items-center justify-center`}
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

  return (
    <div
      className={`${sizeClasses[size]} aspect-[2/3] bg-gradient-to-b ${getCardColor()} border-2 ${
        selected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : getRarityBorder()
      } ${getRarityGlow()} rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all`}
    >
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
              // Fallback to emoji if image fails to load
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
          {card.type === 'MONSTER' ? getRegionIcon() : card.type === 'ITEM' ? '⚔️' : card.type === 'RUNE' ? '🔮' : '✨'}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-1 bg-black bg-opacity-60 h-1/2 flex flex-col">
        <div className="text-[0.5rem] text-gray-300 mb-1">
          {card.type}
          {card.level && ` ⭐ Lv${card.level}`}
        </div>

        <div className="text-[0.45rem] text-gray-100 flex-1 overflow-hidden">
          {card.description?.substring(0, size === 'small' ? 30 : 60)}...
        </div>

        {card.type === 'MONSTER' && (
          <div className="flex justify-between text-[0.6rem] font-bold mt-1">
            <span className="text-orange-400">ATK {card.attack}</span>
            <span className="text-blue-400">DEF {card.defense}</span>
          </div>
        )}
      </div>
    </div>
  );
}
