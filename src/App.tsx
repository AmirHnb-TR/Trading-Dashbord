import { useState, useMemo, useEffect } from 'react';
import { fetchUserPositions, type FlashPosition } from './services/flashApi';
import { exportPositionsToExcel } from './services/excelExport';

function App() {
  const [walletPubkey, setWalletPubkey] = useState<string>('');
  const [activeWallet, setActiveWallet] = useState<string>('');
  const [dailyProfitGoal, setDailyProfitGoal] = useState<string>('');
  const [dailyStopLoss, setDailyStopLoss] = useState<string>('');

  const [positions, setPositions] = useState<FlashPosition[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [alertMessage, setAlertMessage] = useState<{title: string, message: string, type: 'success' | 'error' | 'warning'} | null>(null);

  // Poll for live positions
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (activeWallet) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const data = await fetchUserPositions(activeWallet);
          setPositions(data);
          setError(null);
        } catch {
          setError('Failed to fetch positions. Check your wallet address.');
        } finally {
          setLoading(false);
        }
      };

      fetchData(); // initial fetch
      interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    }
    
    return () => clearInterval(interval);
  }, [activeWallet]);

  // Calculate total PnL
  const totalPnl = useMemo(() => {
    return positions.reduce((acc, pos) => acc + parseFloat(pos.pnlWithFeeUsdUi || '0'), 0);
  }, [positions]);

  // Check alerts
  useEffect(() => {
    if (positions.length > 0) {
      const checkAlerts = () => {
        if (dailyProfitGoal && totalPnl >= parseFloat(dailyProfitGoal)) {
          setAlertMessage({
            title: '🎯 Profit Goal Reached!',
            message: `Congratulations! Your PnL ($${totalPnl.toFixed(2)}) has reached your daily goal of $${dailyProfitGoal}.`,
            type: 'success'
          });
        } else if (dailyStopLoss && totalPnl <= -parseFloat(dailyStopLoss)) {
          setAlertMessage({
            title: '⚠️ Stop Loss Hit!',
            message: `Warning! Your PnL ($${totalPnl.toFixed(2)}) has hit your daily stop loss of -$${dailyStopLoss}. Consider stopping for today.`,
            type: 'error'
          });
        } else {
          setAlertMessage(null); // Clear alert if conditions no longer met
        }
      };

      const timeoutId = setTimeout(checkAlerts, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [totalPnl, dailyProfitGoal, dailyStopLoss, positions.length]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (walletPubkey.trim() !== '') {
      setActiveWallet(walletPubkey.trim());
    }
  };

  const handleExport = async () => {
    await exportPositionsToExcel(positions, activeWallet, totalPnl);
  };

  // Disconnect handler to reset state
  const handleDisconnect = () => {
    setActiveWallet('');
    setPositions([]);
    setAlertMessage(null);
  };

  if (!activeWallet) {
    return (
      <div className="min-h-screen p-6 font-sans bg-nano-dark text-nano-text flex items-center justify-center">
        <div className="max-w-md w-full bg-nano-card border border-nano-border rounded-xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-nano-primary flex items-center justify-center text-nano-dark font-bold text-2xl mb-4">
              ⚡
            </div>
            <h1 className="text-2xl font-bold text-nano-text-bright">Flash Trade Dashboard</h1>
            <p className="text-sm mt-2">Connect your wallet to track your live PnL</p>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Solana Wallet Address</label>
              <input
                type="text"
                required
                className="w-full bg-nano-dark border border-nano-border rounded-lg px-4 py-2 text-nano-text-bright focus:outline-none focus:border-nano-primary"
                placeholder="e.g. 7xKXtg..."
                value={walletPubkey}
                onChange={(e) => setWalletPubkey(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Daily Profit Goal ($)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-nano-dark border border-nano-border rounded-lg px-4 py-2 text-nano-text-bright focus:outline-none focus:border-nano-primary"
                  placeholder="50"
                  value={dailyProfitGoal}
                  onChange={(e) => setDailyProfitGoal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Daily Stop Loss ($)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-nano-dark border border-nano-border rounded-lg px-4 py-2 text-nano-text-bright focus:outline-none focus:border-nano-primary"
                  placeholder="20"
                  value={dailyStopLoss}
                  onChange={(e) => setDailyStopLoss(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-nano-primary text-nano-dark font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Connect & Start Tracking
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 font-sans bg-nano-dark text-nano-text">
      {/* Alert Overlay */}
      {alertMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm border-l-4 ${
          alertMessage.type === 'success' ? 'bg-[#0f291e] border-[#00e676] text-[#00e676]' :
          alertMessage.type === 'error' ? 'bg-[#2a0f15] border-[#ff1744] text-[#ff1744]' :
          'bg-[#2d210b] border-[#ffea00] text-[#ffea00]'
        }`}>
          <h3 className="font-bold text-lg mb-1">{alertMessage.title}</h3>
          <p className="text-sm opacity-90">{alertMessage.message}</p>
        </div>
      )}

      <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-nano-primary flex items-center justify-center text-nano-dark font-bold text-xl">
            ⚡
          </div>
          <div>
            <h1 className="text-3xl font-bold text-nano-text-bright">Flash Trade Performance</h1>
            <p className="text-sm opacity-70">
              Wallet: {activeWallet.slice(0, 4)}...{activeWallet.slice(-4)}
              {loading && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-nano-primary animate-pulse"></span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Floating PnL Widget */}
          <div className="bg-nano-card border border-nano-border rounded-xl px-6 py-3 flex items-center gap-4">
            <div>
              <p className="text-xs uppercase font-semibold opacity-70">Total PnL (Open)</p>
              <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-[#00e676]' : 'text-[#ff1744]'}`}>
                {totalPnl >= 0 ? '+' : '-'}${Math.abs(totalPnl).toFixed(2)}
              </p>
            </div>
            {(dailyProfitGoal || dailyStopLoss) && (
              <div className="text-xs border-l border-nano-border pl-4 space-y-1">
                {dailyProfitGoal && <p>Goal: <span className="text-[#00e676]">${dailyProfitGoal}</span></p>}
                {dailyStopLoss && <p>Stop: <span className="text-[#ff1744]">-${dailyStopLoss}</span></p>}
              </div>
            )}
          </div>
          
          <button
            onClick={() => void handleExport()}
            className="bg-[#1F4E78] hover:bg-[#2a689e] text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            📊 Export Excel
          </button>

          <button
            onClick={handleDisconnect}
            className="border border-nano-border hover:bg-nano-card px-4 py-3 rounded-xl font-semibold transition-colors"
          >
            Disconnect
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="bg-[#2a0f15] border border-[#ff1744] text-[#ff1744] p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Live Positions Table */}
        <div className="bg-nano-card border border-nano-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-nano-text-bright">Open Positions</h2>
            <div className="text-sm opacity-70">
              Auto-updates every 10s
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nano-border text-sm opacity-70">
                  <th className="pb-3 px-4">Market</th>
                  <th className="pb-3 px-4">Side</th>
                  <th className="pb-3 px-4">Size</th>
                  <th className="pb-3 px-4">Entry Price</th>
                  <th className="pb-3 px-4">Liq. Price</th>
                  <th className="pb-3 px-4 text-right">PnL (USD)</th>
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 opacity-50">
                      {loading ? 'Loading positions...' : 'No open positions found on Flash Trade.'}
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => {
                    const isLong = pos.sideUi.toLowerCase() === 'long';
                    const pnlUsd = parseFloat(pos.pnlWithFeeUsdUi);
                    return (
                      <tr key={pos.key} className="border-b border-nano-border/50 hover:bg-nano-dark/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-nano-text-bright flex items-center gap-2">
                          {pos.marketSymbol}
                          <span className="text-xs bg-nano-dark px-2 py-1 rounded opacity-70 border border-nano-border">
                            {pos.leverageUi}x
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${isLong ? 'bg-[#00e676]/20 text-[#00e676]' : 'bg-[#ff1744]/20 text-[#ff1744]'}`}>
                            {pos.sideUi}
                          </span>
                        </td>
                        <td className="py-4 px-4">${parseFloat(pos.sizeUsdUi).toFixed(2)}</td>
                        <td className="py-4 px-4">${parseFloat(pos.entryPriceUi).toFixed(pos.marketSymbol === 'BONK' ? 6 : 2)}</td>
                        <td className="py-4 px-4 text-orange-400">${parseFloat(pos.liquidationPriceUi).toFixed(pos.marketSymbol === 'BONK' ? 6 : 2)}</td>
                        <td className={`py-4 px-4 text-right font-bold ${pnlUsd >= 0 ? 'text-[#00e676]' : 'text-[#ff1744]'}`}>
                          {pnlUsd >= 0 ? '+' : '-'}${Math.abs(pnlUsd).toFixed(2)}
                          <span className="block text-xs font-normal opacity-80">
                            {pnlUsd >= 0 ? '+' : ''}{parseFloat(pos.pnlPercentageWithFee).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
