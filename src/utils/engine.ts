import { FactorScore, LotteryIssue, PredictionAnalysis } from '../types';

export function getNumberColor(num: number): LotteryIssue['color'] {
  if (num === 0) return 'violet-red';
  if (num === 5) return 'violet-green';
  if ([1, 3, 7, 9].includes(num)) return 'green';
  return 'red';
}

export function getNumberSize(num: number): 'BIG' | 'SMALL' {
  return num >= 5 ? 'BIG' : 'SMALL';
}

export function formatPeriodDisplay(period: string): string {
  if (!period) return '----';
  return period.length > 5 ? period.slice(-5) : period;
}

// ==========================================================
// MONEYMOOD VIP 30S — 8-FACTOR ENSEMBLE PREDICTION ENGINE
// ==========================================================
export const NexaPredictionEngine = {
  analyze(historyList: LotteryIssue[], level: number = 1): PredictionAnalysis {
    const rows = Array.isArray(historyList) ? historyList : [];
    const nums = rows
      .map((x) => Number.parseInt(String(x?.number), 10))
      .filter((n) => Number.isFinite(n) && n >= 0 && n <= 9);

    if (nums.length < 10) {
      return {
        prediction: 'SMALL',
        confidence: 50,
        score: 0,
        sample: nums.length,
        backtest: 50,
        streak: 0,
        bigScore: 0,
        smallScore: 0,
        factors: [],
        ma5: 0.5,
        ma10: 0.5,
        ma20: 0.5,
        patternVote3: 0,
        patternVote4: 0,
      };
    }

    const bits: number[] = nums.map((n) => (n >= 5 ? 1 : 0));
    const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0.5);
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    const r10 = bits.slice(0, 10);
    const r15 = bits.slice(0, 15);
    const r20 = bits.slice(0, 20);
    const ma5 = avg(bits.slice(0, 5));
    const ma10 = avg(r10);
    const ma20 = avg(r20);

    let bigScore = 0;
    let smallScore = 0;
    const factors: FactorScore[] = [];

    // Helper to log factor
    const recordFactor = (
      name: string,
      weight: number,
      vote: 'BIG' | 'SMALL' | 'NEUTRAL',
      bPts: number,
      sPts: number,
      description: string,
      evidence: string
    ) => {
      bigScore += bPts;
      smallScore += sPts;
      factors.push({
        name,
        weight,
        vote,
        scoreBig: bPts,
        scoreSmall: sPts,
        description,
        evidence,
      });
    };

    // Factor 1: Multi-window Trend (MA5 vs MA10 vs MA20)
    let f1B = 0;
    let f1S = 0;
    let f1Vote: 'BIG' | 'SMALL' | 'NEUTRAL' = 'NEUTRAL';
    if (ma5 > ma10) f1B += 18;
    else if (ma5 < ma10) f1S += 18;
    if (ma10 > ma20) f1B += 14;
    else if (ma10 < ma20) f1S += 14;
    if (f1B > f1S) f1Vote = 'BIG';
    else if (f1S > f1B) f1Vote = 'SMALL';

    recordFactor(
      'Multi-Window Moving Average',
      32,
      f1Vote,
      f1B,
      f1S,
      `Compares short-term (MA5: ${(ma5 * 100).toFixed(0)}%) vs medium (MA10: ${(ma10 * 100).toFixed(0)}%) vs long-term (MA20: ${(ma20 * 100).toFixed(0)}%).`,
      `MA5=${(ma5 * 10).toFixed(1)}/10, MA10=${(ma10 * 10).toFixed(1)}/10, MA20=${(ma20 * 10).toFixed(1)}/10`
    );

    // Factor 2: Mean Reversion (Extreme divergence in 10/20 samples)
    const big10 = r10.reduce<number>((a, b) => a + b, 0);
    const big20 = r20.reduce<number>((a, b) => a + b, 0);
    let f2B = 0;
    let f2S = 0;
    let f2Vote: 'BIG' | 'SMALL' | 'NEUTRAL' = 'NEUTRAL';

    if (big10 >= 8) {
      f2S += 22;
      f2Vote = 'SMALL';
    } else if (big10 <= 2) {
      f2B += 22;
      f2Vote = 'BIG';
    }
    if (big20 >= 16) {
      f2S += 14;
      f2Vote = 'SMALL';
    } else if (big20 <= 4) {
      f2B += 14;
      f2Vote = 'BIG';
    }

    recordFactor(
      'Mean Reversion (Overextension)',
      36,
      f2Vote,
      f2B,
      f2S,
      `Statistical pressure when one side dominates 10 or 20 draws (e.g. ${big10}/10 Bigs).`,
      `Bigs in last 10: ${big10}/10, Bigs in last 20: ${big20}/20`
    );

    // Factor 3: Streak Momentum & Resistance
    let streak = 1;
    for (let i = 1; i < bits.length; i++) {
      if (bits[i] === bits[0]) streak++;
      else break;
    }
    let f3B = 0;
    let f3S = 0;
    let f3Vote: 'BIG' | 'SMALL' | 'NEUTRAL' = 'NEUTRAL';

    if (streak >= 3) {
      if (bits[0] === 1) {
        f3S += 18;
        f3Vote = 'SMALL';
      } else {
        f3B += 18;
        f3Vote = 'BIG';
      }
    } else if (streak === 2) {
      if (bits[0] === 1) {
        f3S += 7;
        f3Vote = 'SMALL';
      } else {
        f3B += 7;
        f3Vote = 'BIG';
      }
    }

    recordFactor(
      'Streak Momentum Resistance',
      18,
      f3Vote,
      f3B,
      f3S,
      `Current active streak is ${streak}x consecutive ${bits[0] === 1 ? 'BIG' : 'SMALL'}.`,
      `Current Streak: ${streak}x (${bits[0] === 1 ? 'BIG' : 'SMALL'})`
    );

    // Factor 4: Alternation / Chop Detector
    let transitions = 0;
    const chopWindow = Math.min(bits.length, 12);
    for (let i = 1; i < chopWindow; i++) {
      if (bits[i] !== bits[i - 1]) transitions++;
    }
    let f4B = 0;
    let f4S = 0;
    let f4Vote: 'BIG' | 'SMALL' | 'NEUTRAL' = 'NEUTRAL';

    if (transitions >= 9) {
      if (bits[0] === 1) {
        f4S += 13;
        f4Vote = 'SMALL';
      } else {
        f4B += 13;
        f4Vote = 'BIG';
      }
    } else if (transitions <= 2) {
      if (bits[0] === 1) {
        f4B += 6;
        f4Vote = 'BIG';
      } else {
        f4S += 6;
        f4Vote = 'SMALL';
      }
    }

    recordFactor(
      'Market Alternation (Zigzag)',
      13,
      f4Vote,
      f4B,
      f4S,
      `Calculates transition frequency (${transitions}/${chopWindow - 1}).`,
      `Transitions: ${transitions} in last ${chopWindow} rounds`
    );

    // Factor 5: N-Gram Pattern Voting (3-bit and 4-bit)
    const patternVote = (len: number) => {
      if (bits.length < len + 4) return 0;
      const pattern = bits.slice(0, len).join('');
      let b = 0,
        s = 0,
        total = 0;
      for (let i = len; i < bits.length - 1; i++) {
        if (bits.slice(i - len, i).join('') === pattern) {
          total++;
          if (bits[i] === 1) b++;
          else s++;
        }
      }
      if (total < 2) return 0;
      return clamp((b - s) / total, -1, 1);
    };

    const p3 = patternVote(3);
    const p4 = patternVote(4);
    let f5B = 0;
    let f5S = 0;
    if (p3 > 0) f5B += 24 * p3;
    else if (p3 < 0) f5S += 24 * -p3;
    if (p4 > 0) f5B += 20 * p4;
    else if (p4 < 0) f5S += 20 * -p4;

    const f5Vote = f5B > f5S ? 'BIG' : f5S > f5B ? 'SMALL' : 'NEUTRAL';
    recordFactor(
      'N-Gram Historical Pattern Match',
      44,
      f5Vote,
      Math.round(f5B),
      Math.round(f5S),
      `Matches latest 3-bit and 4-bit history sequences to determine empirical outcomes.`,
      `Pattern 3-bit: ${(p3 * 100).toFixed(0)}%, 4-bit: ${(p4 * 100).toFixed(0)}%`
    );

    // Factor 6: Digit-Frequency Pressure
    const n20 = nums.slice(0, 20);
    const high = n20.filter((n) => n >= 7).length;
    const low = n20.filter((n) => n <= 2).length;
    let f6B = 0;
    let f6S = 0;
    let f6Vote: 'BIG' | 'SMALL' | 'NEUTRAL' = 'NEUTRAL';

    if (high >= 9) {
      f6S += 9;
      f6Vote = 'SMALL';
    }
    if (low >= 9) {
      f6B += 9;
      f6Vote = 'BIG';
    }

    recordFactor(
      'Extreme Digit Frequency',
      18,
      f6Vote,
      f6B,
      f6S,
      `Evaluates clustering of extreme numbers (0,1,2 vs 7,8,9) in last 20 results.`,
      `High (7-9): ${high}/20, Low (0-2): ${low}/20`
    );

    // Factor 7: Level-Specific Multiplier / Weight Shift
    let f7B = 0;
    let f7S = 0;
    if (level === 2) {
      if (big10 >= 7) f7S += 10;
      if (big10 <= 3) f7B += 10;
    }
    if (level === 3) {
      if (big20 >= 15) f7S += 14;
      if (big20 <= 5) f7B += 14;
      if (streak >= 4) {
        if (bits[0] === 1) f7S += 12;
        else f7B += 12;
      }
    }
    const f7Vote = f7B > f7S ? 'BIG' : f7S > f7B ? 'SMALL' : 'NEUTRAL';
    recordFactor(
      `Level ${level} Multiplier Calibration`,
      26,
      f7Vote,
      f7B,
      f7S,
      `Modifies risk sensitivity on Martingale Level ${level}.`,
      `Active Level: ${level} (Multiplier applied)`
    );

    // Factor 8: Walk-Forward Mini Backtest
    let btBig = 0,
      btSmall = 0,
      btN = 0;
    const evaluateCandidate = (candidate: number) => {
      let hit = 0,
        total = 0;
      for (let i = 0; i < Math.min(12, bits.length - 5); i++) {
        const actual = bits[i];
        const prev = bits.slice(i + 1, Math.min(bits.length, i + 1 + 10));
        if (prev.length < 6) continue;
        const r = avg(prev);
        const c = candidate === 1 ? r >= 0.5 : r < 0.5;
        if (c === (actual === candidate)) hit++;
        total++;
      }
      return total ? hit / total : 0.5;
    };

    btBig = evaluateCandidate(1);
    btSmall = evaluateCandidate(0);
    btN = Math.max(btBig, btSmall);
    let f8B = 0;
    let f8S = 0;

    if (btN > 0.58) {
      if (btBig > btSmall) f8B += 16 * (btBig - 0.5) * 2;
      else if (btSmall > btBig) f8S += 16 * (btSmall - 0.5) * 2;
    }
    const f8Vote = f8B > f8S ? 'BIG' : f8S > f8B ? 'SMALL' : 'NEUTRAL';

    recordFactor(
      'Walk-Forward Real-time Backtest',
      32,
      f8Vote,
      Math.round(f8B),
      Math.round(f8S),
      `Dynamically evaluates recent past 12 rounds to award bonus weight to the model with higher empirical accuracy.`,
      `Historical Hit Rate: ${(btN * 100).toFixed(0)}% (Big: ${(btBig * 100).toFixed(0)}%, Small: ${(btSmall * 100).toFixed(0)}%)`
    );

    const diff = bigScore - smallScore;
    const totalWeight = Math.max(1, Math.abs(bigScore) + Math.abs(smallScore));
    const confidence = clamp(Math.abs(diff) / totalWeight, 0.45, 0.95);
    let prediction: 'BIG' | 'SMALL' = diff >= 0 ? 'BIG' : 'SMALL';

    // Deterministic tie-breaker
    if (Math.abs(diff) < 4) {
      if (p4 !== 0) prediction = p4 > 0 ? 'BIG' : 'SMALL';
      else if (p3 !== 0) prediction = p3 > 0 ? 'BIG' : 'SMALL';
      else prediction = ma10 >= 0.5 ? 'SMALL' : 'BIG';
    }

    return {
      prediction,
      confidence: Math.round(confidence * 100),
      score: Math.round(diff * 10) / 10,
      sample: Math.min(20, nums.length),
      backtest: Math.round(btN * 100),
      streak,
      bigScore: Math.round(bigScore * 10) / 10,
      smallScore: Math.round(smallScore * 10) / 10,
      factors,
      ma5,
      ma10,
      ma20,
      patternVote3: p3,
      patternVote4: p4,
    };
  },
};

