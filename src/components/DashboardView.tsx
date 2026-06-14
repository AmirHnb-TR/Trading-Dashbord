import { useDashboardStore } from '../store/dashboardStore';
import { exportPositionsToExcel } from '../services/excelExport';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardView() {
  const { settings, openPositions, history, loading, error, getAnalytics } = useDashboardStore();
  const analytics = getAnalytics();

  const handleExport = () => {
    // Export combined open positions and history
    const allTrades = [
        ...openPositions,
        ...history.map((h: any) => ({
            marketSymbol: h.marketSymbol,
            sideUi: h.sideUi,
            entryPriceUi: h.entryPriceUi,
            sizeUsdUi: h.sizeUsdUi,
            collateralUsdUi: '0',
            leverageUi: '0',
            liquidationPriceUi: '0',
            pnlWithFeeUsdUi: h.pnlUsd.toString(),
            pnlPercentageWithFee: h.pnlPercentage.toString()
        }))
    ];
    void exportPositionsToExcel(allTrades as any, settings.walletAddress, analytics.totalPnl);
  };

  const chartData = history.slice().reverse().map((t, index, arr) => {
    const accumulatedPnl = arr.slice(0, index + 1).reduce((sum, trade) => sum + trade.pnlUsd, 0);
    return {
        date: new Date(t.closeTime).toLocaleDateString(),
        capital: settings.initialCapital + accumulatedPnl,
        pnl: accumulatedPnl
    }
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <p className="text-[#9CA3AF] text-sm mt-1">Live tracking for {settings.walletAddress.slice(0, 4)}...{settings.walletAddress.slice(-4)}</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-[#1F2937] hover:bg-[#374151] text-white border border-[#374151] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export Excel
        </button>
      </header>

      {error && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-[#9CA3AF] text-sm font-medium mb-1">Total Capital (USDC)</p>
          <h3 className="text-2xl font-bold text-white">${analytics.totalCapital.toFixed(2)}</h3>
          <p className={`text-xs mt-2 font-medium ${analytics.totalPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {analytics.totalPnl >= 0 ? '↗' : '↘'} ${Math.abs(analytics.totalPnl).toFixed(2)} All-time PnL
          </p>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-sm">
          <p className="text-[#9CA3AF] text-sm font-medium mb-1">Win Rate</p>
          <h3 className="text-2xl font-bold text-white">{analytics.winRate.toFixed(1)}%</h3>
          <p className="text-xs mt-2 font-medium text-[#9CA3AF]">
            Based on {history.length} closed trades
          </p>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-sm">
          <p className="text-[#9CA3AF] text-sm font-medium mb-1">Profit Factor</p>
          <h3 className="text-2xl font-bold text-white">{analytics.profitFactor.toFixed(2)}</h3>
          <p className="text-xs mt-2 font-medium text-[#9CA3AF]">
            Gross Profit / Gross Loss
          </p>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-sm">
          <p className="text-[#9CA3AF] text-sm font-medium mb-1">Best Asset</p>
          <h3 className="text-2xl font-bold text-white">{analytics.bestAsset}</h3>
          <p className="text-xs mt-2 font-medium text-[#10B981]">
            Most profitable instrument
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-sm h-72 flex flex-col">
          <h3 className="font-bold text-white mb-4">Capital Curve</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.length > 0 ? chartData : [{date: '', capital: settings.initialCapital, pnl: 0}]}>
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1F2937', color: '#fff' }}
                  itemStyle={{ color: '#3B82F6' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Capital']}
                />
                <Line type="monotone" dataKey="capital" stroke="#3B82F6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-sm h-72 flex flex-col">
          <h3 className="font-bold text-white mb-4">Cumulative PnL</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.length > 0 ? chartData : [{date: '', capital: settings.initialCapital, pnl: 0}]}>
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1F2937', color: '#fff' }}
                  itemStyle={{ color: '#10B981' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'PnL']}
                />
                <Line type="stepAfter" dataKey="pnl" stroke="#10B981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Positions Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#1F2937] flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Live Open Positions</h3>
          <div className="flex items-center gap-2">
            {loading && <span className="flex w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></span>}
            <span className="text-xs text-[#9CA3AF]">Live via Flash API</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#0B0E14] text-[#9CA3AF]">
                <th className="py-3 px-5 font-medium">Market</th>
                <th className="py-3 px-5 font-medium">Side</th>
                <th className="py-3 px-5 font-medium">Size</th>
                <th className="py-3 px-5 font-medium">Entry Price</th>
                <th className="py-3 px-5 font-medium">Liq. Price</th>
                <th className="py-3 px-5 font-medium text-right">PnL (USD)</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#9CA3AF]">
                    {loading ? 'Syncing...' : 'No open positions right now.'}
                  </td>
                </tr>
              ) : (
                openPositions.map((pos) => {
                  const isLong = pos.sideUi.toLowerCase() === 'long';
                  const pnlUsd = parseFloat(pos.pnlWithFeeUsdUi || '0');
                  return (
                    <tr key={pos.key} className="border-b border-[#1F2937] hover:bg-[#1F2937]/50 transition-colors">
                      <td className="py-4 px-5 text-white font-medium flex items-center gap-2">
                        {pos.marketSymbol}
                        <span className="text-[10px] bg-[#374151] text-[#D1D5DB] px-1.5 py-0.5 rounded">
                          {pos.leverageUi}x
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${isLong ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                          {pos.sideUi}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-[#D1D5DB]">${parseFloat(pos.sizeUsdUi).toFixed(2)}</td>
                      <td className="py-4 px-5 text-[#D1D5DB]">${parseFloat(pos.entryPriceUi).toFixed(pos.marketSymbol === 'BONK' ? 6 : 2)}</td>
                      <td className="py-4 px-5 text-[#F59E0B]">${parseFloat(pos.liquidationPriceUi).toFixed(pos.marketSymbol === 'BONK' ? 6 : 2)}</td>
                      <td className="py-4 px-5 text-right">
                        <div className={`font-bold ${pnlUsd >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {pnlUsd >= 0 ? '+' : '-'}${Math.abs(pnlUsd).toFixed(2)}
                        </div>
                        <div className={`text-[11px] ${pnlUsd >= 0 ? 'text-[#10B981]/80' : 'text-[#EF4444]/80'}`}>
                          {pnlUsd >= 0 ? '+' : ''}{parseFloat(pos.pnlPercentageWithFee || '0').toFixed(2)}%
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
