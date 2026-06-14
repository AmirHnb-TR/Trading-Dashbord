import { useDashboardStore } from '../store/dashboardStore';

export function HistoryView() {
  const { history, clearHistory } = useDashboardStore();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Trade History</h2>
          <p className="text-[#9CA3AF] text-sm mt-1">Locally tracked closed positions</p>
        </div>
        <button
          onClick={clearHistory}
          className="text-[#EF4444] hover:text-white hover:bg-[#EF4444] border border-[#EF4444]/50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          Clear History
        </button>
      </header>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#0B0E14] text-[#9CA3AF]">
                <th className="py-3 px-5 font-medium">Date</th>
                <th className="py-3 px-5 font-medium">Market</th>
                <th className="py-3 px-5 font-medium">Side</th>
                <th className="py-3 px-5 font-medium">Session</th>
                <th className="py-3 px-5 font-medium text-right">Final PnL</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#9CA3AF]">
                    No closed trades recorded yet. Keep the dashboard open while trading!
                  </td>
                </tr>
              ) : (
                history.map((trade) => {
                  const isLong = trade.sideUi.toLowerCase() === 'long';
                  return (
                    <tr key={trade.id} className="border-b border-[#1F2937] hover:bg-[#1F2937]/50 transition-colors">
                      <td className="py-4 px-5 text-[#D1D5DB]">
                        {new Date(trade.closeTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-5 text-white font-medium">{trade.marketSymbol}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${isLong ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                          {trade.sideUi}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-[#9CA3AF]">{trade.session}</td>
                      <td className="py-4 px-5 text-right">
                        <div className={`font-bold ${trade.pnlUsd >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {trade.pnlUsd >= 0 ? '+' : '-'}${Math.abs(trade.pnlUsd).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
