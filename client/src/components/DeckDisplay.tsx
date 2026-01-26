interface DeckDisplayProps {
  mainDeckCount: number;
  usedRunes: number;
  totalRunes: number;
  graveyardCount: number;
  onRuneClick?: () => void;
}

export default function DeckDisplay({
  mainDeckCount,
  usedRunes,
  totalRunes,
  graveyardCount,
  onRuneClick,
}: DeckDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Main Deck */}
      <div className="flex items-center gap-2 bg-gray-800/60 rounded px-3 py-2 border border-gray-700">
        <div className="relative">
          {/* Deck stack effect */}
          <div className="absolute top-0.5 left-0.5 w-8 h-10 bg-gradient-to-br from-blue-900 to-blue-950 rounded border border-blue-800" />
          <div className="absolute top-0.25 left-0.25 w-8 h-10 bg-gradient-to-br from-blue-800 to-blue-900 rounded border border-blue-700" />
          <div className="relative w-8 h-10 bg-gradient-to-br from-blue-700 to-blue-800 rounded border border-blue-600 flex items-center justify-center">
            <span className="text-lg">🎴</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">Main Deck</span>
          <span className="text-white font-bold text-sm">{mainDeckCount}</span>
        </div>
      </div>

      {/* Rune Deck */}
      <button
        onClick={onRuneClick}
        className="flex items-center gap-2 bg-purple-900/40 rounded px-3 py-2 border border-purple-700/50 hover:border-purple-500 transition-colors cursor-pointer"
      >
        <div className="w-8 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded border border-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span className="text-white text-lg">◆</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-purple-300 uppercase">Runes</span>
          <span className="text-purple-200 font-bold text-sm">
            {totalRunes - usedRunes}/{totalRunes}
          </span>
        </div>
      </button>

      {/* Graveyard */}
      <div className="flex items-center gap-2 bg-gray-800/60 rounded px-3 py-2 border border-gray-700">
        <div className="w-8 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded border border-gray-600 flex items-center justify-center">
          <span className="text-lg">💀</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">Graveyard</span>
          <span className="text-gray-300 font-bold text-sm">{graveyardCount}</span>
        </div>
      </div>
    </div>
  );
}
