import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Wallet,
  CheckCircle2,
  XCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';
import { LotteryIssue, PredictionAnalysis, PredictionLog, TraderStats } from '../types';
import { formatPeriodDisplay } from '../utils/engine';
import logoImg from '../assets/moneymood_logo.jpg';

interface LivePredictorProps {
  currentPeriod: string;
  nextPeriod: string;
  timeLeft: number;
  totalCycleTime: number;
  prediction: PredictionAnalysis | null;
  stats: TraderStats;
  history: PredictionLog[];
  rawIssues: LotteryIssue[];
  isLiveApi: boolean;
}

export const LivePredictor: React.FC<LivePredictorProps> = ({
  currentPeriod,
  nextPeriod,
  timeLeft,
  totalCycleTime,
  prediction,
  stats,
  history,
  rawIssues,
  isLiveApi,
}) => {
  const [showFactorDetails, setShowFactorDetails] = useState(false);
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalCycleTime) * 100));

  // Determine level color styling
  const levelBadgeConfig = {
    1: {
      bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
      label: 'LVL 1 (BASE STAKE)',
      dot: 'bg-emerald-400',
    },
    2: {
      bg: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
      label: 'LVL 2 (RECOVERY 3X)',
      dot: 'bg-amber-400',
    },
    3: {
      bg: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
      label: 'LVL 3 (STRIKE 9X)',
      dot: 'bg-rose-400',
    },
  }[stats.currentLevel];

  const winRate =
    stats.totalBets > 0 ? ((stats.wins / stats.totalBets) * 100).toFixed(1) : '100.0';

  const predIsBig = prediction?.prediction === 'BIG';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* VIP Hero Branding Header */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-slate-950 to-slate-900 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-purple-950/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-purple-500 via-cyan-400 to-pink-500 shadow-lg shadow-purple-500/40 overflow-hidden flex-shrink-0">
            <img
              src={logoImg}
              alt="MoneyMood Logo"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/moneymood_logo.jpg';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white">
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  𝙈𝙤𝙣𝙚𝙮𝙈𝙤𝙤𝙙.. 🩵
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>WinGo 30S VIP Autonomous Prediction Node</span>
              <span className="text-slate-500 font-mono hidden sm:inline">· Continuous Auto-Sync</span>
            </p>
          </div>
        </div>

        {/* Telegram Quick Join Pill */}
        <a
          href="https://t.me/+K5sbUzAUS41lNTJl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Send className="w-3.5 h-3.5 fill-white -rotate-12" />
          <span>JOIN VIP TELEGRAM</span>
        </a>
      </div>

      {/* Main Prediction & Countdown Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-5 sm:p-7 shadow-2xl shadow-purple-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Active Issue & Dynamic 30-Second Countdown */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-purple-500/20 rounded-2xl text-center shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              TARGET ISSUE 30S
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mb-4">
              #{formatPeriodDisplay(nextPeriod)}
            </span>

            {/* Circular Countdown Progress Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-300 ${
                    timeLeft <= 5 ? 'stroke-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]' : 'stroke-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                  }`}
                  strokeWidth="8"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-black font-mono tracking-tight ${
                    timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'
                  }`}
                >
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  TIME LEFT
                </span>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-400 font-mono">
              Current Draw: #{formatPeriodDisplay(currentPeriod)}
            </div>
          </div>

          {/* Right Column: Prediction Hero Card */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  AUTONOMOUS FORECAST
                </span>
              </div>

              {/* Martingale Level Tag */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-black ${levelBadgeConfig.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${levelBadgeConfig.dot}`} />
                <span>{levelBadgeConfig.label}</span>
              </div>
            </div>

            {/* Glowing Big / Small Forecast Box */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20 shadow-inner">
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                  PREDICTED SIGNAL
                </span>
                <div
                  className={`text-5xl sm:text-6xl font-black tracking-wider transition-colors duration-300 my-1 ${
                    predIsBig
                      ? 'text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]'
                      : 'text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]'
                  }`}
                >
                  {prediction?.prediction === 'BIG' ? 'BIG' : 'SMALL'}
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {predIsBig ? (
                    <span className="text-amber-300/90 font-mono">Winning Numbers: [ 5, 6, 7, 8, 9 ]</span>
                  ) : (
                    <span className="text-cyan-300/90 font-mono">Winning Numbers: [ 0, 1, 2, 3, 4 ]</span>
                  )}
                </div>
              </div>

              {/* Confidence and Stats metrics */}
              <div className="flex flex-col gap-2.5 w-full sm:w-64">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Model Confidence:</span>
                    <span className="text-cyan-300 font-mono font-bold">
                      {prediction?.confidence ?? 75}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-sky-400 to-cyan-300 rounded-full transition-all duration-500 shadow-md"
                      style={{ width: `${prediction?.confidence ?? 75}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-500 text-[9px] uppercase">BACKTEST HIT</div>
                    <div className="text-cyan-400 font-bold text-sm">
                      {prediction?.backtest ?? 68}%
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-500 text-[9px] uppercase">SCORE SPREAD</div>
                    <div className="text-purple-400 font-bold text-sm">
                      {prediction?.score ?? 0} pts
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Engine Health Line */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="font-mono">
                Sample: Last {prediction?.sample ?? 20} Completed Results
              </span>
              <button
                onClick={() => setShowFactorDetails(!showFactorDetails)}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold text-[11px] cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{showFactorDetails ? 'Hide 8-Factor Math' : 'View 8-Factor Math'}</span>
                {showFactorDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Factor Breakdown */}
        {showFactorDetails && prediction && (
          <div className="mt-6 pt-6 border-t border-purple-500/20 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Real-Time 8-Factor Mathematical Vector Scores
              </span>
              <div className="text-xs font-mono">
                <span className="text-amber-400 font-bold">BIG: {prediction.bigScore} pts</span>
                <span className="text-slate-500 mx-2">vs</span>
                <span className="text-cyan-400 font-bold">SMALL: {prediction.smallScore} pts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {prediction.factors.map((f, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-200">{f.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{f.evidence}</div>
                  </div>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded border ${
                      f.vote === 'BIG'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : f.vote === 'SMALL'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {f.vote}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6 Real-Time Performance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Wins */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">WINS</span>
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{stats.wins}</div>
          <div className="text-[10px] text-slate-500 mt-1">Verified hits</div>
        </div>

        {/* Losses */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 shadow-lg shadow-rose-500/5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">LOSSES</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{stats.losses}</div>
          <div className="text-[10px] text-slate-500 mt-1">Step-ups</div>
        </div>

        {/* Accuracy */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">ACCURACY</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">{winRate}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Cumulative rate</div>
        </div>

        {/* Total Bets */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 shadow-lg shadow-purple-500/5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">ROUNDS</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">{stats.totalBets}</div>
          <div className="text-[10px] text-slate-500 mt-1">30S cycles</div>
        </div>

        {/* Streak */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">STREAK</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              stats.consecutiveWins > 0
                ? 'text-emerald-400'
                : stats.consecutiveLosses > 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {stats.consecutiveWins > 0
              ? `+${stats.consecutiveWins}W`
              : stats.consecutiveLosses > 0
              ? `-${stats.consecutiveLosses}L`
              : '0'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Best: {stats.bestWinStreak}W</div>
        </div>

        {/* Simulated PnL */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">SIM P&L</span>
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              stats.simulatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {stats.simulatedProfit >= 0 ? `+$${stats.simulatedProfit}` : `-$${Math.abs(stats.simulatedProfit)}`}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Virtual return</div>
        </div>
      </div>

      {/* Live WinGo 30S Lottery Draw History */}
      <div className="bg-slate-950/90 border border-purple-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              LIVE WINGO 30S VERIFICATION LOG
            </h3>
            <p className="text-xs text-slate-400">
              Comparing autonomous algorithmic forecast vs actual lottery results
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-400 font-bold">Live Stream Active</span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Clock className="w-6 h-6 mx-auto mb-2 opacity-40 animate-spin text-purple-400" />
            <span>Awaiting next 30-second draw finalization to verify forecast...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-2.5">PERIOD</th>
                  <th className="pb-2.5">DRAW NUMBER</th>
                  <th className="pb-2.5">ACTUAL</th>
                  <th className="pb-2.5">FORECAST</th>
                  <th className="pb-2.5">LEVEL</th>
                  <th className="pb-2.5 text-right">RESULT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {history.map((log) => {
                  const isWin = log.isWin;
                  const num = log.actualNumber;

                  const ballColor =
                    num === 0
                      ? 'bg-gradient-to-tr from-rose-600 to-purple-600 text-white'
                      : num === 5
                      ? 'bg-gradient-to-tr from-emerald-600 to-purple-600 text-white'
                      : [1, 3, 7, 9].includes(num)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white';

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 text-slate-300 font-bold">
                        #{formatPeriodDisplay(log.period)}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs shadow-md ${ballColor}`}
                        >
                          {num}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-bold ${
                            log.actualSize === 'BIG' ? 'text-amber-400' : 'text-cyan-400'
                          }`}
                        >
                          {log.actualSize}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-bold ${
                            log.prediction === 'BIG' ? 'text-amber-400' : 'text-cyan-400'
                          }`}
                        >
                          {log.prediction}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 font-bold">L{log.level}</td>
                      <td className="py-2.5 text-right">
                        {isWin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> WIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> LOSS
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Color Legend */}
        <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Color Index:</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Green [1,3,7,9]
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Red [2,4,6,8]
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Violet [0,5]
            </span>
          </div>

          <div className="text-slate-400">
            BIG = [5, 6, 7, 8, 9] · SMALL = [0, 1, 2, 3, 4]
          </div>
        </div>
      </div>

      {/* Prominent Telegram Join Banner at Bottom */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-purple-900/40 via-slate-900 to-cyan-900/40 text-center space-y-3">
        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
          <span>JOIN THE OFFICIAL 𝙈𝙤𝙣𝙚𝙮𝙈𝙤𝙤𝙙.. 🩵 COMMUNITY</span>
        </h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Get live alerts, strategy updates, and direct signals. Click below to join our Telegram channel immediately.
        </p>
        <div>
          <a
            href="https://t.me/+K5sbUzAUS41lNTJl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4 fill-slate-950 -rotate-12" />
            <span>JOIN TELEGRAM CHANNEL NOW</span>
          </a>
        </div>
      </div>
    </div>
  );
};
