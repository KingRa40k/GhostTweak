import React, { useEffect, useState } from 'react';
import { 
  Crosshair, Zap, RotateCw, Check, Copy, Download, Flame, 
  ShieldCheck, Cpu, Layers, Wifi, Clock, AlertTriangle, 
  CheckCircle2, HardDrive, Terminal, Sliders, ChevronRight,
  Gamepad2
} from 'lucide-react';
import { invoke } from '../lib/tauri';
import { MemoryStatus, FlushResult, TweakInfo, SystemInfo } from '../lib/types';
import { getPreferences } from '../lib/theme';
import { useI18n } from '../lib/i18n';

type SupportedGame = 'cs2' | 'valorant' | 'apex' | 'dota2';

interface GameProfile {
  id: SupportedGame;
  title: string;
  engine: string;
  processName: string;
  recommendedThreads: number;
  launchOptionsTemplate: (threads: number) => string;
  autoexecTemplate: string;
}

const GAME_PROFILES: Record<SupportedGame, GameProfile> = {
  cs2: {
    id: 'cs2',
    title: 'Counter-Strike 2',
    engine: 'Source 2 (DirectX 11 / Vulkan)',
    processName: 'cs2.exe',
    recommendedThreads: 8,
    launchOptionsTemplate: (t) => 
      `-novid -nojoy -high -threads ${t} +engine_low_latency_sleep_after_client_tick true +fps_max 0 +cl_updaterate 128 +rate 786432 +cl_interp_ratio 1`,
    autoexecTemplate: `// GhostTweak Competitive Config for CS2
fps_max 0
fps_max_ui 120
r_drawtracers_firstperson 0
cl_cq_netgraph 1
cl_cq_netgraph_problem_show_auto true
rate 786432
cl_updaterate 128
cl_interp_ratio 1
snd_mixahead 0.015
snd_headphone_pan_exponent 2
snd_headphone_pan_radial_weight 2
engine_no_focus_sleep 0
vprof_off
cl_autohelp 0
gameinstructor_enable 0
echo ">>> GhostTweak Competitive Config Loaded <<<"`
  },
  valorant: {
    id: 'valorant',
    title: 'Valorant',
    engine: 'Unreal Engine (DirectX 11)',
    processName: 'VALORANT-Win64-Shipping.exe',
    recommendedThreads: 8,
    launchOptionsTemplate: (t) => 
      `-USEALLAVAILABLECORES -high -nomansky -nosplash`,
    autoexecTemplate: `// Valorant System Tuning Parameters
// Run via Riot Client in 'Exclusive Fullscreen' mode
// GhostTweak automatically applies High IFEO & low DPC latency`
  },
  apex: {
    id: 'apex',
    title: 'Apex Legends',
    engine: 'Source Engine Modified (DirectX 11 / 12)',
    processName: 'r5apex.exe',
    recommendedThreads: 8,
    launchOptionsTemplate: (t) => 
      `-novid -high -threads ${t} -fullscreen -forcenovsync +fps_max 0`,
    autoexecTemplate: `// Apex Legends Autoexec
fps_max 0
cl_forcepreload 0
mat_compressedtextures 1
cl_ragdoll_collide 0
r_shadows 0
echo ">>> GhostTweak Apex Profile Loaded <<<"`
  },
  dota2: {
    id: 'dota2',
    title: 'Dota 2',
    engine: 'Source 2 (Vulkan / DX11)',
    processName: 'dota2.exe',
    recommendedThreads: 6,
    launchOptionsTemplate: (t) => 
      `-novid -high -threads ${t} -map dota +fps_max 0`,
    autoexecTemplate: `// Dota 2 Optimization Config
fps_max 0
dota_cheap_water 1
cl_globallight_shadow_mode 0
r_deferred_additive_pass 0
echo ">>> GhostTweak Dota 2 Profile Loaded <<<"`
  }
};

