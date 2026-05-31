export type TabType = 'arena' | 'leaderboard' | 'intelligence' | 'vault' | 'history' | 'support';

export interface Trader {
  id: string;
  name: string;
  rank: number;
  logoUrl: string;
  team: 'ASIA' | 'WEST';
  equity: number;
  change24h: number;
  currentComment: string;
  lastActionTime: number;
  ticker?: string;
  intervention?: string;
  bioMetric?: string;
  bondingCurveProgress?: number;
  marketCap?: number;
}

export interface TradeEvent {
  id: string;
  traderName: string;
  traderLogo: string;
  team: 'ASIA' | 'WEST';
  actionText: string;
  type: 'buy' | 'sell' | 'liquidate' | 'profit' | 'info';
  timestamp: string;
  pnl?: number; // positive or negative
}

export interface UserAccount {
  balance: number; // Deposit balance
  rank: string; // operator rank
  supportTickets: Array<{ id: string; subject: string; status: string; date: string }>;
  tradesHistory: TradeEvent[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  searchQueries?: string[];
  searchSources?: Array<{ title: string; uri: string }>;
}
