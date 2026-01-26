import HPBar from './HPBar';

interface PlayerInfoBarProps {
  name: string;
  hp: number;
  maxHp: number;
  isOpponent?: boolean;
  profileImage?: string;
}

export default function PlayerInfoBar({
  name,
  hp,
  maxHp,
  isOpponent = false,
  profileImage,
}: PlayerInfoBarProps) {
  const borderColor = isOpponent ? 'border-gray-400' : 'border-yellow-500';
  const glowColor = isOpponent ? 'shadow-gray-400/30' : 'shadow-yellow-500/50';
  const bgGradient = isOpponent
    ? 'from-slate-700 to-slate-800'
    : 'from-indigo-700 to-purple-800';

  return (
    <div className="flex items-center gap-3">
      {/* Hexagonal Profile Picture */}
      <div className="relative">
        {/* Hexagon container */}
        <div
          className={`w-14 h-14 border-2 ${borderColor} ${glowColor} shadow-lg overflow-hidden`}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${bgGradient} flex items-center justify-center`}
            >
              {/* User silhouette icon */}
              <svg
                className="w-8 h-8 text-white/70"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Level badge (optional decorative element) */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 border ${borderColor} flex items-center justify-center`}
        >
          <span className="text-[10px] text-white font-bold">1</span>
        </div>
      </div>

      {/* Name and HP */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold ${
              isOpponent ? 'text-gray-300' : 'text-yellow-400'
            }`}
          >
            {isOpponent ? 'OPPONENT' : 'YOU'}
          </span>
          <span className="text-white font-medium text-sm">{name}</span>
        </div>
        <HPBar current={hp} max={maxHp} width="w-56" />
      </div>
    </div>
  );
}
