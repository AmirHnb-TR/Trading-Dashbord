
import type { Trade } from '../types/dashboard';
import { History } from 'lucide-react';
import clsx from 'clsx';

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-nano-text-bright mb-4 flex items-center gap-2">
        <History size={20} className="text-nano-primary" /> Recent Trades
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-nano-text uppercase bg-nano-dark border-b border-nano-border">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Pair</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Entry</th>
              <th className="px-4 py-3">Exit</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3 text-right rounded-tr-lg">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 5).map((trade, index) => (
              <tr 
                key={trade.id} 
                className={clsx(
                  "border-b border-nano-border hover:bg-nano-dark transition-colors",
                  index === Math.min(trades.length, 5) - 1 ? "border-b-0" : ""
                )}
              >
                <td className="px-4 py-3 font-medium text-nano-text-bright">{trade.pair}</td>
                <td className="px-4 py-3">
                  <span className={clsx(
                    "px-2 py-1 text-xs rounded-full font-medium",
                    trade.type === 'LONG' ? "bg-nano-green/10 text-nano-green" : "bg-nano-red/10 text-nano-red"
                  )}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-4 py-3">{trade.entryPrice}</td>
                <td className="px-4 py-3">{trade.exitPrice}</td>
                <td className="px-4 py-3 text-nano-text">{trade.session}</td>
                <td className={clsx(
                  "px-4 py-3 text-right font-semibold",
                  trade.profit > 0 ? "text-nano-green" : "text-nano-red"
                )}>
                  {trade.profit > 0 ? '+' : ''}{formatCurrency(trade.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trades.length === 0 && (
          <div className="text-center py-6 text-nano-text">No trades recorded yet.</div>
        )}
      </div>
    </div>
  );
}