// ==========================================================
// RESILIENT WINGO 30S API GATEWAY
// ==========================================================
export class WinGoApiGateway {
  private cache: LotteryIssue[] = [];
  private lastIssue: string = '';
  private busy: boolean = false;

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory() {
    const now = new Date();
    const cycleSec = 30; // 30S Turbo mode only
    const currentPeriodNum = this.getCurrentPeriodNumber(now, cycleSec);

    const initial: LotteryIssue[] = [];
    for (let i = 0; i < 30; i++) {
      const issueNum = String(currentPeriodNum - i);
      const pseudoRand = (Math.sin(Number(issueNum.slice(-5)) * 12.9898) * 43758.5453) % 1;
      const num = Math.floor(Math.abs(pseudoRand) * 10);
      initial.push({
        issueNumber: issueNum,
        number: num,
        size: getNumberSize(num),
        color: getNumberColor(num),
        time: new Date(now.getTime() - i * cycleSec * 1000).toISOString(),
      });
    }
    this.cache = initial;
    this.lastIssue = initial[0].issueNumber;
  }

  private getCurrentPeriodNumber(d: Date, cycleSec: number = 30): number {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const midnight = new Date(Date.UTC(y, d.getUTCMonth(), d.getUTCDate())).getTime();
    const currentSecs = Math.floor((d.getTime() - midnight) / 1000);
    const index = Math.floor(currentSecs / cycleSec);
    return Number(`${y}${m}${day}${String(index).padStart(4, '0')}`);
  }

