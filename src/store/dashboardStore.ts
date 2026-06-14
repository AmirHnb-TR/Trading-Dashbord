import { create } from 'zustand';
import { fetchUserPositions, type FlashPosition } from '../services/flashApi';
import type { HistoricalTrade, FinancialRecord, UserSettings } from '../types/extendedDashboard';
import { getTradingSession } from '../utils/sessionLogic';

const DEFAULT_SETTINGS: UserSettings = {
  walletAddress: '6RqgvkvLjbsRT3KoEMNRkwsgPB4ThNe6af6kYVgbwuC4',
  dailyProfitGoal: 100,
  dailyStopLoss: 50,
  initialCapital: 1000,
};

// Safe localStorage wrapper
const getLocalStorage = <T>(key: string, initialValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch {
    return initialValue;
  }
};

const setLocalStorage = <T>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
};

interface Analytics {
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  bestAsset: string;
  totalCapital: number;
  totalTrades: number;
  dailyProfit: number;
  monthlyProfit: number;
}

interface DashboardState {
  settings: UserSettings;
  history: HistoricalTrade[];
  finances: FinancialRecord[];
  openPositions: FlashPosition[];
  loading: boolean;
  error: string | null;

  setSettings: (settings: UserSettings) => void;
  setHistory: (history: HistoricalTrade[]) => void;
  addFinancialRecord: (record: Omit<FinancialRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;

  fetchPositions: () => Promise<void>;

  getAnalytics: () => Analytics;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  settings: getLocalStorage('flash-settings', DEFAULT_SETTINGS),
  history: getLocalStorage('flash-history', []),
  finances: getLocalStorage('flash-finances', []),
  openPositions: [],
  loading: false,
  error: null,

  setSettings: (settings) => {
    setLocalStorage('flash-settings', settings);
    set({ settings });
  },

  setHistory: (history) => {
    setLocalStorage('flash-history', history);
    set({ history });
  },

  addFinancialRecord: (record) => {
    const newRecord: FinancialRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now()
    };
    const newFinances = [newRecord, ...get().finances];
    setLocalStorage('flash-finances', newFinances);
    set({ finances: newFinances });
  },

  clearHistory: () => {
    if(confirm('Are you sure you want to clear all history?')) {
      setLocalStorage('flash-history', []);
      setLocalStorage('flash-finances', []);
      set({ history: [], finances: [] });
    }
  },

  fetchPositions: async () => {
    const { settings, history, setHistory } = get();
    const activeWallet = settings.walletAddress;

    if (!activeWallet) return;

    set({ loading: true });
    try {
      const livePositions = await fetchUserPositions(activeWallet);

      const liveKeys = new Set(livePositions.map(p => p.key));
      const prevOpenPositions = get().openPositions;

      let hasClosedTrades = false;
      let newHistory = [...history];

      prevOpenPositions.forEach(prevPos => {
        if (!liveKeys.has(prevPos.key)) {
          hasClosedTrades = true;
          const closeTime = Date.now();
          const pnlUsd = parseFloat(prevPos.pnlWithFeeUsdUi || '0');
          const closedTrade: HistoricalTrade = {
            id: prevPos.key + '-' + closeTime,
            marketSymbol: prevPos.marketSymbol,
            sideUi: prevPos.sideUi,
            entryPriceUi: prevPos.entryPriceUi,
            closePriceUi: 'Market',
            sizeUsdUi: prevPos.sizeUsdUi,
            pnlUsd: pnlUsd,
            pnlPercentage: parseFloat(prevPos.pnlPercentageWithFee || '0'),
            openTime: closeTime - (3600 * 1000),
            closeTime: closeTime,
            session: getTradingSession(new Date(closeTime)),
          };
          newHistory = [closedTrade, ...newHistory];
        }
      });

      if (hasClosedTrades) {
        setHistory(newHistory);
      }

      set({ openPositions: livePositions, error: null });
    } catch {
      set({ error: 'Failed to fetch from Flash Trade.' });
    } finally {
      set({ loading: false });
    }
  },

  getAnalytics: () => {
    const { openPositions, history, finances, settings } = get();

    let totalPnl = openPositions.reduce((sum, p) => sum + parseFloat(p.pnlWithFeeUsdUi || '0'), 0);
    totalPnl += history.reduce((sum, t) => sum + t.pnlUsd, 0);

    const winningTrades = history.filter(t => t.pnlUsd > 0);
    const losingTrades = history.filter(t => t.pnlUsd <= 0);

    const winRate = history.length > 0 ? (winningTrades.length / history.length) * 100 : 0;

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnlUsd, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnlUsd, 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 999 : 0) : grossProfit / grossLoss;

    const assetProfits: Record<string, number> = {};
    history.forEach(t => {
      assetProfits[t.marketSymbol] = (assetProfits[t.marketSymbol] || 0) + t.pnlUsd;
    });
    const bestAsset = Object.keys(assetProfits).length > 0
      ? Object.entries(assetProfits).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

    const netDeposits = finances.reduce((sum, f) => sum + (f.type === 'deposit' ? f.amount : -f.amount), 0);
    const totalCapital = settings.initialCapital + netDeposits + totalPnl;

    // Calculate daily and monthly PnL
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * oneDayMs;

    const openPnl = openPositions.reduce((sum, p) => sum + parseFloat(p.pnlWithFeeUsdUi || '0'), 0);

    // Daily includes open pnl plus any trades closed within the last 24h
    const dailyProfit = openPnl + history
      .filter(t => now - t.closeTime < oneDayMs)
      .reduce((sum, t) => sum + t.pnlUsd, 0);

    const monthlyProfit = openPnl + history
      .filter(t => now - t.closeTime < thirtyDaysMs)
      .reduce((sum, t) => sum + t.pnlUsd, 0);

    return {
      totalPnl,
      winRate,
      profitFactor,
      bestAsset,
      totalCapital,
      totalTrades: history.length + openPositions.length,
      dailyProfit,
      monthlyProfit
    };
  }
}));
