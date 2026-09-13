'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Minus, 
  Square, 
  X, 
  RotateCw, 
  Flame, 
  CheckCircle2, 
  Layers, 
  Wifi, 
  HardDrive,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

type CalibratorMode = 'competitive' | 'stream' | 'native';

interface ModeTelemetry {
  id: CalibratorMode;
  name: string;
  nameRu: string;
  timerMs: string;
  dpcMicroseconds: number;
  dpcJitter: string;
  frameP99: string;
  standbyState: string;
  standbyStateRu: string;
  coreAffinity: string;
  qosState: string;
  wavePoints: number[];
  accentColor: string;
}

const MODES: Record<CalibratorMode, ModeTelemetry> = {
  competitive: {
    id: 'competitive',
    name: 'Competitive (Esports)',
    nameRu: 'Киберспорт (Match Turbo)',
    timerMs: '0.500 ms',
    dpcMicroseconds: 42,
    dpcJitter: '±0.03 ms',
    frameP99: '0.41 ms',
    standbyState: '0 MB (Purged)',
    standbyStateRu: '0 МБ (Кэш выгружен)',
    coreAffinity: '16/16 Unparked (100%)',
    qosState: 'Realtime IFEO Lock',
    wavePoints: [42, 44, 41, 45, 42, 43, 41, 42, 44, 43, 42, 41, 43, 42, 42, 44, 41, 43, 42, 42],
    accentColor: '#10b981', // emerald
  },
  stream: {
    id: 'stream',
    name: 'Studio & Stream',
    nameRu: 'Стриминг и Студия',
    timerMs: '1.000 ms',
    dpcMicroseconds: 88,
    dpcJitter: '±0.12 ms',
    frameP99: '0.84 ms',
    standbyState: '420 MB (Buffered)',
    standbyStateRu: '420 МБ (OBS Buffer)',
    coreAffinity: '14/16 Dedicated OBS',
    qosState: 'DSCP 46 High Priority',
    wavePoints: [85, 88, 92, 86, 94, 88, 86, 91, 88, 89, 93, 87, 89, 88, 92, 88, 86, 90, 88, 87],
    accentColor: '#6366f1', // indigo
  },
  native: {
    id: 'native',
    name: 'Native Windows',
    nameRu: 'Штатный Windows 11',
    timerMs: '15.625 ms',
    dpcMicroseconds: 2450,
    dpcJitter: '±4.80 ms',
    frameP99: '3.80 ms',
    standbyState: '14 820 MB (Fragmented)',
    standbyStateRu: '14 820 МБ (Фрагментирован)',
    coreAffinity: 'Dynamic Core Parking',
    qosState: 'Standard Best Effort',
    wavePoints: [450, 1200, 340, 2450, 480, 1800, 310, 890, 3400, 620, 1500, 410, 2200, 520, 1900, 780, 2800, 390, 1600, 450],
    accentColor: '#f59e0b', // amber
  },
};

