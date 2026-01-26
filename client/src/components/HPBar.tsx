interface HPBarProps {
  current: number;
  max: number;
  showText?: boolean;
  width?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function HPBar({ current, max, showText = true, width = 'w-64', size = 'md' }: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  const sizeClasses = {
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  // Dynamic color based on HP percentage
  const getBarColors = () => {
    if (percentage > 60) {
      return {
        main: 'from-emerald-400 via-green-500 to-emerald-600',
        glow: 'shadow-emerald-500/60',
        border: 'border-emerald-400/50',
        pulse: 'bg-emerald-400',
      };
    } else if (percentage > 30) {
      return {
        main: 'from-amber-400 via-yellow-500 to-orange-500',
        glow: 'shadow-yellow-500/60',
        border: 'border-yellow-400/50',
        pulse: 'bg-yellow-400',
      };
    } else {
      return {
        main: 'from-red-400 via-red-500 to-red-700',
        glow: 'shadow-red-500/70',
        border: 'border-red-400/50',
        pulse: 'bg-red-400',
      };
    }
  };

  const colors = getBarColors();

  return (
    <div className={`${width} ${sizeClasses[size]} relative`}>
      {/* Outer frame */}
      <div className={`absolute inset-0 rounded bg-gradient-to-b from-gray-700 to-gray-900 p-[2px]`}>
        {/* Inner background */}
        <div className="w-full h-full rounded-sm bg-gradient-to-b from-gray-950 to-black relative overflow-hidden">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
              backgroundSize: '8px 8px',
            }}
          />

          {/* HP Fill */}
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.main} transition-all duration-700 ease-out ${colors.glow} shadow-lg`}
            style={{ width: `${percentage}%` }}
          >
            {/* Top shine */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent" />

            {/* Bottom reflection */}
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Animated shimmer effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
              style={{ animationDuration: '2s' }}
            />

            {/* Edge glow */}
            {percentage > 0 && percentage < 100 && (
              <div className={`absolute right-0 top-0 bottom-0 w-1 ${colors.pulse} blur-sm`} />
            )}
          </div>

          {/* Segment lines */}
          <div className="absolute inset-0 flex pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-white/5 last:border-r-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Text overlay */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`${textSizes[size]} font-bold tracking-wide`}
            style={{
              color: 'white',
              textShadow: '0 0 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
            }}
          >
            {current.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-l-2 border-t-2 border-gray-500/50" />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-r-2 border-t-2 border-gray-500/50" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-l-2 border-b-2 border-gray-500/50" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-r-2 border-b-2 border-gray-500/50" />
    </div>
  );
}
