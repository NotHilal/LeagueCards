interface GoldDisplayProps {
  amount: number;
  showIncome?: boolean;
  incomeAmount?: number;
}

export default function GoldDisplay({ amount, showIncome = false, incomeAmount = 100 }: GoldDisplayProps) {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-900/80 to-yellow-800/80 px-3 py-1.5 rounded-lg border border-yellow-600/50 shadow-lg">
      {/* Gold coin icon */}
      <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-inner border border-yellow-300">
        <span className="text-yellow-900 text-xs font-bold">G</span>
      </div>

      {/* Amount */}
      <span className="text-yellow-300 font-bold text-sm tabular-nums">{amount.toLocaleString()}</span>

      {/* Income indicator */}
      {showIncome && (
        <span className="text-green-400 text-xs ml-1">
          (+{incomeAmount}/turn)
        </span>
      )}
    </div>
  );
}
