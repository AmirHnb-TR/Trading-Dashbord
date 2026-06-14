import { useDashboardStore } from '../store/dashboardStore';

export function SettingsView() {
  const { settings, setSettings } = useDashboardStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved!');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl">
      <header>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-[#9CA3AF] text-sm mt-1">Configure your dashboard</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-[#9CA3AF] text-sm font-medium mb-2">Solana Wallet Address</label>
          <input
            type="text" required
            className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-lg px-4 py-2.5 focus:border-[#3B82F6] focus:outline-none"
            value={settings.walletAddress}
            onChange={(e) => setSettings({ ...settings, walletAddress: e.target.value })}
          />
          <p className="text-xs text-[#6B7280] mt-2">The dashboard will pull live open positions for this wallet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[#9CA3AF] text-sm font-medium mb-2">Initial Capital (USDC)</label>
            <input
              type="number" min="0" required
              className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-lg px-4 py-2.5 focus:border-[#3B82F6] focus:outline-none"
              value={settings.initialCapital}
              onChange={(e) => setSettings({ ...settings, initialCapital: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-1 hidden md:block"></div>

          <div>
            <label className="block text-[#9CA3AF] text-sm font-medium mb-2">Daily Profit Goal ($)</label>
            <input
              type="number" min="0"
              className="w-full bg-[#0B0E14] border border-[#1F2937] text-[#10B981] font-medium rounded-lg px-4 py-2.5 focus:border-[#3B82F6] focus:outline-none"
              value={settings.dailyProfitGoal}
              onChange={(e) => setSettings({ ...settings, dailyProfitGoal: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-[#9CA3AF] text-sm font-medium mb-2">Daily Stop Loss ($)</label>
            <input
              type="number" min="0"
              className="w-full bg-[#0B0E14] border border-[#1F2937] text-[#EF4444] font-medium rounded-lg px-4 py-2.5 focus:border-[#3B82F6] focus:outline-none"
              value={settings.dailyStopLoss}
              onChange={(e) => setSettings({ ...settings, dailyStopLoss: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#1F2937]">
          <button
            type="submit"
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
