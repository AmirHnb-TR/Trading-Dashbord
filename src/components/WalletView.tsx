import { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

export function WalletView() {
  const { finances, addFinancialRecord, getAnalytics } = useDashboardStore();
  const analytics = getAnalytics();
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    addFinancialRecord({
      type,
      amount: Number(amount),
    });
    setAmount('');
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Finances</h2>
        <p className="text-[#9CA3AF] text-sm mt-1">Track manual deposits and withdrawals</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-sm">
             <p className="text-[#9CA3AF] text-sm font-medium mb-1">Total Capital</p>
             <h3 className="text-3xl font-bold text-white">${analytics.totalCapital.toFixed(2)}</h3>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-white mb-4">Add Transaction</h3>
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1">Type</label>
              <select
                className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-lg px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value as 'deposit'|'withdrawal')}
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-1">Amount (USDC)</label>
              <input
                type="number" min="0" step="0.01" required
                className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-lg px-3 py-2"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-2 rounded-lg transition-colors"
            >
              Add Record
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
           <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden h-full">
            <div className="p-5 border-b border-[#1F2937]">
              <h3 className="text-lg font-bold text-white">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#0B0E14] text-[#9CA3AF]">
                    <th className="py-3 px-5 font-medium">Date</th>
                    <th className="py-3 px-5 font-medium">Type</th>
                    <th className="py-3 px-5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {finances.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-[#9CA3AF]">
                        No financial records found.
                      </td>
                    </tr>
                  ) : (
                    finances.map((rec) => (
                      <tr key={rec.id} className="border-b border-[#1F2937] hover:bg-[#1F2937]/50 transition-colors">
                        <td className="py-4 px-5 text-[#D1D5DB]">
                          {new Date(rec.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${rec.type === 'deposit' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                            {rec.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right font-bold text-white">
                          {rec.type === 'deposit' ? '+' : '-'}${rec.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
