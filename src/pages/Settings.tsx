import React, { useState, useEffect } from 'react';
import { 
  Palette, User, Monitor, Globe, Check, 
  Sparkles, Shield, Cpu, Zap, Ghost, 
  Crosshair, Crown, Flame, RotateCw, CheckCircle2
} from 'lucide-react';
import { 
  getPreferences, savePreferences, THEMES, ThemeId, 
  AvatarId, calculateFrameBudget 
} from '../lib/theme';
import { invoke } from '../lib/tauri';
import { SystemInfo } from '../lib/types';
import { useI18n, Language, setStoredLanguage } from '../lib/i18n';

export default function Settings() {
  const { t, lang } = useI18n();
  const [prefs, setPrefs] = useState(getPreferences());
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [dnsStatus, setDnsStatus] = useState<string | null>(null);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [syncingDisplay, setSyncingDisplay] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    setStoredLanguage(newLang);
    showToast(newLang === 'ru' ? 'Язык изменен на Русский' : 'Language switched to English');
  };

  useEffect(() => {
    // Probe real display hardware parameters from Windows
    invoke<SystemInfo>('get_system_info')
      .then((info) => {
        setSysInfo(info);
        if (info.refresh_rate && info.refresh_rate > 0) {
          const currentPrefs = getPreferences();
          // If current rate is unset or exceeds what the monitor physically supports, clamp it
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

  // Filter and show ONLY rates that are physically supported by the monitor
  const detectedRate = sysInfo?.refresh_rate || 60;
  const supportedModes = (sysInfo?.available_refresh_rates && sysInfo.available_refresh_rates.length > 0)
    ? sysInfo.available_refresh_rates
    : [60, 75, 100, 120, 144, 165, 180, 240, 360].filter(hz => hz <= detectedRate);

  // Guarantee only physically available rates up to the monitor's limit are selectable
  const refreshRates = Array.from(
    new Set(supportedModes.filter(hz => hz <= detectedRate && hz >= 50))
  ).sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-6 page-enter pb-12 w-full max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-zinc-400">{lang === 'ru' ? 'ПЕРСОНАЛИЗАЦИЯ' : 'PERSONALIZATION'}</span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-ghost-cyan">
              <Sparkles size={13} />
              {lang === 'ru' ? 'Кастомизация среды' : 'Environment Setup'}
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

      {/* SECTION: LANGUAGE SELECTION */}
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
          {/* Russian */}
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

          {/* English */}
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

      {/* SECTION 1: ACCENT COLOR THEMES */}
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

      {/* SECTION 2: OPERATOR CALLSIGN & HARDWARE MONITOR SYNC */}
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
          {/* Callsign Input */}
          <div>
            <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-2">
              {t.settings.callsignLabel}
            </label>
            <input
              type="text"
              value={prefs.callsign}
              maxLength={16}
              onChange={(e) => updatePreference('callsign', e.target.value.toUpperCase())}
              placeholder="OPERATOR-01"
              className="w-full bg-titanium-950 border border-white/[0.08] focus:border-ghost-cyan rounded-xl px-4 py-2.5 text-xs font-mono font-bold tracking-wider text-white outline-none shadow-bezel"
            />
            <span className="text-[10px] text-zinc-500 font-mono mt-1.5 block">
              {lang === 'ru' ? 'Отображается в сайдбаре, на панели управления и в отчетах реестра.' : 'Displayed in sidebar, dashboard headers, and registry backups.'}
            </span>
          </div>

          {/* Avatar Insignia Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-2">
              {lang === 'ru' ? 'Тактическая эмблема:' : 'Tactical Insignia:'}
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

        {/* Real Monitor Hardware Detection & Frame Time Budget */}
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

      {/* SECTION 3: GAMING LOW-LATENCY DNS SWITCHER */}
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

    </div>
  );
}
