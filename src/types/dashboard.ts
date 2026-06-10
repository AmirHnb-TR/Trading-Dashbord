export type TradeType = 'LONG' | 'SHORT';
export type TradeSession = 'New York' | 'London' | 'Tokyo' | 'Sydney' | 'Other';

export interface Trade {
  id: string;
  pair: string;
  type: TradeType;
  entryPrice: number;
  exitPrice: number;
  amount: number;
  profit: number; // positive for win, negative for loss
  date: string;
  session: TradeSession;
}

export interface DashboardStats {
  totalCapital: number;
  dailyProfit: number;
  monthlyProfit: number;
  totalDeposits: number;
  totalWithdrawals: number;
  profitFactor: number;
  longWinRate: number;
  shortWinRate: number;
  bestSession: TradeSession;
}

export interface ChartDataPoint {
  date: string;
  profit: number;
  capital: number;
}
