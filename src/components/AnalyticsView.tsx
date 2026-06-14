import { useMemo } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function AnalyticsView() {
  const { history } = useDashboardStore();

  const sessionData = useMemo(() => {
    const sessions: Record<string, { name: string; pnl: number; count: number }> = {
      'New York': { name: 'New York', pnl: 0, count: 0 },
      'London': { name: 'London', pnl: 0, count: 0 },
      'Tokyo': { name: 'Tokyo', pnl: 0, count: 0 },
      'Sydney': { name: 'Sydney', pnl: 0, count: 0 },
      'Unknown': { name: 'Unknown', pnl: 0, count: 0 },
    };

    history.forEach(t => {
      if (sessions[t.session]) {
        sessions[t.session].pnl += t.pnlUsd;
        sessions[t.session].count += 1;
      }
    });

    return Object.values(sessions).filter(s => s.count > 0 || s.name !== 'Unknown');
  }, [history]);

  const bestSession = [...sessionData].sort((a, b) => b.pnl - a.pnl)[0];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Sessions & Analytics</h2>
        <p className="text-[#9CA3AF] text-sm mt-1">Discover your most profitable trading times</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-sm md:col-span-1 space-y-4">
          <h3 className="font-bold text-white border-b border-[#1F2937] pb-3">Session Insights</h3>
          {bestSession && bestSession.count > 0 ? (
            <div>
              <p className="text-[#9CA3AF] text-sm mb-1">Most Profitable Session</p>
              <h4 className="text-2xl font-bold text-[#10B981]">{bestSession.name}</h4>
              <p className="text-sm mt-2 text-white">Total PnL: ${bestSession.pnl.toFixed(2)}</p>
              <p className="text-xs mt-1 text-[#9CA3AF]">Based on {bestSession.count} trades</p>

              <div className="mt-6 p-4 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg">
                <p className="text-sm text-[#3B82F6]">
                  💡 <strong>Tip:</strong> Consider focusing your trading during the <strong>{bestSession.name}</strong> session to maximize your win rate based on historical performance.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[#9CA3AF] text-sm">Not enough data to determine best session yet. Keep trading!</p>
          )}
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-sm md:col-span-2">
          <h3 className="font-bold text-white mb-6 border-b border-[#1F2937] pb-3">PnL by Session</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  cursor={{fill: '#1F2937'}}
                  contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1F2937', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Total PnL']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
