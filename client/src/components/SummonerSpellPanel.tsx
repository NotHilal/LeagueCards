interface SummonerSpell {
  id: string;
  name: string;
  summonerEffect?: string;
}

interface SummonerSpellPanelProps {
  spells: SummonerSpell[];
  usedSpells: string[];
  canUse: boolean; // Only during opponent's turn
  onUseSpell: (spellId: string, data?: any) => void;
  onClose: () => void;
  // For spells that need targets
  playerHand?: any[];
  playerGraveyard?: any[];
  playerField?: (any | null)[];
  opponentField?: (any | null)[];
}

const SPELL_ICONS: Record<string, string> = {
  FLASH: '⚡',
  IGNITE: '🔥',
  HEAL: '💚',
  BARRIER: '🛡️',
  EXHAUST: '💨',
  TELEPORT: '🌀',
  SMITE: '⚔️',
};

const SPELL_COLORS: Record<string, string> = {
  FLASH: 'from-yellow-500 to-yellow-700',
  IGNITE: 'from-orange-500 to-red-600',
  HEAL: 'from-green-400 to-green-600',
  BARRIER: 'from-cyan-400 to-cyan-600',
  EXHAUST: 'from-purple-400 to-purple-600',
  TELEPORT: 'from-blue-400 to-blue-600',
  SMITE: 'from-red-500 to-red-700',
};

export default function SummonerSpellPanel({
  spells,
  usedSpells,
  canUse,
  onUseSpell,
  onClose,
  playerHand = [],
  playerGraveyard = [],
  playerField = [],
  opponentField = [],
}: SummonerSpellPanelProps) {
  const isSpellUsed = (spellId: string) => usedSpells.includes(spellId);

  const handleSpellClick = (spell: SummonerSpell) => {
    if (!canUse || isSpellUsed(spell.id)) return;

    const spellType = spell.id.toUpperCase();

    // Simple spells that don't need targeting
    if (['IGNITE', 'HEAL'].includes(spellType)) {
      onUseSpell(spellType);
      return;
    }

    // For spells that need targets, we'll emit a "request_target" event
    // The parent component should handle showing target selection UI
    onUseSpell(spellType, { needsTarget: true });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900/98 border border-blue-500/50 rounded-lg shadow-2xl shadow-blue-500/20 overflow-hidden w-96 max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">Summoner Spells</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${
              canUse
                ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                : 'bg-red-500/20 text-red-300 border border-red-500/50'
            }`}>
              {canUse ? 'Available' : 'Wait for Enemy Turn'}
            </span>
          </div>
          <p className="text-blue-200 text-xs mt-1">
            React during opponent's turn • One-time use
          </p>
        </div>

        {/* Spells List */}
        <div className="p-3 space-y-2 max-h-[400px] overflow-auto">
          {spells.map((spell) => {
            const used = isSpellUsed(spell.id);
            const spellKey = spell.id.toUpperCase();
            const icon = SPELL_ICONS[spellKey] || '✨';
            const color = SPELL_COLORS[spellKey] || 'from-gray-500 to-gray-700';

            return (
              <div
                key={spell.id}
                onClick={() => handleSpellClick(spell)}
                className={`rounded-lg p-3 border transition-all ${
                  used
                    ? 'bg-slate-800/30 border-slate-700/30 opacity-40 cursor-not-allowed'
                    : canUse
                      ? 'bg-slate-800/80 border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-700/80 cursor-pointer'
                      : 'bg-slate-800/50 border-slate-700/30 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg`}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium">{spell.name}</p>
                      {used && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          Used
                        </span>
                      )}
                    </div>
                    <p className="text-blue-300 text-xs mt-1">
                      {spell.summonerEffect}
                    </p>

                    {/* Target requirements hint */}
                    {['FLASH', 'BARRIER', 'TELEPORT'].includes(spellKey) && !used && (
                      <p className="text-gray-500 text-[10px] mt-1 italic">
                        Requires target selection
                      </p>
                    )}
                    {['EXHAUST', 'SMITE'].includes(spellKey) && !used && (
                      <p className="text-gray-500 text-[10px] mt-1 italic">
                        Target enemy champion
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {spells.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No summoner spells available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 px-4 py-2 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full text-center text-slate-400 text-sm hover:text-white transition-colors py-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