  async fetchLatest(): Promise<{ list: LotteryIssue[]; isLiveApi: boolean }> {
    if (this.busy && this.cache.length) {
      return { list: this.cache, isLiveApi: false };
    }
    this.busy = true;

    const endpoint = 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?no=0&size=100';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${endpoint}&t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const raw = Array.isArray(json?.data?.list) ? json.data.list : [];

      const clean: LotteryIssue[] = raw
        .map((x: any) => {
          const num = Number.parseInt(String(x?.number), 10);
          return {
            issueNumber: String(x?.issueNumber ?? x?.issue ?? ''),
            number: num,
            time: x?.time ?? x?.openTime ?? '',
            size: getNumberSize(num),
            color: getNumberColor(num),
          };
        })
        .filter((x: LotteryIssue) => x.issueNumber && Number.isFinite(x.number) && x.number >= 0 && x.number <= 9);

      if (clean.length > 0) {
        const seen = new Set();
        const unique = clean.filter((x) => {
          if (seen.has(x.issueNumber)) return false;
          seen.add(x.issueNumber);
          return true;
        });

        this.cache = unique;
        this.lastIssue = unique[0].issueNumber;
        this.busy = false;
        return { list: unique, isLiveApi: true };
      }
    } catch {
      // Fallback to clock generation
    }

    this.busy = false;
    const now = new Date();
    const cycleSec = 30;
    const activeIssueNum = String(this.getCurrentPeriodNumber(now, cycleSec));

    if (this.cache.length && this.cache[0].issueNumber !== activeIssueNum) {
      const seed = Math.abs(Math.sin(Number(activeIssueNum.slice(-6))) * 10000) % 10;
      const num = Math.floor(seed);
      const newIssue: LotteryIssue = {
        issueNumber: activeIssueNum,
        number: num,
        size: getNumberSize(num),
        color: getNumberColor(num),
        time: now.toISOString(),
      };
      this.cache = [newIssue, ...this.cache.slice(0, 49)];
      this.lastIssue = activeIssueNum;
    }

    return { list: this.cache, isLiveApi: false };
  }
}
