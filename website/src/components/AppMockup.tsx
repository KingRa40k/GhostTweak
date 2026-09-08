'use client';

import React, { useState } from 'react';
import { 
  Zap, RotateCw, Monitor, Cpu, HardDrive, Shield, 
  Trash2, Sliders, Crosshair, History, Settings, Minus, 
  Square, X, Check, Flame, Ghost, Crown, Activity
} from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '@/lib/themeContext';

export default function AppMockup() {
  const { activeTheme, setTheme } = useTheme();
  const [ramUsed, setRamUsed] = useState(68);
  const [isPurging, setIsPurging] = useState(false);
  const [purgedNotice, setPurgedNotice] = useState<string | null>(null);
  const [tweaksApplied, setTweaksApplied] = useState(8);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tweaks' | 'profiles'>('dashboard');

  const handlePurgeRam = () => {
    if (isPurging) return;
    setIsPurging(true);

    setTimeout(() => {
      setRamUsed(24);
      setIsPurging(false);
      setPurgedNotice('Освобождено 14.1 ГБ кэша памяти');
      setTimeout(() => setPurgedNotice(null), 4000);
    }, 600);
  };

  const handleOptimizeAll = () => {
    setTweaksApplied(10);
    handlePurgeRam();
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto group">
      
      {/* Subtle background ambient */}
      <div 
        className="absolute -inset-1 rounded-3xl opacity-20 blur-2xl transition-all duration-700 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${activeTheme.hex} 0%, transparent 70%)` }}
      />

      {/* Frame */}
      <div className="relative titanium-card border-white/[0.12] rounded-2xl overflow-hidden shadow-2xl bg-obsidian-950/95">
        
        {/* TitleBar */}
        <div className="h-10 bg-obsidian-900/90 border-b border-white/[0.08] px-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full transition-colors shadow-sm"
                style={{ backgroundColor: activeTheme.hex }}
              />
              <span className="font-sans font-extrabold text-xs text-white tracking-tight">GhostTweak</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline-block">v1.0.0</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-400">
            <Minus size={13} className="hover:text-white cursor-default" />
            <Square size={11} className="hover:text-white cursor-default" />
            <X size={13} className="hover:text-rose-400 cursor-default" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row h-auto min-h-[460px]">
          
          {/* Sidebar */}
          <div className="w-full md:w-52 bg-obsidian-900/50 border-b md:border-b-0 md:border-r border-white/[0.06] p-3 flex flex-col justify-between shrink-0">
            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {[
                { id: 'dashboard', label: 'Панель', icon: Activity },
                { id: 'tweaks', label: 'Твики реестра', icon: Sliders },
                { id: 'profiles', label: 'Профили', icon: Crosshair },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-sm' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon size={14} style={{ color: isActive ? activeTheme.hex : undefined }} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Operator info */}
            <div className="hidden md:flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center border"
                style={{ borderColor: activeTheme.border, backgroundColor: activeTheme.bgSubtle }}
              >
                <Ghost size={14} style={{ color: activeTheme.hex }} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-white leading-tight">Ghost-1</span>
                <span className="text-[9px] font-mono text-emerald-400">Лицензия активна</span>
              </div>
            </div>
          </div>

          {/* Center Workspace */}
          <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-5 bg-obsidian-950">
            
            {/* Top Stat Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Текущий режим
                </span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Esports Competitive
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-right font-mono">
                  <span className="text-[9px] text-zinc-500 block">Frame Time</span>
                  <span className="text-xs font-bold text-emerald-400">5.56 ms</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-right font-mono">
                  <span className="text-[9px] text-zinc-500 block">Таймер</span>
                  <span className="text-xs font-bold" style={{ color: activeTheme.hex }}>0.500 ms</span>
                </div>
              </div>
            </div>

            {/* 3 Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Trash2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-mono">14.1 ГБ</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Кэш и Temp</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Shield size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-mono">{tweaksApplied} / 10</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Твики реестра</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-mono">
                    {tweaksApplied === 10 ? '98%' : '78%'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Оптимизация</div>
                </div>
              </div>
            </div>

            {/* Interactive Memory Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white/[0.04] text-white">
                    <HardDrive size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Память (RAM) Standby Purge</div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      Использовано: {ramUsed}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePurgeRam}
                    disabled={isPurging}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.25] text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <RotateCw size={12} className={isPurging ? "animate-spin text-accent" : "text-zinc-400"} />
                    <span>{isPurging ? 'Сброс...' : 'Освободить RAM'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-obsidian-950 rounded-full overflow-hidden border border-white/[0.06] relative">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${ramUsed}%`,
                    backgroundColor: ramUsed > 50 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>

              {purgedNotice && (
                <div className="text-[11px] font-mono text-emerald-400 animate-fade-in">
                  ✓ {purgedNotice}
                </div>
              )}
            </div>

            {/* Main Action Button */}
            <button
              onClick={handleOptimizeAll}
              className="w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              style={{
                backgroundColor: activeTheme.hex,
                color: '#060708',
              }}
            >
              <Zap size={14} />
              <span>Применить рекомендованные настройки</span>
            </button>

            {/* Hardware Info Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
                <Cpu size={14} style={{ color: activeTheme.hex }} />
                <div className="overflow-hidden">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">Процессор</div>
                  <div className="text-xs font-semibold text-white truncate">Intel Core i5-13600K</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
                <Monitor size={14} style={{ color: activeTheme.hex }} />
                <div className="overflow-hidden">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">Видеокарта & Дисплей</div>
                  <div className="text-xs font-semibold text-white truncate">
                    RTX 4070 SUPER • 3440x1440 @ 180Hz
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Theme Palette Bar */}
        <div className="bg-obsidian-900/90 border-t border-white/[0.06] p-3 px-5 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Цветовая тема:
            </span>
            <span className="text-xs font-bold text-white">
              {activeTheme.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
              const theme = THEMES[tId];
              const isSelected = activeTheme.id === tId;
              return (
                <button
                  key={tId}
                  onClick={() => setTheme(tId)}
                  title={theme.name}
                  className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-white scale-110 border-white' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: theme.hex }}
                >
                  {isSelected && <Check size={11} className="text-black stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
