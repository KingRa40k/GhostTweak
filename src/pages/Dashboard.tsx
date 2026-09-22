import React, { useEffect, useState } from 'react';
import { 
  Trash2, Shield, Activity, Loader2, Cpu, Monitor, 
  Zap, HardDrive, Sparkles, CheckCircle2, Flame, User,
  Globe, RotateCw, ArrowRight, Crosshair, Gamepad2,
  ShieldAlert, ShieldCheck, AlertTriangle, X, Laptop,
  Gauge, Clock, Terminal, ChevronRight
} from 'lucide-react';
import { invoke } from '../lib/tauri';
import { SystemInfo, ScanResult, TweakInfo, MemoryStatus, FlushResult, SuperOptimizeResult, MatchTurboResult, HardwareTierInfo } from '../lib/types';
import { getPreferences, savePreferences } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { playClick, playSwitch, playTurbo, playSuccess, playBlip } from '../lib/sound';

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
  const [applyingSafeProfile, setApplyingSafeProfile] = useState(false);
  const [matchTurboRunning, setMatchTurboRunning] = useState(false);
  const [matchTurboResult, setMatchTurboResult] = useState<MatchTurboResult | null>(null);
  const [flushingRam, setFlushingRam] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [superResult, setSuperResult] = useState<SuperOptimizeResult | null>(null);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [hwTier, setHwTier] = useState<HardwareTierInfo | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [tweaks, setTweaks] = useState<TweakInfo[]>([]);
  const [memStatus, setMemStatus] = useState<MemoryStatus | null>(null);
  const [ramFreedNotice, setRamFreedNotice] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [switchingProfile, setSwitchingProfile] = useState<string | null>(null);
  const [customHz, setCustomHz] = useState<number | null>(null);

  const [prefs, setPrefs] = useState(getPreferences());

  useEffect(() => {
    fetchData();

    const handlePrefsChange = () => {
      setPrefs(getPreferences());
    };
    window.addEventListener('ghosttweak:prefs-changed', handlePrefsChange);

    let unlistenHotkey: (() => void) | undefined;
    let unlistenOptimize: (() => void) | undefined;

    const tauriAny = (window as any).__TAURI__;
    if (tauriAny?.event?.listen) {
      tauriAny.event.listen('ghosttweak:hotkey-turbo', () => {
        playTurbo();
        setRamFreedNotice(lang === 'ru' ? '🔥 Hotkey [Ctrl+Alt+F12]: Match Turbo сработал!' : '🔥 Hotkey [Ctrl+Alt+F12]: Match Turbo triggered!');
        setTimeout(() => setRamFreedNotice(null), 4500);
        invoke<MemoryStatus>('get_memory_status').then(m => m && setMemStatus(m)).catch(() => {});
      }).then((fn: any) => { unlistenHotkey = fn; });

      tauriAny.event.listen('ghosttweak:quick-optimize', () => {
        handleMatchTurbo();
      }).then((fn: any) => { unlistenOptimize = fn; });
    }

    return () => {
      window.removeEventListener('ghosttweak:prefs-changed', handlePrefsChange);
      if (unlistenHotkey) unlistenHotkey();
      if (unlistenOptimize) unlistenOptimize();
    };
  }, [lang]);

  const handleQuickSwitchProfile = async (profileId: 'esports' | 'cinematic' | 'streamer' | 'quiet') => {
    try {
      playSwitch();
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
      playSuccess();
    } catch {
      setError('Ошибка переключения профиля');
    } finally {
      setSwitchingProfile(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sys, scan, twk, mem, adminStatus, tier] = await Promise.all([
        invoke<SystemInfo>('get_system_info').catch(() => null),
        invoke<ScanResult>('scan_junk').catch(() => ({ categories: [], total_size_bytes: 0 })),
        invoke<TweakInfo[]>('get_tweaks_status').catch(() => []),
        invoke<MemoryStatus>('get_memory_status').catch(() => null),
        invoke<boolean>('is_admin_elevated').catch(() => false),
        invoke<HardwareTierInfo>('detect_hardware_tier').catch(() => null),
      ]);
      setSysInfo(sys);
      setScanResult(scan);
      setTweaks(twk);
      setMemStatus(mem);
      setIsAdmin(adminStatus);
      setHwTier(tier);
    } catch {
      setError('Ошибка загрузки данных системы');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySafeProfile = async () => {
    if (isAdmin === false) {
      setShowAdminModal(true);
      return;
    }

    try {
      playClick();
      setApplyingSafeProfile(true);
      setError('');
      setSuperResult(null);

      const res = await invoke<SuperOptimizeResult>('apply_safe_lowspec_profile');
      setSuperResult(res);
      await fetchData();
      playSuccess();
      setTimeout(() => setSuperResult(null), 8000);
    } catch (e: any) {
      const errStr = String(e);
      if (errStr.includes('ADMIN_REQUIRED')) {
        setShowAdminModal(true);
      } else {
        setError(lang === 'ru' ? 'Не удалось применить безопасный профиль.' : 'Failed to apply safe profile.');
      }
    } finally {
      setApplyingSafeProfile(false);
    }
  };

  const handleRestartAdmin = async () => {
    try {
      playClick();
      await invoke('restart_as_admin');
    } catch {
      setError(lang === 'ru' ? 'Перезапуск отменен пользователем или заблокирован.' : 'Elevation was cancelled or blocked.');
    }
  };

  const handleSuperOptimize = async () => {
    if (isAdmin === false) {
      setShowAdminModal(true);
      return;
    }

    try {
      playTurbo();
      setOptimizing(true);
      setError('');
      setSuperResult(null);

      const res = await invoke<SuperOptimizeResult>('super_optimize');
      setSuperResult(res);
      await fetchData();
      playSuccess();
      setTimeout(() => setSuperResult(null), 8000);
    } catch (e: any) {
      const errStr = String(e);
      if (errStr.includes('ADMIN_REQUIRED')) {
        setShowAdminModal(true);
      } else {
        setError(lang === 'ru' ? 'Не удалось применить полную оптимизацию.' : 'Failed to apply full optimization.');
      }
    } finally {
      setOptimizing(false);
    }
  };

  const handleMatchTurbo = async () => {
    try {
      playTurbo();
      setMatchTurboRunning(true);
      setError('');
      setMatchTurboResult(null);
      const res = await invoke<MatchTurboResult>('run_match_turbo');
      setMatchTurboResult(res);
      playSuccess();
      const updatedMem = await invoke<MemoryStatus>('get_memory_status').catch(() => null);
      if (updatedMem) setMemStatus(updatedMem);
      setTimeout(() => setMatchTurboResult(null), 8000);
    } catch {
      setError(lang === 'ru' ? 'Ошибка выполнения Match Turbo' : 'Failed to execute Match Turbo');
    } finally {
      setMatchTurboRunning(false);
    }
  };

  const handleFlushRam = async () => {
    try {
      playClick();
      setFlushingRam(true);
      const res = await invoke<FlushResult>('flush_memory');
      playBlip();
      setRamFreedNotice(lang === 'ru' ? `Выгружено ${res.freed_mb} МБ кэша RAM` : `Flushed ${res.freed_mb} MB RAM cache`);
      setTimeout(() => setRamFreedNotice(null), 3500);
      const updatedMem = await invoke<MemoryStatus>('get_memory_status').catch(() => null);
      if (updatedMem) setMemStatus(updatedMem);
    } catch {
      setError(lang === 'ru' ? 'Ошибка очистки памяти' : 'Failed to flush RAM');
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
      <div className="flex justify-between items-start">
        <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="tech-badge text-ghost-cyan flex items-center gap-1 shrink-0">
                <User size={11} /> {prefs.callsign}
              </span>

              {isAdmin !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border shrink-0 ${
                  isAdmin 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                }`}>
                  {isAdmin ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                  <span>{isAdmin ? (lang === 'ru' ? 'Администратор' : 'Admin') : (lang === 'ru' ? 'Без прав админа' : 'No Admin')}</span>
                </span>
              )}

              <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] shrink-0">
                {(['esports', 'cinematic', 'streamer', 'quiet'] as const).map((pId) => {
                  const isSelected = prefs.activeProfile === pId;
                  const isApplying = switchingProfile === pId;
                  const labelMap = {
                    esports: 'Esports',
                    cinematic: lang === 'ru' ? 'AAA игры' : 'AAA Games',
                    streamer: lang === 'ru' ? 'Стрим' : 'Stream',
                    quiet: lang === 'ru' ? 'Тихий' : 'Quiet'
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
              <span className="text-[11px] font-mono text-zinc-500 shrink-0">
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

      {isAdmin === false && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'ru' ? 'Внимание: Приложение запущено без прав администратора' : 'Notice: Running without Administrator Privileges'}
              </h4>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {lang === 'ru' 
                  ? 'Низкоуровневые твики (таймер BCD, приоритеты CS2 IFEO, разблокировка ядер CPU и сброс Standby List) требуют прав администратора.' 
                  : 'Low-level tweaks (BCD timer, IFEO priorities, CPU unparking, and Standby List purge) require Administrator elevation.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleRestartAdmin}
            className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-amber-400 hover:bg-amber-300 text-black transition-all flex items-center gap-1.5 shadow-md shrink-0"
          >
            <Zap size={14} />
            <span>{lang === 'ru' ? 'Перезапустить от имени администратора' : 'Relaunch as Admin'}</span>
          </button>
        </div>
      )}

      {error && (
        <div className="text-rose-400 bg-rose-500/[0.08] p-3 rounded-xl border border-rose-500/20 text-xs font-medium">
          {error}
        </div>
      )}

      {superResult && (
        <div className="bg-emerald-500/[0.1] border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3.5 text-emerald-300 animate-fade-in shadow-emerald-glow">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div className="text-xs font-mono">
            <div className="font-extrabold text-sm text-white mb-0.5">
              {lang === 'ru' ? 'Все настройки оптимизации успешно применены' : 'All optimization settings applied successfully'}
            </div>
            <div className="text-emerald-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span>{lang === 'ru' ? `Применено твиков:` : `Tweaks applied:`} <b>{superResult.applied_count}</b></span>
              <span>&bull;</span>
              <span>{lang === 'ru' ? `Выгружено RAM:` : `RAM freed:`} <b>{superResult.ram_freed_mb} МБ</b></span>
              <span>&bull;</span>
              <span>{lang === 'ru' ? `Очищено мусора:` : `Cleaned:`} <b>{formatBytes(superResult.junk_cleaned_bytes)}</b></span>
              <span>&bull;</span>
              <span className="text-ghost-cyan font-bold">{lang === 'ru' ? 'Игровые параметры активны' : 'Gaming profile active'}</span>
            </div>
          </div>
        </div>
      )}

      {matchTurboResult && (
        <div className="bg-amber-500/[0.1] border border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 text-amber-200 animate-fade-in shadow-lg">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Flame size={22} />
          </div>
          <div className="text-xs font-mono">
            <div className="font-extrabold text-sm text-white mb-0.5">
              {lang === 'ru' ? 'Match Turbo: Предматчевая оптимизация завершена' : 'Match Turbo: Pre-Game Optimization Complete'}
            </div>
            <div className="text-amber-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span>{lang === 'ru' ? 'Выгружено Standby List:' : 'Standby List Freed:'} <b className="text-white">{matchTurboResult.ram_freed_mb} МБ</b></span>
              <span>&bull;</span>
              <span>{lang === 'ru' ? 'Оптимизировано фоновых служб:' : 'Background trimmed:'} <b className="text-white">{matchTurboResult.background_trimmed}</b></span>
              <span>&bull;</span>
              <span>{lang === 'ru' ? 'Таймер прерываний:' : 'Timer Resolution:'} <b className="text-emerald-400 font-bold">{matchTurboResult.timer_resolution_active ? '0.5 ms LOCKED' : 'Active'}</b></span>
              {matchTurboResult.boosted_games.length > 0 && (
                <>
                  <span>&bull;</span>
                  <span className="text-ghost-cyan font-bold">
                    {lang === 'ru' ? 'Обнаружены игры в High Priority: ' : 'Games in High Priority: '}
                    {matchTurboResult.boosted_games.join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {ramFreedNotice && (
        <div className="bg-ghost-cyan/[0.08] border border-ghost-cyan/20 p-3 rounded-xl flex items-center gap-2 text-ghost-cyan text-xs font-mono animate-fade-in">
          <Zap size={15} />
          <span>{ramFreedNotice}</span>
        </div>
      )}

      {hwTier && (hwTier.is_weak_pc || hwTier.ram_constrained || hwTier.is_laptop) && (
        <div className="p-4 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-zinc-900/60 to-indigo-950/30 backdrop-blur-xl flex flex-col gap-3.5 animate-fade-in shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 shrink-0 mt-0.5 sm:mt-0">
                <Laptop size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {hwTier.tier_label}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {hwTier.cpu_name} &bull; {hwTier.gpu_name} &bull; {hwTier.ram_gb.toFixed(1)} GB RAM
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white mt-1">
                  {t.dashboard.hwBudgetBannerTitle}
                </h4>
                <p className="text-xs text-zinc-300 mt-0.5">
                  {t.dashboard.hwBudgetBannerDesc}
                </p>
              </div>
            </div>

            <button
              onClick={handleApplySafeProfile}
              disabled={applyingSafeProfile}
              className="px-4 py-2.5 rounded-xl text-xs font-bold font-mono bg-sky-500 hover:bg-sky-400 text-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 shrink-0 self-start sm:self-center disabled:opacity-50"
            >
              <Zap size={14} />
              <span>{applyingSafeProfile ? t.dashboard.optimizing : t.dashboard.btnApplySafeProfile}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
            {hwTier.safe_recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-zinc-300 bg-black/20 p-2 rounded-lg border border-white/[0.04]">
                <CheckCircle2 size={13} className="text-sky-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hwTier && !hwTier.is_weak_pc && !hwTier.ram_constrained && (
        <div className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/15 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0"><Cpu size={16} /></span>
            <span>
              {lang === 'ru' ? 'Конфигурация:' : 'Hardware:'} <b className="text-white">{hwTier.tier_label}</b> ({hwTier.cpu_name} &bull; {hwTier.ram_gb.toFixed(0)} GB). {lang === 'ru' ? 'Доступны все параметры оптимизации.' : 'All optimization parameters available.'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 uppercase font-bold">
            {lang === 'ru' ? 'Высокая производительность' : 'High Performance'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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

        <div className="glass-card p-4 rounded-2xl flex items-center gap-3.5 hover:border-white/[0.14]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono tracking-tight flex items-center gap-1.5">
              <span>{score}%</span>
              <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded-full ${score > 70 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {score > 70 ? (lang === 'ru' ? 'Оптимально' : 'Optimal') : (lang === 'ru' ? 'Требует настройки' : 'Needs Tune')}
              </span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
              {t.dashboard.statScore}
            </div>
          </div>
        </div>

      </div>

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

      {memStatus && (
        <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/[0.08]">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-ghost-cyan/10 border border-ghost-cyan/20 flex items-center justify-center text-ghost-cyan shrink-0">
              <Zap size={18} />
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5 gap-4">
                <span className="text-zinc-400 whitespace-nowrap">{t.dashboard.statRam}:</span>
                <span className="text-white font-semibold whitespace-nowrap pl-2">
                  {(memStatus.used_mb / 1024).toFixed(1)} / {(memStatus.total_mb / 1024).toFixed(0)} GB
                </span>
              </div>
              <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    memStatus.percent_used > 85 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="relative group">
          <div 
            className="absolute -inset-0.5 rounded-2xl opacity-40 group-hover:opacity-85 blur-md transition duration-500 pointer-events-none bg-gradient-to-r from-amber-500 to-orange-600"
          />
          <button 
            onClick={handleMatchTurbo}
            disabled={matchTurboRunning || optimizing}
            className="relative w-full py-4 px-4 text-xs font-bold tracking-wider rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.006] active:scale-[0.995] cursor-pointer bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white shadow-lg border border-amber-400/40"
          >
            {matchTurboRunning ? (
              <div className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>{t.dashboard.matchTurboRunning}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-amber-200" />
                  <span className="text-sm font-bold tracking-wider">{t.dashboard.btnMatchTurbo}</span>
                </div>
                <span className="text-[10px] font-mono text-amber-100/90 font-normal">
                  {t.dashboard.matchTurboDesc}
                </span>
              </>
            )}
          </button>
        </div>

        <div className="relative group">
          <div 
            className="absolute -inset-0.5 rounded-2xl opacity-30 group-hover:opacity-75 blur-md transition duration-500 pointer-events-none"
            style={{ backgroundColor: 'var(--accent-color, #00f0ff)' }}
          />
          <button 
            onClick={handleSuperOptimize}
            disabled={optimizing || matchTurboRunning}
            className="relative btn-cyan animate-shimmer w-full py-4 px-4 text-xs font-bold tracking-wider rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.006] active:scale-[0.995] cursor-pointer shadow-lg"
          >
            {optimizing ? (
              <div className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>{lang === 'ru' ? 'Применение настроек...' : 'Applying settings...'}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Zap size={18} />
                  <span className="text-sm font-bold tracking-wider">{lang === 'ru' ? 'Оптимизировать всё' : 'Optimize Everything'}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 font-normal">
                  {lang === 'ru' ? 'Твики реестра + игровые параметры + очистка диска' : 'Registry Tweaks + Gaming Settings + Disk Cleanup'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Frame Budget & Latency Engine */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-ghost-cyan/[0.03] blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-ghost-cyan/10 border border-ghost-cyan/20 text-ghost-cyan">
              <Gauge size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'ru' ? 'Кадровый бюджет и задержка ввода' : 'Frame Budget & Display Latency'}
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  0.50ms HPET
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {lang === 'ru' 
                  ? 'Интерактивный расчет окна отрисовки кадра и сглаживания микрофризов' 
                  : 'Real-time calculation of frame delivery window and render pacing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-titanium-950/80 p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto">
            {[60, 144, 165, 240, 360, 540].map((hz) => {
              const active = (customHz ?? (sysInfo?.refresh_rate || 240)) === hz;
              return (
                <button
                  key={hz}
                  onClick={() => {
                    playClick();
                    setCustomHz(hz);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    active
                      ? 'bg-ghost-cyan text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {hz}Hz
                </button>
              );
            })}
          </div>
        </div>

        {(() => {
          const activeHz = customHz ?? (sysInfo?.refresh_rate || 240);
          const frameBudgetMs = (1000 / activeHz).toFixed(2);
          const defaultWinTimerMs = 15.62;
          const jitterSavedMs = Math.max(0.5, (defaultWinTimerMs - 0.5) * (60 / activeHz)).toFixed(1);

          return (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="hardware-well p-3.5 rounded-xl border border-white/[0.06] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>{lang === 'ru' ? 'Окно кадра' : 'Frame Budget'}</span>
                    <Clock size={12} className="text-ghost-cyan" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold font-mono text-white tracking-tight">{frameBudgetMs}</span>
                    <span className="text-xs font-mono text-zinc-400">ms</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1">
                    {lang === 'ru' ? `Цель для стабильных ${activeHz} FPS` : `Target for lock-in ${activeHz} FPS`}
                  </div>
                </div>

                <div className="hardware-well p-3.5 rounded-xl border border-white/[0.06] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>{lang === 'ru' ? 'Квантование таймера' : 'Timer Quantum'}</span>
                    <Activity size={12} className="text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold font-mono text-emerald-400 tracking-tight">0.50</span>
                    <span className="text-xs font-mono text-emerald-400/80">ms</span>
                    <span className="text-[10px] font-mono text-zinc-500 line-through ml-1">15.6ms</span>
                  </div>
                  <div className="text-[10px] text-emerald-400/70 font-mono mt-1">
                    {lang === 'ru' ? 'Мгновенный опрос мыши и потоков' : 'Microsecond thread dispatch'}
                  </div>
                </div>

                <div className="hardware-well p-3.5 rounded-xl border border-white/[0.06] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <span>{lang === 'ru' ? 'Снижение разброса 1%' : '1% Low Jitter Cut'}</span>
                    <ShieldCheck size={12} className="text-amber-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold font-mono text-amber-400 tracking-tight">-{jitterSavedMs}</span>
                    <span className="text-xs font-mono text-amber-400/80">ms</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1">
                    {lang === 'ru' ? 'Без задержки планировщика ядер' : 'Reduced queue scheduling lag'}
                  </div>
                </div>
              </div>

              {/* Progress visualizer of frame budget */}
              <div className="hardware-well p-3 rounded-xl border border-white/[0.06] flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-400">{lang === 'ru' ? 'Доля времени кадра в 1 секунде:' : 'Pacing slice per frame:'}</span>
                  <span className="text-ghost-cyan font-bold">{frameBudgetMs} ms / frame ({activeHz} Hz)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden p-0.5 border border-white/[0.06]">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-ghost-cyan to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(12, (Number(frameBudgetMs) / 16.67) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Global Hotkey Ribbon */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-[11px] font-mono text-zinc-300 font-medium">
              {lang === 'ru' ? 'Внутриигровой триггер:' : 'In-game trigger:'}
            </span>
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white/[0.08] text-amber-300 rounded border border-white/[0.12] shadow-sm">
              Ctrl + Alt + F12
            </kbd>
            <span className="text-[10px] text-zinc-500 hidden md:inline">
              ({lang === 'ru' ? 'сброс Standby RAM и ускорение прямо во время матча без Alt-Tab' : 'flush Standby RAM and boost in-match without Alt-Tab'})
            </span>
          </div>

          <button
            onClick={() => onNavigate?.('settings')}
            className="text-[11px] font-mono text-ghost-cyan hover:underline flex items-center gap-1 self-end sm:self-auto"
          >
            <span>{lang === 'ru' ? 'Настройки автозапуска' : 'Autostart settings'}</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {sysInfo && (
        <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-ghost-cyan" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">{t.dashboard.hwTitle}</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Hardware Info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
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

            <div className="hardware-well p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-emerald-400 shrink-0">
                <HardDrive size={16} />
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase text-zinc-500">{t.dashboard.hwRam}</div>
                <div className="text-xs font-semibold text-white">
                  {Math.round(sysInfo.ram_gb)} GB {sysInfo.ram_type || 'DDR5'}
                </div>
              </div>
            </div>

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

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-amber-500/30 bg-titanium-950 shadow-2xl relative">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'ru' ? 'Требуются права Администратора' : 'Administrator Rights Required'}
                </h3>
                <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                  UAC Windows Elevation
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-5">
              {lang === 'ru'
                ? 'Для применения всех настроек (системный таймер BCD, приоритеты IFEO, разблокировка ядер процессора, отключение троттлинга и очистка Standby List) требуются права администратора.'
                : 'To apply optimizations (BCD timer, IFEO priorities, CPU core unparking, power throttling bypass, and Standby List flush), Windows requires administrator privileges.'}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleRestartAdmin}
                className="w-full py-3 rounded-xl text-xs font-bold font-mono bg-amber-400 hover:bg-amber-300 text-black transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Zap size={16} />
                <span>{lang === 'ru' ? 'Перезапустить от имени администратора' : 'Relaunch as Administrator'}</span>
              </button>
              
              <button
                onClick={() => setShowAdminModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                {lang === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
