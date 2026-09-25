import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Send } from 'lucide-react';
import { Header } from './components/Header';
import { LivePredictor } from './components/LivePredictor';
import { LotteryIssue, PredictionAnalysis, PredictionLog, TraderStats } from './types';
import {
  NexaPredictionEngine,
  WinGoApiGateway,
  formatPeriodDisplay,
} from './utils/engine';
import { playSound } from './utils/sound';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Core Gateway & Data State (Pure WinGo 30S)
  const gatewayRef = useRef<WinGoApiGateway | null>(null);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [rawIssues, setRawIssues] = useState<LotteryIssue[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [nextPeriod, setNextPeriod] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [prediction, setPrediction] = useState<PredictionAnalysis | null>(null);

  // Result popup notification
  const [resultAlert, setResultAlert] = useState<{
    show: boolean;
    isWin: boolean;
    level: number;
    period: string;
  }>({
    show: false,
    isWin: true,
    level: 1,
    period: '',
  });

  // Performance Stats
  const [stats, setStats] = useState<TraderStats>({
    wins: 0,
    losses: 0,
    totalBets: 0,
    consecutiveLosses: 0,
    consecutiveWins: 0,
    currentStreak: 0,
    bestWinStreak: 0,
    currentLevel: 1,
    simulatedBalance: 1000,
    simulatedProfit: 0,
  });

  // History Log
  const [history, setHistory] = useState<PredictionLog[]>([]);

  // Track pending prediction for next issue verification
  const pendingRef = useRef<{
    period: string;
    prediction: 'BIG' | 'SMALL';
    level: number;
    confidence: number;
  } | null>(null);

  const lastProcessedIssueRef = useRef<string>('');

  // Initialize 30S Gateway
  useEffect(() => {
    gatewayRef.current = new WinGoApiGateway();
  }, []);

  // Main 1-second Tick Loop (Synchronized to 30-Second Clock)
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const s = now.getSeconds();
      const remaining = 30 - (s % 30);
      const cleanRemaining = remaining === 30 ? 0 : remaining;
      setTimeLeft(cleanRemaining);

      // Sound cue for final 3 seconds
      if (cleanRemaining <= 3 && cleanRemaining > 0) {
        playSound('tick', soundEnabled);
      }

      // Fetch or sync WinGo 30S issues
      if (gatewayRef.current) {
        const { list, isLiveApi: liveStatus } = await gatewayRef.current.fetchLatest();
        setIsLiveApi(liveStatus);

        if (list && list.length > 0) {
          setRawIssues(list);
          const latestIssue = list[0];
          const latestIssueId = latestIssue.issueNumber;

          // Check if a new completed draw arrived
          if (latestIssueId && latestIssueId !== lastProcessedIssueRef.current) {
            // Check pending prediction verification
            if (pendingRef.current && pendingRef.current.period === latestIssueId) {
              const actualSize = latestIssue.size;
              const isWin = pendingRef.current.prediction === actualSize;
              const playedLevel = pendingRef.current.level;

              // Sound & Confetti
              if (isWin) {
                playSound('win', soundEnabled);
                try {
                  confetti({
                    particleCount: 90,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#00e5ff', '#aa00ff', '#ff007f', '#00ff41'],
                  });
                } catch {
                  // Ignore confetti error if any
                }
              } else {
                playSound('loss', soundEnabled);
              }

              // Update stats
              setStats((prev) => {
                const newWins = isWin ? prev.wins + 1 : prev.wins;
                const newLosses = isWin ? prev.losses : prev.losses + 1;
                const newConsecWins = isWin ? prev.consecutiveWins + 1 : 0;
                const newConsecLosses = isWin ? 0 : prev.consecutiveLosses + 1;
                const newBestWin = Math.max(prev.bestWinStreak, newConsecWins);
                const nextLvl: 1 | 2 | 3 = isWin
                  ? 1
                  : (Math.min(3, newConsecLosses + 1) as 1 | 2 | 3);

                // Simulated profit calculation based on Martingale level
                const stake = playedLevel === 1 ? 10 : playedLevel === 2 ? 30 : 90;
                const profitDelta = isWin ? stake * 0.96 : -stake;

                return {
                  ...prev,
                  wins: newWins,
                  losses: newLosses,
                  totalBets: prev.totalBets + 1,
                  consecutiveWins: newConsecWins,
                  consecutiveLosses: newConsecLosses,
                  currentStreak: isWin ? newConsecWins : -newConsecLosses,
                  bestWinStreak: newBestWin,
                  currentLevel: nextLvl,
                  simulatedBalance: Math.round(prev.simulatedBalance + profitDelta),
                  simulatedProfit: Math.round(prev.simulatedProfit + profitDelta),
                };
              });

              // Add log item
              const newLog: PredictionLog = {
                id: `${latestIssueId}-${Date.now()}`,
                period: latestIssueId,
                prediction: pendingRef.current.prediction,
                actualNumber: latestIssue.number,
                actualSize,
                isWin,
                level: playedLevel,
                confidence: pendingRef.current.confidence,
                timestamp: new Date().toLocaleTimeString(),
              };

              setHistory((prev) => [newLog, ...prev.slice(0, 39)]);

              // Trigger Alert Toast
              setResultAlert({
                show: true,
                isWin,
                level: playedLevel,
                period: latestIssueId,
              });
              setTimeout(() => {
                setResultAlert((p) => ({ ...p, show: false }));
              }, 2200);

              pendingRef.current = null;
            }

            lastProcessedIssueRef.current = latestIssueId;
            setCurrentPeriod(latestIssueId);

            // Compute Target Issue (N+1)
            let calculatedNext: string;
            try {
              calculatedNext = (BigInt(latestIssueId) + 1n).toString();
            } catch {
              calculatedNext = String(Number(latestIssueId) + 1);
            }
            setNextPeriod(calculatedNext);

            // Run 8-Factor Nexa Prediction Analysis on latest 20 rounds
            const sample20 = list.slice(0, 20);
            const analysis = NexaPredictionEngine.analyze(sample20, stats.currentLevel);
            setPrediction(analysis);

            // Store pending prediction for next period
            pendingRef.current = {
              period: calculatedNext,
              prediction: analysis.prediction,
              level: stats.currentLevel,
              confidence: analysis.confidence,
            };
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [soundEnabled, stats.currentLevel]);

  const handleResetStats = () => {
    setStats({
      wins: 0,
      losses: 0,
      totalBets: 0,
      consecutiveLosses: 0,
      consecutiveWins: 0,
      currentStreak: 0,
      bestWinStreak: 0,
      currentLevel: 1,
      simulatedBalance: 1000,
      simulatedProfit: 0,
    });
    setHistory([]);
    playSound('alert', soundEnabled);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-cyan-200">
      {/* Top Cyber Navigation Bar */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onResetStats={handleResetStats}
        isLiveApi={isLiveApi}
      />

      {/* Main VIP Predictor Node */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <LivePredictor
          currentPeriod={currentPeriod}
          nextPeriod={nextPeriod}
          timeLeft={timeLeft}
          totalCycleTime={30}
          prediction={prediction}
          stats={stats}
          history={history}
          rawIssues={rawIssues}
          isLiveApi={isLiveApi}
        />
      </main>

      {/* Toast Alert on Result Verification */}
      {resultAlert.show && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              resultAlert.isWin
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 shadow-emerald-500/30'
                : 'bg-rose-950/95 border-rose-500 text-rose-200 shadow-rose-500/30'
            }`}
          >
            {resultAlert.isWin ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400" />
            )}
            <div>
              <div className="text-sm font-black tracking-wide">
                {resultAlert.isWin ? 'WIN! TARGET CLEARED' : 'LOSS! MOVING TO NEXT LEVEL'}
              </div>
              <div className="text-[11px] font-mono opacity-80">
                Period #{formatPeriodDisplay(resultAlert.period)} · L{resultAlert.level}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cyber Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-950/90 py-6 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://t.me/+K5sbUzAUS41lNTJl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-black tracking-wider uppercase text-xs"
          >
            <Send className="w-3.5 h-3.5 fill-cyan-400 -rotate-12" />
            <span>Join 𝙈𝙤𝙣𝙚𝙮𝙈𝙤𝙤𝙙.. 🩵 Telegram</span>
          </a>
          <span>·</span>
          <span className="font-mono text-purple-400">WIN-GO 30S VIP NODE</span>
        </div>
        <p className="max-w-xl mx-auto px-4 text-[11px] text-slate-600">
          Official 𝙈𝙤𝙣𝙚𝙮𝙈𝙤𝙤𝙙.. 🩵 VIP Trader. Continuous statistical analysis model & live draw tracker.
        </p>
      </footer>
    </div>
  );
}
