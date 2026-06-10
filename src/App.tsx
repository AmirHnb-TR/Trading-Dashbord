import { useState, useMemo } from 'react';
import type { Trade, DashboardStats, ChartDataPoint, TradeSession } from './types/dashboard';
import { MetricsGrid } from './components/MetricsGrid';
import { PLChart } from './components/PLChart';
import { CapitalChart } from './components/CapitalChart';
import { RecentTrades } from './components/RecentTrades';
import { NewTradeForm } from './components/NewTradeForm';

// Initial dummy data
const INITIAL_TRADES: Trade[] = [
  { id: '1', pair: 'EUR/USD', type: 'LONG', entryPrice: 1.0850, exitPrice: 1.0890, amount: 10000, profit: 40, date: '2023-10-01T10:00:00Z', session: 'New York' },
  { id: '2', pair: 'GBP/USD', type: 'SHORT', entryPrice: 1.2500, exitPrice: 1.2450, amount: 10000, profit: 50, date: '2023-10-02T08:30:00Z', session: 'London' },
  { id: '3', pair: 'USD/JPY', type: 'LONG', entryPrice: 149.50, exitPrice: 149.00, amount: 10000, profit: -33, date: '2023-10-03T02:00:00Z', session: 'Tokyo' },
  { id: '4', pair: 'BTC/USD', type: 'LONG', entryPrice: 34000, exitPrice: 35000, amount: 0.1, profit: 100, date: '2023-10-04T14:00:00Z', session: 'New York' },
  { id: '5', pair: 'ETH/USD', type: 'SHORT', entryPrice: 1800, exitPrice: 1850, amount: 1, profit: -50, date: '2023-10-05T15:30:00Z', session: 'New York' },
];

function App() {
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [deposits] = useState(5000);
  const [withdrawals] = useState(1000);
  const [initialCapital] = useState(4000); // Net of deposits - withdrawals before trades

  const handleAddTrade = (trade: Trade) => {
    setTrades([trade, ...trades]);
  };

  const stats = useMemo<DashboardStats>(() => {
    const totalProfit = trades.reduce((acc, t) => acc + t.profit, 0);
    const totalCapital = initialCapital + totalProfit;
    
    // Simplistic daily/monthly for demonstration
    const dailyProfit = trades.length > 0 ? trades[0].profit : 0; 
    const monthlyProfit = totalProfit;

    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit <= 0);
    
    const grossProfit = winningTrades.reduce((acc, t) => acc + t.profit, 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.profit, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    const longTrades = trades.filter(t => t.type === 'LONG');
    const shortTrades = trades.filter(t => t.type === 'SHORT');
    
    const longWinRate = longTrades.length ? (longTrades.filter(t => t.profit > 0).length / longTrades.length) * 100 : 0;
    const shortWinRate = shortTrades.length ? (shortTrades.filter(t => t.profit > 0).length / shortTrades.length) * 100 : 0;

    // Best session
    const sessionProfits: Record<string, number> = {};
    trades.forEach(t => {
      sessionProfits[t.session] = (sessionProfits[t.session] || 0) + t.profit;
    });
    let bestSession: TradeSession = 'Other';
    let maxSessionProfit = -Infinity;
    Object.entries(sessionProfits).forEach(([session, profit]) => {
      if (profit > maxSessionProfit) {
        maxSessionProfit = profit;
        bestSession = session as TradeSession;
      }
    });

    return {
      totalCapital,
      dailyProfit,
      monthlyProfit,
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      profitFactor,
      longWinRate,
      shortWinRate,
      bestSession: maxSessionProfit > 0 ? bestSession : 'Other',
    };
  }, [trades, initialCapital, deposits, withdrawals]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const initial = initialCapital;
    // Sort chronological for chart
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sortedTrades.map((t, index) => {
      const cap = initial + trades.slice(0, index + 1).reduce((acc, tr) => acc + tr.profit, 0);
      return {
        date: new Date(t.date).toLocaleDateString(),
        profit: t.profit,
        capital: cap
      };
    });
  }, [trades, initialCapital]);

  return (
    <div className="min-h-screen p-6 font-sans bg-nano-dark text-nano-text">
      <header className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-nano-primary flex items-center justify-center text-nano-dark font-bold text-xl">
          NB
        </div>
        <div>
          <h1 className="text-3xl font-bold text-nano-text-bright">Nano Banana Dashboard</h1>
          <p className="text-sm">Track your performance and analyze your trades</p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left Column (Charts and History) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart */}
          <div className="bg-nano-card border border-nano-border rounded-xl p-6 h-[400px]">
            <PLChart data={chartData} />
          </div>
          
          {/* Recent Trades */}
          <div className="bg-nano-card border border-nano-border rounded-xl p-6">
            <RecentTrades trades={trades} />
          </div>
        </div>

        {/* Right Column (Metrics, Capital, and Form) */}
        <div className="space-y-6">
          {/* Side Chart */}
          <div className="bg-nano-card border border-nano-border rounded-xl p-6 h-64">
            <CapitalChart data={chartData} />
          </div>
          
          {/* Metrics Grid */}
          <div className="bg-nano-card border border-nano-border rounded-xl p-6">
            <MetricsGrid stats={stats} />
          </div>

          {/* Form */}
          <div className="bg-nano-card border border-nano-border rounded-xl p-6">
            <NewTradeForm onAddTrade={handleAddTrade} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
