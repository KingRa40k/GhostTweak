import React, { useState, useEffect } from 'react';
import { 
  Palette, User, Monitor, Globe, Check, 
  Sparkles, Shield, Cpu, Zap, Ghost, 
  Crosshair, Crown, Flame, RotateCw, CheckCircle2,
  Bug, Copy, FileText, Download, ArrowUpCircle, ExternalLink
} from 'lucide-react';
import { 
  getPreferences, savePreferences, THEMES, ThemeId, 
  AvatarId, calculateFrameBudget 
} from '../lib/theme';
import { invoke } from '../lib/tauri';
import { SystemInfo, UpdateCheckResult } from '../lib/types';
import { useI18n, Language, setStoredLanguage } from '../lib/i18n';

export default function Settings() {
  const { t, lang } = useI18n();
  const [prefs, setPrefs] = useState(getPreferences());
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [dnsStatus, setDnsStatus] = useState<string | null>(null);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [syncingDisplay, setSyncingDisplay] = useState(false);
  const [copiedDiag, setCopiedDiag] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);

  const handleCopyDiagnosticReport = async () => {
    try {
      const info = sysInfo || await invoke<SystemInfo>('get_system_info').catch(() => null);
      const isAdmin = await invoke<boolean>('is_admin_elevated').catch(() => false);
      const tweaks = await invoke<any[]>('get_tweaks_status').catch(() => []);
      const activeTweaks = tweaks.filter(t => t.enabled).map(t => t.name || t.id).join(', ');
      const hwid = localStorage.getItem('ghosttweak_hwid') || 'UNKNOWN';

      const report = [
        '### GhostTweak Diagnostic Report',
        `- **Version:** v1.0.0-beta.1`,
        `- **Date:** ${new Date().toISOString()}`,
        `- **OS:** ${info?.os_name || 'Windows'} (${info?.os_version || 'N/A'})`,
        `- **CPU:** ${info?.cpu || 'N/A'}`,
        `- **GPU:** ${info?.gpu || 'N/A'}`,
        `- **RAM:** ${info?.ram_gb ? `${info.ram_gb} GB` : 'N/A'}`,
        `- **Display:** ${info?.display_res || 'N/A'} @ ${info?.refresh_rate || prefs.refreshRate || 60}Hz`,
        `- **Admin Elevated:** ${isAdmin ? 'Yes (Elevated)' : 'No (Standard User)'}`,
        `- **HWID:** \`${hwid}\``,
        `- **Active Tweaks (${tweaks.filter(t => t.enabled).length}/${tweaks.length}):** ${activeTweaks || 'None'}`,
        '',
        '---',
        '**Problem Description / Issue:**',
        '> [Опишите проблему, замеры FPS до и после или сообщение об ошибке]'
      ].join('\n');

      await navigator.clipboard.writeText(report);
      setCopiedDiag(true);
      showToast(t.settings.diagCopied);
      setTimeout(() => setCopiedDiag(false), 3000);
    } catch (e) {
      console.error('Failed to copy report:', e);
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setStoredLanguage(newLang);
    showToast(newLang === 'ru' ? 'Язык изменен на Русский' : 'Language switched to English');
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const res = await invoke<UpdateCheckResult>('check_for_updates');
      setUpdateResult(res);
      if (res.has_update) {
        showToast(lang === 'ru' ? `Доступно обновление v${res.latest_version}!` : `New update v${res.latest_version} available!`);
      } else {
        showToast(lang === 'ru' ? 'Установлена последняя версия' : 'GhostTweak is up to date');
      }
    } catch {
      setUpdateResult({
        has_update: false,
        current_version: '1.0.0',
        latest_version: '1.0.0',
        release_notes: lang === 'ru' ? 'Установлена актуальная релизная версия GhostTweak v1.0.0.' : 'GhostTweak v1.0.0 is up to date.',
        download_url: 'https://ghosttweak.com#download'
      });
    } finally {
      setCheckingUpdate(false);
    }
  };

  useEffect(() => {
    invoke<SystemInfo>('get_system_info')
      .then((info) => {
        setSysInfo(info);
        if (info.refresh_rate && info.refresh_rate > 0) {
          const currentPrefs = getPreferences();
          if (!localStorage.getItem('ghosttweak_custom_hz_set') || currentPrefs.refreshRate > info.refresh_rate) {
            updatePreference('refreshRate', info.refresh_rate);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to probe system display info:', err);
      });
  }, []);

  const updatePreference = <K extends keyof typeof prefs>(key: K, value: typeof prefs[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    savePreferences(updated);
    showToast('Параметры сохранены');
  };

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleThemeChange = (themeId: ThemeId) => {
    updatePreference('themeId', themeId);
  };

  const handleSyncDisplayHz = () => {
    if (sysInfo?.refresh_rate && sysInfo.refresh_rate > 0) {
      setSyncingDisplay(true);
      updatePreference('refreshRate', sysInfo.refresh_rate);
      localStorage.setItem('ghosttweak_custom_hz_set', 'true');
      showToast(`Синхронизировано: ${sysInfo.refresh_rate} Hz (${calculateFrameBudget(sysInfo.refresh_rate)})`);
      setTimeout(() => setSyncingDisplay(false), 800);
    }
  };

  const handleDnsSwitch = async (preset: string) => {
    try {
      setDnsLoading(true);
      const res = await invoke<string>('set_dns', { preset });
      setDnsStatus(res);
      setTimeout(() => setDnsStatus(null), 3500);
    } catch (e) {
      setDnsStatus('Ошибка настройки DNS');
    } finally {
      setDnsLoading(false);
    }
  };

  const avatars: { id: AvatarId; name: string; icon: typeof Ghost }[] = [
    { id: 'ghost', name: 'Ghost', icon: Ghost },
    { id: 'falcon', name: 'Falcon', icon: Flame },
    { id: 'vortex', name: 'Vortex', icon: Zap },
    { id: 'crosshair', name: 'Crosshair', icon: Crosshair },
    { id: 'crown', name: 'Apex', icon: Crown },
  ];

  const detectedRate = sysInfo?.refresh_rate || 60;
  const supportedModes = (sysInfo?.available_refresh_rates && sysInfo.available_refresh_rates.length > 0)
    ? sysInfo.available_refresh_rates
    : [60, 75, 100, 120, 144, 165, 180, 240, 360].filter(hz => hz <= detectedRate);

  const refreshRates = Array.from(
    new Set(supportedModes.filter(hz => hz <= detectedRate && hz >= 50))
  ).sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-6 page-enter pb-12 w-full max-w-6xl mx-auto">
      
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-zinc-400">{lang === 'ru' ? 'Настройки' : 'Settings'}</span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-ghost-cyan">
              <Sparkles size={13} />
              {lang === 'ru' ? 'Параметры приложения' : 'App Configuration'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.settings.title}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t.settings.desc}
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-500/[0.08] border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-mono animate-fade-in">
          <Check size={14} />
          <span>{savedNotice}</span>
        </div>
      )}

      <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-ghost-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.settings.secLang}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-ghost-cyan uppercase">
            {lang === 'ru' ? 'Текущий: Русский (RU)' : 'Current: English (EN)'}
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          {t.settings.secLangDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleLanguageChange('ru')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              lang === 'ru'
                ? 'bg-ghost-cyan/[0.08] border-ghost-cyan/50 text-white shadow-glow'
                : 'bg-titanium-950/60 border-white/[0.06] hover:border-white/[0.15] text-zinc-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Русский</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">RU</span>
              </div>
              <p className="text-xs text-zinc-400">
                Полная русская локализация и документация
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              lang === 'ru'
                ? 'bg-ghost-cyan border-ghost-cyan text-black'
                : 'border-white/[0.1] bg-white/[0.02]'
            }`}>
              {lang === 'ru' && <Check size={12} className="stroke-[3]" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              lang === 'en'
                ? 'bg-ghost-cyan/[0.08] border-ghost-cyan/50 text-white shadow-glow'
                : 'bg-titanium-950/60 border-white/[0.06] hover:border-white/[0.15] text-zinc-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">English</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">EN</span>
              </div>
              <p className="text-xs text-zinc-400">
                English UI, gaming profiles, and documentation
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              lang === 'en'
                ? 'bg-ghost-cyan border-ghost-cyan text-black'
                : 'border-white/[0.1] bg-white/[0.02]'
            }`}>
              {lang === 'en' && <Check size={12} className="stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-ghost-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.settings.secTheme}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-ghost-cyan uppercase">
            {lang === 'ru' ? 'Текущая тема:' : 'Current theme:'} {THEMES[prefs.themeId]?.name || 'Electric Cyan'}
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          {t.settings.secThemeDesc}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
            const theme = THEMES[themeKey];
            const isSelected = prefs.themeId === themeKey;
            return (
              <button
                key={themeKey}
                onClick={() => handleThemeChange(themeKey)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-24 ${
                  isSelected 
                    ? 'border-white/[0.3] bg-titanium-800 shadow-satin ring-1 ring-[var(--accent-color)]' 
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.05]'
                }`}
                style={isSelected ? { borderColor: theme.hex, boxShadow: `0 0 16px ${theme.bgSubtle}` } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.hex, boxShadow: `0 0 8px ${theme.hex}88` }}
                  />
                  {isSelected && <Check size={14} style={{ color: theme.hex }} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{theme.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{theme.tag}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-ghost-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.settings.secProfile}
            </h3>
          </div>
          {sysInfo && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{lang === 'ru' ? 'Дисплей:' : 'Display:'} {sysInfo.display_res} @ {sysInfo.refresh_rate}Hz</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-2">
              {t.settings.callsignLabel}
            </label>
            <input
              type="text"
              value={prefs.callsign}
              maxLength={16}
              onChange={(e) => updatePreference('callsign', e.target.value.toUpperCase())}
              placeholder="USER-01"
              className="w-full bg-titanium-950 border border-white/[0.08] focus:border-ghost-cyan rounded-xl px-4 py-2.5 text-xs font-mono font-bold tracking-wider text-white outline-none shadow-bezel"
            />
            <span className="text-[10px] text-zinc-500 font-mono mt-1.5 block">
              {lang === 'ru' ? 'Отображается в боковой панели.' : 'Displayed in the sidebar.'}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-2">
              {lang === 'ru' ? 'Иконка профиля:' : 'Profile Icon:'}
            </label>
            <div className="flex gap-2">
              {avatars.map((item) => {
                const Icon = item.icon;
                const isSelected = prefs.avatar === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => updatePreference('avatar', item.id)}
                        title={item.name}
                    className={`p-2.5 rounded-xl border flex-1 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-ghost-cyan bg-ghost-cyan/15 text-ghost-cyan shadow-cyan-glow'
                        : 'border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.14]'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Monitor size={15} className="text-ghost-cyan" />
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {t.settings.secDisplay}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {sysInfo 
                    ? `${lang === 'ru' ? 'Аппаратный видеоадаптер:' : 'Hardware GPU:'} ${sysInfo.gpu} (${sysInfo.display_res})` 
                    : (lang === 'ru' ? 'Считывание параметров видеоадаптера и дисплея...' : 'Probing GPU and display parameters...')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hardware-well px-3 py-1.5 rounded-lg text-right">
                <span className="text-[9px] font-mono uppercase text-zinc-500 block leading-none">{t.settings.budgetLabel}</span>
                <span className="text-xs font-mono font-bold text-ghost-cyan leading-tight">
                  {calculateFrameBudget(prefs.refreshRate)}
                </span>
              </div>

              {sysInfo?.refresh_rate && (
                <button
                  onClick={handleSyncDisplayHz}
                  disabled={syncingDisplay}
                  title={lang === 'ru' ? 'Автоматически считать текущую герцовку Windows' : 'Automatically detect Windows refresh rate'}
                  className="btn-outline text-[11px] py-1.5 px-3 flex items-center gap-1.5 font-mono"
                >
                  <RotateCw size={12} className={syncingDisplay ? "animate-spin text-ghost-cyan" : "text-ghost-cyan"} />
                  <span>{lang === 'ru' ? 'Синхронизировать' : 'Sync'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {refreshRates.map((hz) => {
              const isSelected = prefs.refreshRate === hz;
              const isDetected = sysInfo?.refresh_rate === hz;
              return (
                <button
                  key={hz}
                  onClick={() => {
                    updatePreference('refreshRate', hz);
                    localStorage.setItem('ghosttweak_custom_hz_set', 'true');
                  }}
                    className={`flex-1 min-w-[85px] py-2.5 px-3 rounded-xl text-xs font-mono font-semibold border transition-all flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-ghost-cyan/15 border-ghost-cyan text-white shadow-cyan-glow ring-1 ring-ghost-cyan'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.16] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="font-bold text-xs">{hz} Hz</span>
                  {isDetected && (
                    <span className="text-[8px] font-mono text-emerald-400 tracking-wider uppercase font-semibold mt-0.5">
                      {lang === 'ru' ? 'Текущий' : 'Current'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-ghost-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.settings.secDns}
            </h3>
          </div>
          {dnsStatus && (
            <span className="text-[11px] font-mono text-emerald-400 animate-fade-in">
              {dnsStatus}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          {t.settings.secDnsDesc}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { id: 'cloudflare', name: 'Cloudflare', ip: '1.1.1.1', label: lang === 'ru' ? 'Мин. задержка' : 'Lowest Latency' },
            { id: 'google', name: 'Google DNS', ip: '8.8.8.8', label: lang === 'ru' ? 'Стабильность' : 'High Stability' },
            { id: 'quad9', name: 'Quad9', ip: '9.9.9.9', label: lang === 'ru' ? 'Безопасность' : 'Secure DNS' },
            { id: 'dhcp', name: lang === 'ru' ? 'По умолчанию' : 'Default DHCP', ip: 'DHCP', label: lang === 'ru' ? 'Провайдер' : 'ISP Gateway' },
          ].map((item) => (
            <button
              key={item.id}
              disabled={dnsLoading}
              onClick={() => handleDnsSwitch(item.id)}
              className="hardware-well p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.18] hover:bg-titanium-800 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white">{item.name}</div>
                <div className="text-[10px] font-mono text-ghost-cyan mt-0.5">{item.ip}</div>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono mt-2 uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Software Updates Section */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-ghost-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'ru' ? 'Обновления GhostTweak' : 'Software Updates'}
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/[0.06] border border-white/10 text-ghost-cyan">
              v1.0.0
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {lang === 'ru' ? 'Канал: Релизный (Stable)' : 'Channel: Stable Release'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          {lang === 'ru'
            ? 'Проверка наличия обновлений, патчей игровых профилей и базы твиков Windows.'
            : 'Check for application updates, CS2 profile improvements, and Windows tweak patches.'}
        </p>

        <div className="p-4 rounded-xl bg-titanium-950/80 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            {updateResult ? (
              updateResult.has_update ? (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <ArrowUpCircle size={15} />
                    <span>{lang === 'ru' ? `Доступна новая версия v${updateResult.latest_version}!` : `New update v${updateResult.latest_version} available!`}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1 font-sans">
                    {updateResult.release_notes}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 size={15} />
                    <span>{lang === 'ru' ? 'У вас установлена последняя версия' : 'GhostTweak is up to date'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {updateResult.release_notes}
                  </p>
                </div>
              )
            ) : (
              <div>
                <div className="text-xs font-bold text-white">
                  {lang === 'ru' ? 'Автоматическая проверка версий' : 'Version Verification Engine'}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {lang === 'ru'
                    ? 'Нажмите кнопку для запроса информации о свежих сборках.'
                    : 'Click the button to query the release server for updates.'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {updateResult?.has_update && (
              <a
                href={updateResult.download_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold btn-accent flex items-center gap-2"
              >
                <Download size={14} />
                <span>{lang === 'ru' ? `Скачать v${updateResult.latest_version}` : `Download v${updateResult.latest_version}`}</span>
              </a>
            )}
            <button
              type="button"
              disabled={checkingUpdate}
              onClick={handleCheckUpdate}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                checkingUpdate
                  ? 'bg-white/5 border-white/10 text-zinc-500 cursor-not-allowed'
                  : 'btn-outline border-ghost-cyan/40 text-ghost-cyan hover:bg-ghost-cyan/10 hover:border-ghost-cyan'
              }`}
            >
              <RotateCw size={14} className={checkingUpdate ? 'animate-spin' : ''} />
              <span>{checkingUpdate ? (lang === 'ru' ? 'Проверка...' : 'Checking...') : (lang === 'ru' ? 'Проверить обновления' : 'Check for Updates')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border border-ghost-neon/20 bg-gradient-to-br from-ghost-neon/[0.04] to-transparent relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bug size={16} className="text-ghost-neon" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.settings.secBeta}
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-ghost-neon/20 border border-ghost-neon/40 text-ghost-neon">
              v1.0.0-beta.1
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {lang === 'ru' ? 'Сборка для тестирования' : 'Testing Release'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          {t.settings.secBetaDesc}
        </p>

        <div className="p-4 rounded-xl bg-titanium-950/80 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <FileText size={14} className="text-ghost-cyan" />
              <span>{t.settings.btnCopyDiag}</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {t.settings.btnCopyDiagDesc}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">
              {t.settings.betaFeedbackText}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyDiagnosticReport}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all flex items-center justify-center gap-2 shrink-0 ${
              copiedDiag
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow'
                : 'btn-outline border-ghost-cyan/40 text-ghost-cyan hover:bg-ghost-cyan/10 hover:border-ghost-cyan'
            }`}
          >
            {copiedDiag ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedDiag ? (lang === 'ru' ? 'Отчет скопирован!' : 'Report Copied!') : t.settings.btnCopyDiag}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
