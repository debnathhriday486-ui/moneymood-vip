export interface LotteryIssue {
  issueNumber: string;
  number: number;
  time?: string;
  size: 'BIG' | 'SMALL';
  color: 'green' | 'red' | 'violet' | 'violet-red' | 'violet-green';
}

export interface FactorScore {
  name: string;
  weight: number;
  vote: 'BIG' | 'SMALL' | 'NEUTRAL';
  scoreBig: number;
  scoreSmall: number;
  description: string;
  evidence: string;
}

export interface PredictionAnalysis {
  prediction: 'BIG' | 'SMALL';
  confidence: number;
  score: number;
  sample: number;
  backtest: number;
  streak: number;
  bigScore: number;
  smallScore: number;
  factors: FactorScore[];
  ma5: number;
  ma10: number;
  ma20: number;
  patternVote3: number;
  patternVote4: number;
}

export interface PredictionLog {
  id: string;
  period: string;
  prediction: 'BIG' | 'SMALL';
  actualNumber: number;
  actualSize: 'BIG' | 'SMALL';
  isWin: boolean;
  level: number;
  confidence: number;
  timestamp: string;
}

export interface TraderStats {
  wins: number;
  losses: number;
  totalBets: number;
  consecutiveLosses: number;
  consecutiveWins: number;
  currentStreak: number;
  bestWinStreak: number;
  currentLevel: 1 | 2 | 3;
  simulatedBalance: number;
  simulatedProfit: number;
}
