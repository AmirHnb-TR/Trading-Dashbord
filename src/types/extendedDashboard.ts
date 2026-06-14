export type TradeSession = 'New York' | 'London' | 'Tokyo' | 'Sydney' | 'Unknown';

export interface HistoricalTrade {
  id: string; // The position key
  marketSymbol: string;
  sideUi: string;
  entryPriceUi: string;
  closePriceUi: string;
  sizeUsdUi: string;
  pnlUsd: number;
  pnlPercentage: number;
  openTime: number; // Unix timestamp
  closeTime: number; // Unix timestamp
  session: TradeSession;
}

export interface FinancialRecord {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  timestamp: number;
  note?: string;
}

export interface UserSettings {
  walletAddress: string;
  dailyProfitGoal: number;
  dailyStopLoss: number;
  initialCapital: number;
}
