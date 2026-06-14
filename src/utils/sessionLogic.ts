import type { TradeSession } from '../types/extendedDashboard';

// Simplistic session logic based on UTC hour.
export function getTradingSession(date: Date): TradeSession {
  const hour = date.getUTCHours();

  if (hour >= 13 && hour < 22) return 'New York';
  if (hour >= 8 && hour < 16) return 'London';
  if (hour >= 0 && hour < 9) return 'Tokyo';
  if (hour >= 22 || hour < 7) return 'Sydney';

  return 'Unknown';
}
