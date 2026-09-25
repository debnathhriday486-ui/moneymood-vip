import React from 'react';
import { Activity, Volume2, VolumeX, RotateCcw, Send, Sparkles } from 'lucide-react';
import logoImg from '../assets/moneymood_logo.jpg';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetStats: () => void;
  isLiveApi: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onResetStats,
  isLiveApi,
}) => {
  return (
    <header className="border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand identity with user's uploaded MoneyMood logo */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 via-cyan-400 to-purple-400 shadow-lg shadow-purple-500/30 overflow-hidden">
              <img
                src={logoImg}
                alt="MoneyMood Logo"
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/moneymood_logo.jpg';
                }}
              />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-wide text-white flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  𝙈𝙤𝙣𝙚𝙮𝙈𝙤𝙤𝙙.. 🩵
                </span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-widest hidden sm:inline-block">
                VIP TRADER
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-400 font-medium">
                  {isLiveApi ? 'WinGo 30S Live Socket' : '30S Clock Synchronizer'}
                </span>
              </span>
              <span>·</span>
              <span className="text-purple-400 font-bold">TURBO 30S</span>
            </div>
          </div>
        </div>

        {/* Global Controls & JOIN CHANNEL Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* JOIN CHANNEL TELEGRAM CTA */}
          <a
            href="https://t.me/+K5sbUzAUS41lNTJl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 transform active:scale-95 group"
          >
            <Send className="w-3.5 h-3.5 fill-white group-hover:translate-x-0.5 -rotate-12 transition-transform" />
            <span className="font-extrabold whitespace-nowrap">JOIN CHANNEL</span>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </a>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-900 border-purple-500/40 text-cyan-400 hover:border-cyan-400'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Stats */}
          <button
            onClick={onResetStats}
            aria-label="Reset Statistics"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
            title="Reset session statistics"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
