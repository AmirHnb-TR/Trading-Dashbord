import { useState, useEffect } from 'react';
import { LayoutDashboard, History, Wallet, BarChart3, Settings } from 'lucide-react';
import { useDashboardStore } from './store/dashboardStore';

import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { WalletView } from './components/WalletView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { settings, openPositions, fetchPositions, getAnalytics } = useDashboardStore();
  const [alertMessage, setAlertMessage] = useState<{title: string, message: string, type: 'success' | 'error' | 'warning'} | null>(null);

  const analytics = getAnalytics();

  // Setup the polling interval once at the root level using Zustand actions
  useEffect(() => {
    void fetchPositions();
    const interval = setInterval(() => void fetchPositions(), 10000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  useEffect(() => {
    if (openPositions.length > 0 || analytics.dailyProfit !== 0) {
      const checkAlerts = () => {
        if (settings.dailyProfitGoal && analytics.dailyProfit >= settings.dailyProfitGoal) {
          setAlertMessage({
            title: '🎯 Profit Goal Reached!',
            message: `Congratulations! Your daily PnL ($${analytics.dailyProfit.toFixed(2)}) has reached your daily goal of $${settings.dailyProfitGoal}.`,
            type: 'success'
          });
        } else if (settings.dailyStopLoss && analytics.dailyProfit <= -settings.dailyStopLoss) {
          setAlertMessage({
            title: '⚠️ Stop Loss Hit!',
            message: `Warning! Your daily PnL ($${analytics.dailyProfit.toFixed(2)}) has hit your daily stop loss of -$${settings.dailyStopLoss}. Consider stopping for today.`,
            type: 'error'
          });
        } else {
          setAlertMessage(null);
        }
      };

      const timeoutId = setTimeout(checkAlerts, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [analytics.dailyProfit, settings.dailyProfitGoal, settings.dailyStopLoss, openPositions.length]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E2E8F0] font-sans flex">
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

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#3B82F6] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            ⚡
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white">Flash Analytics</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#3B82F6] text-white font-medium shadow-md' : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-[#3B82F6] text-white font-medium shadow-md' : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'}`}
          >
            <History size={20} /> Trade History
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'wallet' ? 'bg-[#3B82F6] text-white font-medium shadow-md' : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'}`}
          >
            <Wallet size={20} /> Finances
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-[#3B82F6] text-white font-medium shadow-md' : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'}`}
          >
            <BarChart3 size={20} /> Sessions & Analytics
          </button>
        </nav>

        <div className="p-4 border-t border-[#1F2937] space-y-2">
           <div className="text-xs text-[#9CA3AF] px-2 space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Daily PnL:</span>
                <span className={`font-bold ${analytics.dailyProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>${analytics.dailyProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly PnL:</span>
                <span className={`font-bold ${analytics.monthlyProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>${analytics.monthlyProfit.toFixed(2)}</span>
              </div>
           </div>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-[#3B82F6] text-white font-medium shadow-md' : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'}`}
          >
            <Settings size={20} /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-[#111827] border-b border-[#1F2937] p-4 flex justify-between items-center">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#3B82F6] flex items-center justify-center font-bold text-white">⚡</div>
              <h1 className="font-bold text-white">Flash Analytics</h1>
           </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'wallet' && <WalletView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default App;
