interface RegionBonus {
  region: string;
  count: number;
  twoPlus: boolean;
  fourPlus: boolean;
}

interface RegionSynergyPanelProps {
  regionBonuses: RegionBonus[];
  compact?: boolean;
}

const REGION_INFO: Record<string, { name: string; icon: string; color: string }> = {
  DEMACIA: { name: 'Demacia', icon: '🛡️', color: 'from-yellow-400 to-yellow-600' },
  NOXUS: { name: 'Noxus', icon: '⚔️', color: 'from-red-500 to-red-700' },
  FRELJORD: { name: 'Freljord', icon: '❄️', color: 'from-blue-300 to-blue-500' },
  PILTOVER: { name: 'Piltover', icon: '⚙️', color: 'from-amber-400 to-amber-600' },
  IONIA: { name: 'Ionia', icon: '🌸', color: 'from-pink-400 to-pink-600' },
  BILGEWATER: { name: 'Bilgewater', icon: '🏴‍☠️', color: 'from-teal-500 to-teal-700' },
  SHADOW_ISLES: { name: 'Shadow Isles', icon: '💀', color: 'from-green-600 to-green-800' },
  SHURIMA: { name: 'Shurima', icon: '☀️', color: 'from-orange-400 to-orange-600' },
  THE_VOID: { name: 'The Void', icon: '🌀', color: 'from-purple-600 to-purple-800' },
  IXTAL: { name: 'Ixtal', icon: '🌿', color: 'from-emerald-400 to-emerald-600' },
  DARKIN: { name: 'Darkin', icon: '😈', color: 'from-red-700 to-red-900' },
  YORDLE: { name: 'Yordle', icon: '🐾', color: 'from-violet-400 to-violet-600' },
  RUNETERRA: { name: 'Runeterra', icon: '🌍', color: 'from-gray-400 to-gray-600' },
};

const SYNERGY_EFFECTS: Record<string, { twoPlus: string; fourPlus: string }> = {
  DEMACIA: {
    twoPlus: '+100 DEF to Demacians',
    fourPlus: '+200 ATK to Demacians',
  },
  NOXUS: {
    twoPlus: '+100 ATK on attacks',
    fourPlus: 'First kill: +200 gold',
  },
  SHADOW_ISLES: {
    twoPlus: 'Death deals 200 damage',
    fourPlus: 'Revive 1 champion (1/game)',
  },
};

export default function RegionSynergyPanel({ regionBonuses, compact = false }: RegionSynergyPanelProps) {
  if (regionBonuses.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex gap-1 flex-wrap">
        {regionBonuses.map((bonus) => {
          const info = REGION_INFO[bonus.region] || { name: bonus.region, icon: '⭐', color: 'from-gray-400 to-gray-600' };
          return (
            <div
              key={bonus.region}
              className={`px-2 py-0.5 rounded bg-gradient-to-r ${info.color} text-white text-xs font-medium flex items-center gap-1`}
              title={`${info.name}: ${bonus.count} champions`}
            >
              <span>{info.icon}</span>
              <span>{bonus.count}</span>
              {bonus.fourPlus && <span className="text-yellow-200">★★</span>}
              {bonus.twoPlus && !bonus.fourPlus && <span className="text-yellow-200">★</span>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-3 max-w-xs">
      <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
        <span className="text-purple-400">✦</span>
        Region Synergies
      </h3>
      <div className="space-y-2">
        {regionBonuses.map((bonus) => {
          const info = REGION_INFO[bonus.region] || { name: bonus.region, icon: '⭐', color: 'from-gray-400 to-gray-600' };
          const effects = SYNERGY_EFFECTS[bonus.region];

          return (
            <div
              key={bonus.region}
              className="bg-slate-800/50 rounded p-2 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded bg-gradient-to-br ${info.color} flex items-center justify-center`}>
                    <span className="text-sm">{info.icon}</span>
                  </div>
                  <span className="text-white text-sm font-medium">{info.name}</span>
                </div>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  bonus.fourPlus ? 'bg-yellow-500/20 text-yellow-300' :
                  bonus.twoPlus ? 'bg-blue-500/20 text-blue-300' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {bonus.count}/4
                </span>
              </div>

              {effects && (
                <div className="text-xs space-y-0.5 mt-1">
                  {bonus.twoPlus && (
                    <div className={`${bonus.twoPlus ? 'text-green-400' : 'text-gray-500'}`}>
                      <span className="text-gray-500">2+:</span> {effects.twoPlus}
                    </div>
                  )}
                  {bonus.fourPlus && (
                    <div className={`${bonus.fourPlus ? 'text-yellow-400' : 'text-gray-500'}`}>
                      <span className="text-gray-500">4+:</span> {effects.fourPlus}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
