import type { DashboardStats } from '../types/dashboard';
import { ArrowUpCircle, ArrowDownCircle, Activity, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface MetricsGridProps {
  stats: DashboardStats;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  valueColor?: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, valueColor = 'text-nano-text-bright', subtitle }: StatCardProps) => (
  <div className="flex items-start justify-between p-4 bg-nano-dark rounded-lg border border-nano-border">
    <div>
      <p className="text-sm text-nano-text mb-1">{title}</p>
      <p className={clsx("text-xl font-semibold", valueColor)}>{value}</p>
      {subtitle && <p className="text-xs text-nano-text mt-1">{subtitle}</p>}
    </div>
    <div className="p-2 bg-nano-card rounded-md border border-nano-border text-nano-text">
      {icon}
    </div>
  </div>
);

export function MetricsGrid({ stats }: MetricsGridProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-nano-text-bright mb-4 flex items-center gap-2">
        <Activity size={20} className="text-nano-primary" /> Performance Metrics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
         <StatCard 
          title="Daily Profit" 
          value={formatCurrency(stats.dailyProfit)} 
          valueColor={stats.dailyProfit >= 0 ? 'text-nano-green' : 'text-nano-red'}
          icon={<TrendingUp size={18} />} 
         />
         <StatCard 
          title="Monthly Profit" 
          value={formatCurrency(stats.monthlyProfit)} 
          valueColor={stats.monthlyProfit >= 0 ? 'text-nano-green' : 'text-nano-red'}
          icon={<DollarSign size={18} />} 
         />
        
         <StatCard 
          title="Deposits" 
          value={formatCurrency(stats.totalDeposits)} 
          icon={<ArrowUpCircle size={18} className="text-nano-green" />} 
         />
         <StatCard 
          title="Withdrawals" 
          value={formatCurrency(stats.totalWithdrawals)} 
          icon={<ArrowDownCircle size={18} className="text-nano-red" />} 
         />

         <StatCard 
          title="Profit Factor" 
          value={stats.profitFactor.toFixed(2)} 
          valueColor={stats.profitFactor >= 1 ? 'text-nano-green' : 'text-nano-red'}
          icon={<Activity size={18} />} 
         />
         <StatCard 
          title="Best Session" 
          value={stats.bestSession} 
          icon={<Clock size={18} />} 
         />

         <StatCard 
          title="Long Win Rate" 
          value={`${stats.longWinRate.toFixed(1)}%`} 
          valueColor="text-nano-text-bright"
          icon={<TrendingUp size={18} className="text-nano-primary" />} 
         />
         <StatCard 
          title="Short Win Rate" 
          value={`${stats.shortWinRate.toFixed(1)}%`} 
          valueColor="text-nano-text-bright"
          icon={<TrendingDown size={18} className="text-nano-primary" />} 
         />
      </div>
    </div>
  );
}