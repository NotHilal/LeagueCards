interface SummonerSpell {
  id: string;
  name: string;
  summonerEffect?: string;
}

interface SummonerSpellPanelProps {
  spells: SummonerSpell[];
  usedSpells: string[];
  canUse: boolean;
  onUseSpell: (spellId: string, data?: any) => void;
  onClose: () => void;
  playerHand?: any[];
  playerGraveyard?: any[];
  playerField?: (any | null)[];
  opponentField?: (any | null)[];
}

const SPELL_DATA: Record<string, { icon: string; color: string; glow: string; hotkey: string }> = {
  FLASH: {
    icon: '⚡',
    color: 'from-yellow-400 via-yellow-500 to-amber-600',
    glow: 'shadow-yellow-500/50',
    hotkey: 'D'
  },
  IGNITE: {
    icon: '🔥',
    color: 'from-orange-500 via-red-500 to-red-700',
    glow: 'shadow-red-500/50',
    hotkey: 'F'
  },
  HEAL: {
    icon: '💚',
    color: 'from-emerald-400 via-green-500 to-green-600',
    glow: 'shadow-green-500/50',
    hotkey: 'D'
  },
  BARRIER: {
    icon: '🛡️',
    color: 'from-orange-300 via-amber-400 to-yellow-500',
    glow: 'shadow-amber-500/50',
    hotkey: 'D'
  },
  EXHAUST: {
    icon: '💨',
    color: 'from-purple-400 via-purple-500 to-purple-700',
    glow: 'shadow-purple-500/50',
    hotkey: 'D'
  },
  TELEPORT: {
    icon: '🌀',
    color: 'from-indigo-400 via-blue-500 to-purple-600',
    glow: 'shadow-blue-500/50',
    hotkey: 'D'
  },
  SMITE: {
    icon: '⚔️',
    color: 'from-red-500 via-orange-500 to-amber-500',
    glow: 'shadow-orange-500/50',
    hotkey: 'D'
  },
};

export default function SummonerSpellPanel({
  spells,
  usedSpells,
  canUse,
  onUseSpell,
  onClose,
}: SummonerSpellPanelProps) {
  const isSpellUsed = (spellId: string) => usedSpells.includes(spellId);

  const handleSpellClick = (spell: SummonerSpell) => {
    if (!canUse || isSpellUsed(spell.id)) return;

    const spellType = spell.id.toUpperCase();

    if (['IGNITE', 'HEAL'].includes(spellType)) {
      onUseSpell(spellType);
      return;
    }

    onUseSpell(spellType, { needsTarget: true });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative">
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-2xl blur opacity-30 animate-pulse" />

        {/* Main container */}
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl overflow-hidden w-[420px] border border-cyan-500/30">

          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-cyan-600/20" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDBMMCA0MHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-wide">SUMMONER SPELLS</h3>
                    <p className="text-cyan-300/70 text-xs">React during enemy turn</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  canUse
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {canUse ? '● Ready' : '○ Waiting'}
                </div>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>

          {/* Spells Grid */}
          <div className="p-4 grid grid-cols-2 gap-3 max-h-[400px] overflow-auto">
            {spells.map((spell) => {
              const used = isSpellUsed(spell.id);
              const spellKey = spell.id.toUpperCase();
              const data = SPELL_DATA[spellKey] || {
                icon: '✨',
                color: 'from-gray-500 to-gray-700',
                glow: 'shadow-gray-500/50',
                hotkey: 'D'
              };

              return (
                <div
                  key={spell.id}
                  onClick={() => handleSpellClick(spell)}
                  className={`relative group rounded-xl overflow-hidden transition-all duration-200 ${
                    used
                      ? 'opacity-40 cursor-not-allowed'
                      : canUse
                        ? 'cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5'
                        : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Card background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${data.color} opacity-10 ${!used && canUse ? 'group-hover:opacity-20' : ''} transition-opacity`} />
                  <div className="absolute inset-0 bg-slate-800/90" />

                  {/* Border glow on hover */}
                  {!used && canUse && (
                    <div className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-cyan-500/50 transition-colors`} />
                  )}

                  <div className="relative p-3">
                    <div className="flex items-start gap-3">
                      {/* Spell Icon */}
                      <div className={`relative flex-shrink-0`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${data.color} flex items-center justify-center shadow-lg ${!used && canUse ? data.glow : ''} transition-shadow`}>
                          <span className="text-2xl filter drop-shadow-lg">{data.icon}</span>
                        </div>
                        {used && (
                          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                            <span className="text-red-500 text-xl">✕</span>
                          </div>
                        )}
                      </div>

                      {/* Spell Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{spell.name}</span>
                          {used && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/30 text-red-400 font-medium">
                              USED
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                          {spell.summonerEffect}
                        </p>
                      </div>
                    </div>

                    {/* Use button indicator */}
                    {!used && canUse && (
                      <div className="mt-2 flex items-center justify-end">
                        <div className="text-[10px] text-cyan-400/70 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to cast →
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {spells.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2 opacity-50">✨</div>
              <p className="text-slate-500">No summoner spells available</p>
            </div>
          )}

          {/* Footer */}
          <div className="relative">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <div className="px-6 py-3 bg-slate-950/50">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600/50 text-slate-300 hover:text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Close</span>
                <span className="text-slate-500 text-xs">[ESC]</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