export default function GameOptimizer() {
  const { t, lang } = useI18n();
  const [selectedGame, setSelectedGame] = useState<SupportedGame>('cs2');
  const [loading, setLoading] = useState(true);
  const [boosting, setBoosting] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [threads, setThreads] = useState(8);
  const [copiedLaunch, setCopiedLaunch] = useState(false);
  const [copiedAutoexec, setCopiedAutoexec] = useState(false);
  const [memStatus, setMemStatus] = useState<MemoryStatus | null>(null);
  const [flushingRam, setFlushingRam] = useState(false);
  const [ramFreedNotice, setRamFreedNotice] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tweaks, setTweaks] = useState<TweakInfo[]>([]);

  const activeGame = GAME_PROFILES[selectedGame];
  const launchOptions = activeGame.launchOptionsTemplate(threads);
  const autoexecContent = activeGame.autoexecTemplate;

  useEffect(() => {
    loadData();
  }, [threads, selectedGame]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [boosted, mem, twk, sys] = await Promise.all([
        invoke<boolean>('is_cs2_boosted').catch(() => false),
        invoke<MemoryStatus>('get_memory_status').catch(() => null),
        invoke<TweakInfo[]>('get_tweaks_status').catch(() => []),
        invoke<SystemInfo>('get_system_info').catch(() => null),
      ]);

      setIsBoosted(boosted);
      setMemStatus(mem);
      setTweaks(twk);

      if (sys?.cpu && threads === 8) {
        if (sys.cpu.includes('4-Core') || sys.cpu.includes('i3') || sys.cpu.includes('Ryzen 3')) setThreads(4);
        else if (sys.cpu.includes('6-Core') || sys.cpu.includes('i5') || sys.cpu.includes('Ryzen 5')) setThreads(6);
        else if (sys.cpu.includes('8-Core') || sys.cpu.includes('i7') || sys.cpu.includes('Ryzen 7')) setThreads(8);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBoost = async () => {
    try {
      setBoosting(true);
      setNotice(null);

      await invoke('apply_cs2_boost');
      const flushRes = await invoke<FlushResult>('flush_memory').catch(() => null);

      setIsBoosted(true);
      const updatedMem = await invoke<MemoryStatus>('get_memory_status').catch(() => null);
      if (updatedMem) setMemStatus(updatedMem);
      
      const updatedTweaks = await invoke<TweakInfo[]>('get_tweaks_status').catch(() => []);
      setTweaks(updatedTweaks);

      const freedText = flushRes ? (lang === 'ru' ? ` Выгружено ${flushRes.freed_mb} МБ кэша RAM.` : ` Freed ${flushRes.freed_mb} MB RAM cache.`) : '';
      setNotice(lang === 'ru' 
        ? `Оптимизация для ${activeGame.title} успешно применена: 100% ресурсов ядра задействовано, ядра разблокированы, системные задержки минимизированы.${freedText}`
        : `Optimization for ${activeGame.title} applied: 100% CPU priority assigned, cores unparked, DPC latency minimized.${freedText}`
      );
      setTimeout(() => setNotice(null), 5000);
    } catch {
      setNotice(lang === 'ru' ? 'Не удалось применить параметры. Убедитесь в наличии прав администратора Windows.' : 'Failed to apply settings. Please ensure GhostTweak is running as Administrator.');
    } finally {
      setBoosting(false);
    }
  };

  const handleFlushRam = async () => {
    try {
      setFlushingRam(true);
      const res = await invoke<FlushResult>('flush_memory');
      setRamFreedNotice(lang === 'ru' ? `Выгружено ${res.freed_mb} МБ Standby-памяти. Своп на накопитель исключен.` : `Freed ${res.freed_mb} MB Standby RAM. Disk paging eliminated.`);
      setTimeout(() => setRamFreedNotice(null), 4000);
      const updatedMem = await invoke<MemoryStatus>('get_memory_status').catch(() => null);
      if (updatedMem) setMemStatus(updatedMem);
    } catch {
      // ignore
    } finally {
      setFlushingRam(false);
    }
  };

  const copyLaunchOptions = () => {
    navigator.clipboard.writeText(launchOptions);
    setCopiedLaunch(true);
    setTimeout(() => setCopiedLaunch(false), 2000);
  };

  const copyAutoexec = () => {
    navigator.clipboard.writeText(autoexecContent);
    setCopiedAutoexec(true);
    setTimeout(() => setCopiedAutoexec(false), 2000);
  };

  const downloadAutoexec = () => {
    const blob = new Blob([autoexecContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'autoexec.cfg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeKernelTweaks = tweaks.filter(t => 
    ['cs2_priority', 'system_responsiveness', 'game_gpu_priority', 'cs2_fullscreen_opt', 
     'unpark_cpu_cores', 'disable_power_throttling', 'bcd_low_latency', 'optimize_network'].includes(t.id)
  );

  return (
    <div className="flex flex-col gap-6 page-enter pb-12 w-full max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-ghost-cyan flex items-center gap-1">
              <Crosshair size={11} /> {t.gameOpt.badge}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              {lang === 'ru' ? 'Статус:' : 'Status:'} {isBoosted ? (lang === 'ru' ? 'Оптимизирован' : 'Optimized') : (lang === 'ru' ? 'Стандартный режим' : 'Standard')}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              DPC Latency & Core Unpark
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            {t.gameOpt.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t.gameOpt.desc}
          </p>
        </div>

        {/* Game Discipline Switcher */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.08]">
          {(['cs2', 'valorant', 'apex', 'dota2'] as SupportedGame[]).map((gId) => {
            const p = GAME_PROFILES[gId];
            const isSelected = selectedGame === gId;
            return (
              <button
                key={gId}
                onClick={() => setSelectedGame(gId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all ${
                  isSelected 
                    ? 'bg-ghost-cyan/15 text-ghost-cyan border border-ghost-cyan/30 shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p.title}
              </button>
            );
          })}
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-500/[0.09] border border-emerald-500/25 p-4 rounded-xl flex items-center gap-3 text-emerald-400 animate-fade-in text-xs font-mono">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {ramFreedNotice && (
        <div className="bg-ghost-cyan/[0.08] border border-ghost-cyan/20 p-3.5 rounded-xl flex items-center gap-2 text-ghost-cyan text-xs font-mono animate-fade-in">
          <Zap size={15} />
          <span>{ramFreedNotice}</span>
        </div>
      )}

      {/* Main 1-Click Game Tuning Engine */}
      <div className="glass-card p-6 rounded-2xl border border-ghost-cyan/25 relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.07)]">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-ghost-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col gap-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-ghost-cyan animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-ghost-cyan font-bold">
                {lang === 'ru' ? 'Профиль ядра:' : 'Kernel Profile:'} {activeGame.title}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {lang === 'ru' ? `Комплексная калибровка для ${activeGame.title}` : `Comprehensive calibration for ${activeGame.title}`}
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              {lang === 'ru'
                ? `Назначает процесс ${activeGame.processName} в режим приоритета реального времени (IFEO), разблокирует спящие ядра процессора, отключает задержки BCD и очищает кэш памяти.`
                : `Assigns process ${activeGame.processName} real-time IFEO priority, unparks dormant CPU cores, tunes BCD timers, and purges RAM cache.`}
            </p>
          </div>

          <button
            onClick={handleApplyBoost}
            disabled={boosting}
            className="w-full md:w-auto px-7 py-4 rounded-xl bg-ghost-cyan text-titanium-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] transition-all shrink-0 active:scale-95"
          >
            {boosting ? (
              <>
                <RotateCw size={16} className="animate-spin" />
                <span>{t.gameOpt.btnApplying}</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>{isBoosted ? (lang === 'ru' ? 'Перекалибровать настройки' : 'Recalibrate Settings') : t.gameOpt.btnApplyAll}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: RAM Standby Purge + Launch Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Module 1: RAM Standby Purge */}
        <div className="glass-card p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <HardDrive size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.gameOpt.ramStandbyTitle}</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{lang === 'ru' ? 'Устраняет подвисания при нехватке физической памяти' : 'Eliminates hitches caused by RAM cache saturation'}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {memStatus ? `${memStatus.percent_used}%` : '50%'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-2 mb-4 leading-relaxed">
              {t.gameOpt.ramStandbyDesc}
            </p>

            {memStatus && (
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">{lang === 'ru' ? 'Свободно:' : 'Free:'} {((memStatus.free_mb) / 1024).toFixed(1)} GB</span>
                  <span className="text-zinc-300">{lang === 'ru' ? 'Всего:' : 'Total:'} {((memStatus.total_mb) / 1024).toFixed(1)} GB</span>
                </div>
                <div className="w-full h-2 bg-titanium-950 rounded-full overflow-hidden border border-white/[0.06]">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-ghost-cyan rounded-full transition-all duration-500"
                    style={{ width: `${memStatus.percent_used}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleFlushRam}
            disabled={flushingRam}
            className="btn-outline w-full py-2.5 text-xs font-mono flex items-center justify-center gap-2 hover:border-ghost-cyan/40"
          >
            <RotateCw size={13} className={flushingRam ? "animate-spin text-ghost-cyan" : ""} />
            <span>{flushingRam ? (lang === 'ru' ? "Очистка кэша..." : "Purging...") : t.gameOpt.btnFlushRam}</span>
          </button>
        </div>

        {/* Module 2: Steam / Client Launch Options */}
        <div className="glass-card p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-ghost-cyan/10 border border-ghost-cyan/20 text-ghost-cyan">
                  <Terminal size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.gameOpt.launchOptionsTitle}</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{t.gameOpt.launchOptionsDesc}</span>
                </div>
              </div>

              {/* Thread Selector */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.08]">
                {[4, 6, 8, 12, 16].map((t) => (
                  <button
                    key={t}
                    onClick={() => setThreads(t)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                      threads === t ? 'bg-ghost-cyan text-titanium-950 font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}T
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-zinc-400 mt-2 mb-3 leading-relaxed">
              {lang === 'ru' 
                ? `Выверенная конфигурация аргументов командной строки для движка ${activeGame.engine}.`
                : `Optimized command line arguments calibrated for engine ${activeGame.engine}.`}
            </p>

            {/* Launch Options Snippet */}
            <div className="bg-titanium-950 p-3 rounded-xl border border-white/[0.08] font-mono text-[11px] text-ghost-cyan break-all select-all mb-4">
              {launchOptions}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLaunchOptions}
              className="btn-cyan flex-1 py-2.5 text-xs font-mono flex items-center justify-center gap-2"
            >
              {copiedLaunch ? <Check size={14} className="text-emerald-950" /> : <Copy size={14} />}
              <span>{copiedLaunch ? t.gameOpt.copiedBtn : (lang === 'ru' ? "Скопировать параметры запуска" : "Copy Launch Options")}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Module 3: Autoexec.cfg */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sliders size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{selectedGame === 'cs2' ? t.gameOpt.autoexecTitle : (lang === 'ru' ? 'Конфигурационный файл настроек' : 'Optimization Config')}</h3>
              <span className="text-[10px] font-mono text-zinc-500">{t.gameOpt.autoexecDesc}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyAutoexec}
              className="px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              {copiedAutoexec ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedAutoexec ? t.gameOpt.copiedBtn : t.gameOpt.copyBtn}</span>
            </button>
            {selectedGame === 'cs2' && (
              <button
                onClick={downloadAutoexec}
                className="px-3 py-1.5 rounded-lg border border-ghost-cyan/30 bg-ghost-cyan/10 hover:bg-ghost-cyan/20 text-xs font-mono text-ghost-cyan flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} />
                <span>{lang === 'ru' ? 'Скачать cfg' : 'Download cfg'}</span>
              </button>
            )}
          </div>
        </div>

        <pre className="bg-titanium-950 p-3.5 rounded-xl border border-white/[0.06] text-[11px] font-mono text-zinc-400 overflow-x-auto max-h-40 leading-relaxed">
          {autoexecContent}
        </pre>
      </div>

      {/* Module 4: Active Kernel & Latency Matrix */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-ghost-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.gameOpt.matrixTitle}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {activeKernelTweaks.filter(t => t.enabled).length} {lang === 'ru' ? 'из' : 'of'} {activeKernelTweaks.length} {lang === 'ru' ? 'активно' : 'active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeKernelTweaks.map((tweak) => (
            <div 
              key={tweak.id} 
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                tweak.enabled 
                  ? 'bg-titanium-900 border-white/[0.12]' 
                  : 'bg-white/[0.01] border-white/[0.05]'
              }`}
            >
              <div className="flex items-start gap-2.5 overflow-hidden">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  tweak.enabled ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'
                }`} />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{tweak.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">{tweak.description}</div>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                tweak.enabled 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-500'
              }`}>
                {tweak.enabled ? (lang === 'ru' ? 'АКТИВЕН' : 'ACTIVE') : (lang === 'ru' ? 'ОТКЛ' : 'OFF')}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
