import React, { useEffect, useState } from 'react';
import { 
  Trash2, Shield, Activity, Loader2, Cpu, Monitor, 
  Zap, HardDrive, Sparkles, CheckCircle2, Flame, User,
  Globe, RotateCw, ArrowRight, Crosshair, Gamepad2
} from 'lucide-react';
import { invoke } from '../lib/tauri';
import { SystemInfo, ScanResult, TweakInfo, MemoryStatus, FlushResult } from '../lib/types';
import { getPreferences, savePreferences } from '../lib/theme';
import { useI18n } from '../lib/i18n';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [flushingRam, setFlushingRam] = useState(false);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [tweaks, setTweaks] = useState<TweakInfo[]>([]);
  const [memStatus, setMemStatus] = useState<MemoryStatus | null>(null);
  const [ramFreedNotice, setRamFreedNotice] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [optimizedNotice, setOptimizedNotice] = useState(false);
  const [switchingProfile, setSwitchingProfile] = useState<string | null>(null);

  const [prefs, setPrefs] = useState(getPreferences());

  useEffect(() => {
    fetchData();

    const handlePrefsChange = () => {
      setPrefs(getPreferences());
    };
    window.addEventListener('ghosttweak:prefs-changed', handlePrefsChange);
    return () => {
      window.removeEventListener('ghosttweak:prefs-changed', handlePrefsChange);
    };
  }, []);

  const handleQuickSwitchProfile = async (profileId: 'esports' | 'cinematic' | 'streamer' | 'quiet') => {
    try {
      setSwitchingProfile(profileId);
      if (profileId === 'esports') {
        await invoke('apply_all_tweaks').catch(() => {});
        await invoke('apply_cs2_boost').catch(() => {});
        await invoke('set_dns', { preset: 'cloudflare' }).catch(() => {});
        await invoke('flush_memory').catch(() => {});
      } else if (profileId === 'cinematic') {
        await invoke('apply_tweak', { tweakId: 'disable_game_bar', enable: true }).catch(() => {});
        await invoke('apply_tweak', { tweakId: 'high_perf_power', enable: true }).catch(() => {});
        await invoke('set_dns', { preset: 'google' }).catch(() => {});
      } else if (profileId === 'streamer') {
        await invoke('apply_tweak', { tweakId: 'optimize_network', enable: true }).catch(() => {});
        await invoke('apply_tweak', { tweakId: 'disable_telemetry', enable: true }).catch(() => {});
        await invoke('set_dns', { preset: 'cloudflare' }).catch(() => {});
      } else {
        await invoke('set_dns', { preset: 'dhcp' }).catch(() => {});
      }

      const updated = { ...prefs, activeProfile: profileId };
      setPrefs(updated);
      savePreferences(updated);
      await fetchData();
    } catch {
      setError('Ошибка переключения профиля');
    } finally {
      setSwitchingProfile(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sys, scan, twk, mem] = await Promise.all([
        invoke<SystemInfo>('get_system_info').catch(() => null),
        invoke<ScanResult>('scan_junk').catch(() => ({ categories: [], total_size_bytes: 0 })),
        invoke<TweakInfo[]>('get_tweaks_status').catch(() => []),
        invoke<MemoryStatus>('get_memory_status').catch(() => null),
      ]);
      setSysInfo(sys);
      setScanResult(scan);
      setTweaks(twk);
      setMemStatus(mem);
    } catch {
      setError('Ошибка загрузки данных системы');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      setError('');

      await invoke('apply_all_tweaks');
      if (scanResult && scanResult.categories.length > 0) {
        await invoke('clean_junk', { categoryIds: scanResult.categories.map(c => c.id) });
      }
      await invoke('flush_memory').catch(() => {});
      
      await fetchData();
      setOptimizedNotice(true);
      setTimeout(() => setOptimizedNotice(false), 4000);
    } catch {
      setError(lang === 'ru' ? 'Не удалось применить комплексную оптимизацию.' : 'Failed to apply comprehensive optimization.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleFlushRam = async () => {
    try {
      setFlushingRam(true);
      const res = await invoke<FlushResult>('flush_memory');
      setRamFreedNotice(lang === 'ru' ? `Выгружено ${res.freed_mb} МБ кэша RAM` : `Flushed ${res.freed_mb} MB RAM cache`);
      setTimeout(() => setRamFreedNotice(null), 3500);
      const updatedMem = await invoke<MemoryStatus>('get_memory_status').catch(() => null);
      if (updatedMem) setMemStatus(updatedMem);
    } catch {
      // ignore
    } finally {
      setFlushingRam(false);
    }
  };

  if (loading && !sysInfo) {
    return (
      <div className="flex h-full items-center justify-center text-ghost-cyan page-enter">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin w-8 h-8" />
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            {lang === 'ru' ? 'Считывание аппаратных датчиков...' : 'Reading hardware sensors...'}
          </span>
        </div>
      </div>
    );
  }

  const appliedCount = tweaks.filter(t => t.enabled).length;
  const totalCount = tweaks.length;
  const score = totalCount > 0 ? Math.round((appliedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 page-enter pb-10 w-full max-w-6xl mx-auto">
      
      {/* Top Gamer Welcome Banner */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-ghost-cyan flex items-center gap-1">
              <User size={11} /> {prefs.callsign}
            </span>
            {/* Quick Profile Mode Selector */}
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
              {(['esports', 'cinematic', 'streamer', 'quiet'] as const).map((pId) => {
                const isSelected = prefs.activeProfile === pId;
                const isApplying = switchingProfile === pId;
                const labelMap = {
                  esports: lang === 'ru' ? 'ESPORTS' : 'ESPORTS',
                  cinematic: lang === 'ru' ? 'AAA ИГРЫ' : 'AAA GAMES',
                  streamer: lang === 'ru' ? 'СТРИМ' : 'STREAM',
                  quiet: lang === 'ru' ? 'ТИХИЙ' : 'QUIET'
                };
                return (
                  <button
                    key={pId}
                    onClick={() => handleQuickSwitchProfile(pId)}
                    disabled={isApplying || isSelected}
                    title={`${lang === 'ru' ? 'Включить режим' : 'Enable profile'} ${labelMap[pId]}`}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition-all ${
                      isSelected
                        ? 'bg-ghost-cyan/20 text-ghost-cyan border border-ghost-cyan/40 shadow-sm font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {isApplying ? '...' : labelMap[pId]}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {prefs.refreshRate}Hz ({((1000 / prefs.refreshRate).toFixed(1))}ms)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.dashboard.welcome}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t.dashboard.welcomeSub}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => onNavigate?.('game-optimizer')}
            className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] flex items-center gap-1.5 text-xs text-ghost-cyan font-mono transition-all"
          >
            <Gamepad2 size={13} /> {t.sidebar.gameOptimizer}
          </button>
          <button 
            onClick={() => onNavigate?.('profiles')}
            className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] flex items-center gap-1.5 text-xs text-ghost-cyan font-mono transition-all"
          >
            <Crosshair size={13} /> {t.sidebar.profiles}
          </button>
          <button 
            onClick={() => onNavigate?.('settings')}
            className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] flex items-center gap-1.5 text-xs text-emerald-400 font-mono transition-all"
          >
            <Zap size={13} /> {t.sidebar.settings}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-rose-400 bg-rose-500/[0.08] p-3 rounded-xl border border-rose-500/20 text-xs font-medium">
          {error}
        </div>
      )}

      {optimizedNotice && (
        <div className="bg-emerald-500/[0.08] border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400 animate-fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <div className="text-xs font-mono">
            <span className="font-bold">{t.dashboard.optimizedDone}:</span> {lang === 'ru' ? 'Системные задержки снижены, реестр настроен, кэши освобождены.' : 'System latencies minimized, registry tuned, caches flushed.'}
          </div>
        </div>
      )}

      {ramFreedNotice && (
        <div className="bg-ghost-cyan/[0.08] border border-ghost-cyan/20 p-3 rounded-xl flex items-center gap-2 text-ghost-cyan text-xs font-mono animate-fade-in">
          <Zap size={15} />
          <span>{ramFreedNotice}</span>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Junk Found */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3.5 hover:border-white/[0.14]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Trash2 size={18} />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono tracking-tight">
              {formatBytes(scanResult?.total_size_bytes || 0)}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
              {t.dashboard.statJunk}
            </div>
          </div>
        </div>
        
        {/* Tweaks Applied */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3.5 hover:border-white/[0.14]">
          <div className="w-10 h-10 rounded-xl bg-ghost-cyan/10 border border-ghost-cyan/20 flex items-center justify-center text-ghost-cyan shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono tracking-tight">
              {appliedCount} <span className="text-xs text-zinc-500 font-normal">/ {totalCount}</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
              {t.dashboard.statTweaks}
            </div>
          </div>
        </div>

        {/* System Score */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3.5 hover:border-white/[0.14]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono tracking-tight flex items-center gap-1.5">
              <span>{score}%</span>
              <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded-full ${score > 70 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {score > 70 ? (lang === 'ru' ? 'Оптимально' : 'Optimal') : (lang === 'ru' ? 'Твики' : 'Needs Tune')}
              </span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
              {t.dashboard.statScore}
            </div>
          </div>
        </div>

      </div>

      {/* Game Optimizer Launcher Banner */}
      <div 
        onClick={() => onNavigate?.('game-optimizer')}
        className="glass-card p-4 rounded-2xl border border-white/[0.08] hover:border-ghost-cyan/40 bg-gradient-to-r from-ghost-cyan/[0.04] via-titanium-900 to-transparent flex items-center justify-between gap-4 cursor-pointer transition-all group shadow-sm"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-ghost-cyan/10 border border-ghost-cyan/20 text-ghost-cyan shrink-0 group-hover:scale-105 transition-transform">
            <Gamepad2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{t.dashboard.bannerTitle}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 uppercase font-semibold">
                CS2 & Esports
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {t.dashboard.bannerDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-ghost-cyan shrink-0 group-hover:translate-x-1 transition-transform">
          <span>{lang === 'ru' ? 'Настроить' : 'Configure'}</span>
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Live RAM Purge & Memory Gauge Widget */}
      {memStatus && (
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="p-2.5 rounded-xl bg-ghost-cyan/10 border border-ghost-cyan/20 text-ghost-cyan shrink-0">
              <HardDrive size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">{t.dashboard.statRam}</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {(memStatus.used_mb / 1024).toFixed(1)} GB / {(memStatus.total_mb / 1024).toFixed(1)} GB
                </span>
              </div>
              
              {/* RAM Usage Bar */}
              <div className="w-48 md:w-64 h-1.5 bg-titanium-950 rounded-full overflow-hidden border border-white/[0.06] mt-1.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    memStatus.percent_used > 80 
                      ? 'bg-rose-500' 
                      : memStatus.percent_used > 60 
                        ? 'bg-amber-400' 
                        : 'bg-ghost-cyan'
                  }`}
                  style={{ width: `${memStatus.percent_used}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-mono font-bold text-white">
              {memStatus.percent_used}% {t.dashboard.statRamUsed}
            </span>
            <button
              onClick={handleFlushRam}
              disabled={flushingRam}
              className="btn-outline px-3.5 py-1.5 text-xs font-mono flex items-center gap-1.5 hover:border-ghost-cyan/40"
            >
              <RotateCw size={12} className={flushingRam ? "animate-spin text-ghost-cyan" : ""} />
              <span>{flushingRam ? (lang === 'ru' ? "Сброс..." : "Purging...") : t.dashboard.statRamFlush}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Action Button */}
      <button 
        onClick={handleOptimize}
        disabled={optimizing}
        className="btn-cyan w-full py-3.5 text-xs font-bold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-cyan-glow"
      >
        {optimizing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{t.dashboard.optimizing}</span>
          </>
        ) : (
          <>
            <Zap size={16} />
            <span>{t.dashboard.btnOptimize}</span>
          </>
        )}
      </button>

      {/* Hardware Specifications Panel */}
      {sysInfo && (
        <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-ghost-cyan" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">{t.dashboard.hwTitle}</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">WMI Hardware Probe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* CPU */}
            <div className="hardware-well p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-ghost-cyan shrink-0">
                <Cpu size={16} />
              </div>
              <div className="overflow-hidden">
                <div className="text-[9px] font-mono uppercase text-zinc-500">{t.dashboard.hwCpu}</div>
                <div className="text-xs font-semibold text-white truncate" title={sysInfo.cpu}>
                  {sysInfo.cpu || 'Unknown CPU'}
                </div>
              </div>
            </div>

            {/* GPU & Display */}
            <div className="hardware-well p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-ghost-cyan shrink-0">
                <Monitor size={16} />
              </div>
              <div className="overflow-hidden">
                <div className="text-[9px] font-mono uppercase text-zinc-500">{t.dashboard.hwGpu}</div>
                <div className="text-xs font-semibold text-white truncate" title={`${sysInfo.gpu} (${sysInfo.display_res} @ ${sysInfo.refresh_rate}Hz)`}>
                  {sysInfo.gpu} &bull; {sysInfo.display_res} @ {sysInfo.refresh_rate}Hz
                </div>
              </div>
            </div>

            {/* RAM */}
            <div className="hardware-well p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-emerald-400 shrink-0">
                <HardDrive size={16} />
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase text-zinc-500">{t.dashboard.hwRam}</div>
                <div className="text-xs font-semibold text-white">
                  {sysInfo.ram_gb} GB DDR
                </div>
              </div>
            </div>

            {/* OS */}
            <div className="hardware-well p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-amber-400 shrink-0">
                <Zap size={16} />
              </div>
              <div className="overflow-hidden">
                <div className="text-[9px] font-mono uppercase text-zinc-500">{t.dashboard.hwOs}</div>
                <div className="text-xs font-semibold text-white truncate">
                  {sysInfo.os_name} ({sysInfo.os_version})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