export default function AppMockup() {
  const { lang } = useI18n();
  const isEn = lang === 'en';

  const [activeMode, setActiveMode] = useState<CalibratorMode>('competitive');
  const [isPurging, setIsPurging] = useState(false);
  const [ramValue, setRamValue] = useState(0);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [liveTicks, setLiveTicks] = useState(0);

  const current = MODES[activeMode];

  // Subtle real-time telemetry pulse tick
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTicks((t) => (t + 1) % 1000);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handlePurgeRam = () => {
    if (isPurging) return;
    setIsPurging(true);
    setRamValue(14800);

    setTimeout(() => {
      setRamValue(0);
      setIsPurging(false);
      setActionNotice(isEn ? 'Standby List purged via NtSetSystemInformation (0 KB)' : 'Кэш памяти сброшен через NtSetSystemInformation (0 КБ)');
      setTimeout(() => setActionNotice(null), 3500);
    }, 700);
  };

  const handleEngageTurbo = () => {
    setActiveMode('competitive');
    setActionNotice(isEn ? '0.500 ms Hardware Clock engaged • DPC Latency minimized' : 'Таймер 0.500 мс зафиксирован • DPC задержки минимизированы');
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto font-sans">
      
      {/* Subtle Dark Industrial Ambient */}
      <div 
        className="absolute -inset-2 rounded-3xl opacity-30 blur-3xl pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, ${current.accentColor}20 0%, transparent 70%)`
        }}
      />

      {/* Main Window Frame */}
      <div className="relative rounded-2xl border border-white/[0.1] bg-zinc-950/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden backdrop-blur-xl">
        
        {/* Windows 11 Native Fluent Titlebar */}
        <div className="h-11 bg-zinc-900/80 border-b border-white/[0.08] px-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full transition-colors duration-500 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: current.accentColor, color: current.accentColor }}
              />
              <span className="font-mono text-xs font-bold text-white tracking-tight">
                GhostTweak.exe
              </span>
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline-block">
                [PID: 4180 • 4.8 MB • x86_64]
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-400">
                NtSetTimerResolution: <span className="text-white font-semibold">{current.timerMs}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:inline-block">
              WinAPI Native
            </span>
            <div className="flex items-center gap-3">
              <Minus size={13} className="hover:text-white cursor-default" />
              <Square size={11} className="hover:text-white cursor-default" />
              <X size={13} className="hover:text-rose-400 cursor-default" />
            </div>
          </div>
        </div>

        {/* Action Notice Toast */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center gap-2.5 text-emerald-400 text-xs font-mono select-none"
            >
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{actionNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        <div className="p-5 sm:p-7 flex flex-col gap-6">
          
          {/* Top Bar: Mode Switcher & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-zinc-400" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  {isEn ? 'Latency Mode Calibration' : 'Режим калибровки ядра'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isEn ? current.name : current.nameRu}
              </h3>
            </div>

            {/* Interactive Mode Pills */}
            <div className="inline-flex p-1 rounded-xl bg-zinc-900/90 border border-white/[0.08] self-start sm:self-auto">
              {(['competitive', 'stream', 'native'] as CalibratorMode[]).map((mKey) => {
                const isSel = activeMode === mKey;
                const mDef = MODES[mKey];
                return (
                  <button
                    key={mKey}
                    onClick={() => setActiveMode(mKey)}
                    className={`relative px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isSel 
                        ? 'text-white font-bold' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                    }`}
                  >
                    {isSel && (
                      <motion.span 
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-lg bg-white/[0.12] border border-white/[0.15] shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: mDef.accentColor }} 
                      />
                      {mKey === 'competitive' ? 'Competitive' : mKey === 'stream' ? 'Studio' : 'Native Win'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Centerpiece: Real-time DPC Latency Waveform Graph */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={15} style={{ color: current.accentColor }} />
                <span className="font-mono text-xs text-zinc-300 font-semibold tracking-wide">
                  {isEn ? 'Hardware DPC Latency & ISR Interrupt Waveform' : 'Осциллограмма задержек DPC и аппаратных прерываний (ISR)'}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-zinc-500">Peak:</span>
                <span className="font-bold text-white">
                  {activeMode === 'competitive' ? '45 μs' : activeMode === 'stream' ? '94 μs' : '3 400 μs'}
                </span>
                <span className="text-zinc-500 ml-2">Jitter:</span>
                <span 
                  className="font-bold px-1.5 py-0.5 rounded text-[10px]"
                  style={{
                    backgroundColor: `${current.accentColor}18`,
                    color: current.accentColor,
                  }}
                >
                  {current.dpcJitter}
                </span>
              </div>
            </div>

            {/* SVG Latency Graph */}
            <div className="h-32 w-full relative flex items-end">
              {/* Background gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="w-full border-b border-dashed border-white/40" />
                <div className="w-full border-b border-dashed border-white/40" />
                <div className="w-full border-b border-dashed border-white/40" />
              </div>

              {/* Dynamic Bars & Points */}
              <div className="w-full h-full flex items-end justify-between gap-1 sm:gap-1.5 relative z-10 pt-4">
                {current.wavePoints.map((val, idx) => {
                  const maxRef = activeMode === 'native' ? 3600 : 100;
                  const normalizedHeight = Math.min(100, Math.max(12, (val / maxRef) * 100));
                  const isPeak = val > (activeMode === 'native' ? 2000 : 90);

                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-white whitespace-nowrap pointer-events-none z-30 shadow-lg">
                        {val} μs {isPeak ? '(Interrupt Peak)' : ''}
                      </div>

                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${normalizedHeight}%` }}
                        transition={{ duration: 0.35, delay: idx * 0.015 }}
                        className="w-full rounded-t-sm transition-colors duration-300"
                        style={{
                          backgroundColor: isPeak && activeMode === 'native' 
                            ? '#f43f5e' 
                            : current.accentColor,
                          opacity: isPeak && activeMode === 'native' ? 0.9 : 0.65,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend Footer */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: current.accentColor }} />
                  {isEn ? 'Hardware Thread Interrupts' : 'Аппаратные прерывания ядер'}
                </span>
                {activeMode === 'native' && (
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {isEn ? 'Micro-stutter Driver Spikes' : 'Пиковые задержки драйверов (статтеры)'}
                  </span>
                )}
              </div>
              <span>Kernel Sampling: 1000 Hz</span>
            </div>
          </div>

          {/* 4 Bento Telemetry Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Tile 1: Kernel Timer */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/60 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                System Timer
              </span>
              <div className="my-1.5">
                <div className="font-mono text-lg font-black text-white">
                  {current.timerMs}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {activeMode === 'competitive' ? 'NtSetTimer (Max)' : 'Default RTC'}
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {activeMode === 'competitive' ? 'Hardware Locked' : 'Dynamic Tick'}
              </span>
            </div>

            {/* Tile 2: Standby Memory */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/60 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Standby Cache
              </span>
              <div className="my-1.5">
                <div className="font-mono text-lg font-black text-white">
                  {ramValue > 0 ? `${(ramValue / 1024).toFixed(1)} GB` : current.standbyState.split(' ')[0]}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {isEn ? current.standbyState : current.standbyStateRu}
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Working Set Clean
              </span>
            </div>

            {/* Tile 3: Core Affinity */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/60 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Core Unparking
              </span>
              <div className="my-1.5">
                <div className="font-mono text-lg font-black text-white">
                  {current.coreAffinity.split(' ')[0]}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {activeMode === 'competitive' ? 'Zero Core Sleeping' : 'Power Saving Mode'}
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                BCD Latency 0.0ms
              </span>
            </div>

            {/* Tile 4: IFEO Policy */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/60 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Process Priority
              </span>
              <div className="my-1.5">
                <div className="font-mono text-lg font-black text-white">
                  {current.qosState.split(' ')[0]}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {current.qosState}
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Win32 Priority 128
              </span>
            </div>
          </div>

          {/* Quick Interactive Tool Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>{isEn ? 'Direct WinAPI execution without registry corruption or background daemons.' : 'Прямое исполнение WinAPI без риска повреждения реестра и фоновых демонов.'}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePurgeRam}
                disabled={isPurging}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-mono font-medium border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCw size={13} className={isPurging ? 'animate-spin' : ''} />
                <span>{isEn ? 'Flush RAM Cache' : 'Сбросить кэш памяти'}</span>
              </button>

              <button
                type="button"
                onClick={handleEngageTurbo}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white text-zinc-950 hover:bg-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Flame size={13} className="text-zinc-950" />
                <span>{isEn ? 'Lock 0.5ms Timer' : 'Зафиксировать 0.5 мс'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
