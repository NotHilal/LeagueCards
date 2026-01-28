interface HPBarProps {
  current: number;
  max: number;
  showText?: boolean;
  width?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'player' | 'enemy';
}

export default function HPBar({
  current,
  max,
  showText = true,
  width = 'w-64',
  size = 'md',
  variant = 'player'
}: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  const sizeConfig = {
    sm: { height: 'h-4', text: 'text-[9px]', icon: 'w-3 h-3', padding: 'px-1' },
    md: { height: 'h-6', text: 'text-[11px]', icon: 'w-4 h-4', padding: 'px-2' },
    lg: { height: 'h-8', text: 'text-sm', icon: 'w-5 h-5', padding: 'px-3' },
  };

  const config = sizeConfig[size];

  // Dynamic colors based on HP percentage
  const getColors = () => {
    if (percentage > 60) {
      return {
        fill: 'from-emerald-300 via-green-400 to-emerald-500',
        glow: 'rgba(52, 211, 153, 0.6)',
        accent: '#34d399',
        bg: 'from-emerald-900/50 to-emerald-950/50',
      };
    } else if (percentage > 30) {
      return {
        fill: 'from-amber-300 via-yellow-400 to-orange-400',
        glow: 'rgba(251, 191, 36, 0.6)',
        accent: '#fbbf24',
        bg: 'from-amber-900/50 to-amber-950/50',
      };
    } else {
      return {
        fill: 'from-red-400 via-red-500 to-rose-600',
        glow: 'rgba(248, 113, 113, 0.7)',
        accent: '#f87171',
        bg: 'from-red-900/50 to-red-950/50',
      };
    }
  };

  const colors = getColors();
  const frameColor = variant === 'player'
    ? 'from-yellow-600 via-yellow-500 to-yellow-600'
    : 'from-slate-500 via-slate-400 to-slate-500';
  const frameGlow = variant === 'player' ? 'shadow-yellow-500/30' : 'shadow-slate-500/20';

  return (
    <div className={`${width} relative`}>
      {/* Main container with metallic frame */}
      <div
        className={`relative ${config.height} rounded-sm overflow-visible`}
        style={{
          filter: `drop-shadow(0 0 3px ${colors.glow})`,
        }}
      >
        {/* Outer metallic frame */}
        <div className={`absolute -inset-[2px] rounded bg-gradient-to-r ${frameColor} ${frameGlow} shadow-md`}>
          {/* Frame shine */}
          <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/30 to-transparent rounded-t" />
        </div>

        {/* Inner dark background */}
        <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-gray-900 via-black to-gray-950 overflow-hidden">
          {/* Subtle inner shadow */}
          <div className="absolute inset-0 shadow-inner" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)' }} />

          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.03) 10px,
                rgba(255,255,255,0.03) 11px
              )`
            }}
          />

          {/* HP Fill bar */}
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          >
            {/* Main gradient fill */}
            <div className={`absolute inset-0 bg-gradient-to-r ${colors.fill}`} />

            {/* Top highlight */}
            <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/50 via-white/20 to-transparent" />

            {/* Bottom shadow */}
            <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/40 to-transparent" />

            {/* Animated shine sweep */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%, transparent 100%)',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />

            {/* Edge glow */}
            {percentage > 0 && percentage < 100 && (
              <div
                className="absolute right-0 top-0 bottom-0 w-[3px]"
                style={{
                  background: `linear-gradient(to right, transparent, ${colors.accent})`,
                  boxShadow: `0 0 8px ${colors.accent}, 0 0 12px ${colors.accent}`,
                }}
              />
            )}
          </div>

          {/* Segment markers */}
          <div className="absolute inset-0 flex pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-white/10 last:border-r-0" />
            ))}
          </div>
        </div>

        {/* Text overlay */}
        {showText && (
          <div className={`absolute inset-0 flex items-center justify-center ${config.padding}`}>
            <span
              className={`${config.text} font-black tracking-wider text-white`}
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)',
                letterSpacing: '0.05em',
              }}
            >
              {current.toLocaleString()}
              <span className="opacity-60 mx-0.5">/</span>
              <span className="opacity-80">{max.toLocaleString()}</span>
            </span>
          </div>
        )}

        {/* Corner gems/accents */}
        <div
          className="absolute -top-[3px] -left-[3px] w-2 h-2 rotate-45"
          style={{
            background: variant === 'player'
              ? 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            boxShadow: `0 0 4px ${variant === 'player' ? '#f59e0b' : '#64748b'}`,
          }}
        />
        <div
          className="absolute -top-[3px] -right-[3px] w-2 h-2 rotate-45"
          style={{
            background: variant === 'player'
              ? 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            boxShadow: `0 0 4px ${variant === 'player' ? '#f59e0b' : '#64748b'}`,
          }}
        />
        <div
          className="absolute -bottom-[3px] -left-[3px] w-2 h-2 rotate-45"
          style={{
            background: variant === 'player'
              ? 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            boxShadow: `0 0 4px ${variant === 'player' ? '#f59e0b' : '#64748b'}`,
          }}
        />
        <div
          className="absolute -bottom-[3px] -right-[3px] w-2 h-2 rotate-45"
          style={{
            background: variant === 'player'
              ? 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            boxShadow: `0 0 4px ${variant === 'player' ? '#f59e0b' : '#64748b'}`,
          }}
        />
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
