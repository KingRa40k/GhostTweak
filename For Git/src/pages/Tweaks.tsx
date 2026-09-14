import React, { useEffect, useState } from 'react';
import { 
  Loader2, ShieldCheck, AlertTriangle, Search, Zap, 
  Sliders, CheckCircle2, Shield, Lock, Activity, Globe, Laptop, Cpu
} from 'lucide-react';
import { invoke } from '../lib/tauri';
import { TweakInfo, ApplyResult, HardwareTierInfo } from '../lib/types';
import { useI18n } from '../lib/i18n';
import { getStoredLicense, isProLicense, LicenseData } from '../lib/license';
import UpgradeModal from '../components/UpgradeModal';

interface TweaksProps {
  license?: LicenseData | null;
}

export default function Tweaks({ license: propLicense }: TweaksProps = {}) {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [tweaks, setTweaks] = useState<TweakInfo[]>([]);
  const [hwTier, setHwTier] = useState<HardwareTierInfo | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const isPro = isProLicense(propLicense || getStoredLicense());

  const PRO_TWEAK_CATEGORIES = new Set(['network', 'latency', 'kernel']);
  const PRO_TWEAK_IDS = new Set([
    'optimize_network',
    'disable_nagle',
    'network_throttling',
    'system_responsiveness',
    'disable_diagtrack',
    'hpet_disable',
    'bcd_submillisecond',
    'kernel_timer_resolution',
    'gpu_priority_scheduler',
    'disable_memory_compression',
    'disable_paging_executive'
  ]);
  const isProTweak = (t: TweakInfo) => PRO_TWEAK_CATEGORIES.has(t.category) || PRO_TWEAK_IDS.has(t.id);

  useEffect(() => {
    fetchTweaks();
  }, []);

  const fetchTweaks = async () => {
    try {
      setLoading(true);
      const [tweaksData, tierData] = await Promise.all([
        invoke<TweakInfo[]>('get_tweaks_status'),
        invoke<HardwareTierInfo>('detect_hardware_tier').catch(() => null)
      ]);
      setTweaks(tweaksData);
      if (tierData) {
        setHwTier(tierData);
      }
    } catch {
      showNotification(lang === 'ru' ? 'Не удалось загрузить реестровые твики.' : 'Failed to load registry tweaks.', 'error');
      setTweaks([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggle = async (tweak: TweakInfo) => {
    try {
      if (!isPro && isProTweak(tweak)) {
        setUpgradeFeature(tweak.name);
        setShowUpgradeModal(true);
        return;
      }

      const isRestricted = hwTier?.restricted_tweaks.includes(tweak.id);
      if (isRestricted && !tweak.enabled) {
        const warnMsg = hwTier?.ram_constrained && (tweak.id === 'disable_memory_compression' || tweak.id === 'disable_paging_executive')
          ? (lang === 'ru'
              ? `Внимание: на вашем устройстве установлено ${hwTier.ram_gb.toFixed(1)} ГБ ОЗУ.\n\nОтключение сжатия или кэша ядра Windows перегрузит оперативную память и может привести к зависаниям в играх.\n\nВы действительно хотите включить этот параметр?`
              : `Warning: your device has ${hwTier.ram_gb.toFixed(1)} GB RAM.\n\nDisabling compression or kernel caching will increase RAM usage and may cause stuttering in games.\n\nAre you sure you want to enable this tweak?`)
          : (lang === 'ru'
              ? `Внимание: данный твик не рекомендуется для вашей конфигурации оборудования (${hwTier?.tier_label || 'ноутбук / бюджетный ПК'}).\n\nВы уверены, что хотите включить его?`
              : `Warning: this tweak is not recommended for your hardware configuration (${hwTier?.tier_label || 'laptop / budget PC'}).\n\nAre you sure you want to enable it?`);

        if (!window.confirm(warnMsg)) {
          return;
        }
      }

      setProcessingId(tweak.id);
      const newStatus = !tweak.enabled;
      await invoke<boolean>('apply_tweak', { tweakId: tweak.id, enable: newStatus });
      setTweaks(prev => prev.map(t => t.id === tweak.id ? { ...t, enabled: newStatus } : t));
      showNotification(`${tweak.name}: ${newStatus ? t.tweaks.toastApplied : t.tweaks.toastReverted}`, 'success');
    } catch {
      showNotification(lang === 'ru' ? 'Ошибка применения настройки' : 'Error applying tweak', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const applyRecommended = async () => {
    try {
      const isAdmin = await invoke<boolean>('is_admin_elevated').catch(() => true);
      if (!isAdmin) {
        const proceed = window.confirm(
          lang === 'ru'
            ? 'Для применения всех твиков системы требуются права администратора. Перезапустить приложение от имени администратора прямо сейчас?'
            : 'Administrator privileges are required to apply all tweaks. Relaunch as administrator now?'
        );
        if (proceed) {
          await invoke('restart_as_admin');
        }
        return;
      }

      setLoading(true);
      if (hwTier?.is_weak_pc || hwTier?.ram_constrained) {
        await invoke('apply_safe_lowspec_profile');
        await fetchTweaks();
        showNotification(
          lang === 'ru'
            ? 'Применен безопасный профиль: ОЗУ разгружена, опасные твики заблокированы'
            : 'Safe low-spec profile applied: RAM relieved, dangerous tweaks skipped',
          'success'
        );
      } else {
        const result = await invoke<ApplyResult>('apply_all_tweaks');
        await fetchTweaks();
        if (result.applied.length > 0) {
          showNotification(lang === 'ru' ? `Успешно применено ${result.applied.length} твиков` : `Successfully applied ${result.applied.length} tweaks`, 'success');
        }
      }
    } catch {
      showNotification(lang === 'ru' ? 'Ошибка применения пакета твиков' : 'Error applying tweak package', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: t.tweaks.tabAll, icon: Sliders },
    { id: 'gaming', label: t.tweaks.tabGaming, icon: Zap },
    { id: 'performance', label: t.tweaks.tabPerformance, icon: Activity },
    { id: 'network', label: t.tweaks.tabNetwork, icon: Globe },
    { id: 'privacy', label: t.tweaks.tabPrivacy, icon: Lock },
  ];

  const filteredTweaks = tweaks.filter(tweak => {
    const matchesCat = activeCategory === 'all' || tweak.category === activeCategory;
    const matchesSearch = tweak.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tweak.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const appliedCount = tweaks.filter(t => t.enabled).length;

  return (
    <div className="flex flex-col gap-5 page-enter pb-16 w-full max-w-6xl mx-auto">
      
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-zinc-400">{lang === 'ru' ? 'Реестр и службы' : 'Registry & Services'}</span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-ghost-cyan">
              {lang === 'ru' ? `Активно: ${appliedCount} из ${tweaks.length}` : `Active: ${appliedCount} of ${tweaks.length}`}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.tweaks.title}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t.tweaks.desc}
          </p>
        </div>

        <button 
          onClick={applyRecommended}
          disabled={loading}
          className="btn-cyan px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-cyan-glow"
        >
          <ShieldCheck size={16} />
          <span>
            {hwTier?.is_weak_pc || hwTier?.ram_constrained
              ? (lang === 'ru' ? 'Безопасный профиль' : 'Safe Low-Spec Profile')
              : t.tweaks.btnApplyRecommended}
          </span>
        </button>
      </div>

      {hwTier && (hwTier.is_weak_pc || hwTier.is_laptop || hwTier.ram_constrained) && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {hwTier.is_laptop ? (
              <Laptop size={20} className="text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Cpu size={20} className="text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">
                  {t.dashboard.hwBudgetBannerTitle} ({hwTier.tier_label})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {hwTier.ram_gb.toFixed(1)} GB RAM • {hwTier.gpu_name}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-3xl">
                {t.dashboard.hwBudgetBannerDesc}
              </p>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className={`p-3 rounded-xl border text-xs font-mono animate-fade-in flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/[0.08] border-rose-500/20 text-rose-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          <span>{notification.msg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex gap-1.5 bg-white/[0.02] p-1 rounded-xl border border-white/[0.06] w-full md:w-auto">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected 
                    ? 'bg-white/[0.1] text-white border border-white/[0.1] shadow-sm' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={13} className={isSelected ? 'text-ghost-cyan' : 'text-zinc-500'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.tweaks.searchPlaceholder}
            className="w-full bg-titanium-950 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none"
          />
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {filteredTweaks.map(tweak => {
          const isProcessing = processingId === tweak.id;
          const isRestricted = hwTier?.restricted_tweaks.includes(tweak.id);
          const isRecommended = hwTier?.recommended_tweaks.includes(tweak.id);

          return (
            <div 
              key={tweak.id} 
              className={`glass-card p-4 rounded-xl border transition-all flex items-center justify-between ${
                tweak.enabled 
                  ? 'border-white/[0.14] bg-titanium-850' 
                  : isRestricted
                    ? 'border-rose-500/10 bg-rose-950/[0.03]'
                    : 'border-white/[0.04] bg-white/[0.01]'
              }`}
            >
              <div className="flex items-start gap-3.5 pr-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-xs tracking-wide">{tweak.name}</span>
                    
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-400">
                      {tweak.category}
                    </span>

                    {isRestricted && (
                      <span className="text-[9px] font-mono text-rose-400 flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20" title={t.dashboard.whyRestrictedRamDesc}>
                        <Lock size={10} /> {t.dashboard.restrictedBadge}
                      </span>
                    )}

                    {!isPro && isProTweak(tweak) && (
                      <span className="text-[9px] font-mono font-bold text-ghost-neon flex items-center gap-1 bg-ghost-neon/15 px-1.5 py-0.5 rounded border border-ghost-neon/30">
                        <Lock size={10} /> PRO
                      </span>
                    )}

                    {!isRestricted && isRecommended && (
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <ShieldCheck size={10} /> {t.dashboard.recommendedBadge}
                      </span>
                    )}

                    {tweak.risky && !isRestricted && (
                      <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        <AlertTriangle size={10} /> {t.tweaks.badgeRisky}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{tweak.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleToggle(tweak)}
                disabled={isProcessing}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 border p-0.5 shrink-0 ${
                  tweak.enabled 
                    ? 'bg-ghost-cyan/20 border-ghost-cyan shadow-[0_0_10px_rgba(0,240,255,0.25)]' 
                    : !isPro && isProTweak(tweak)
                    ? 'bg-titanium-950 border-ghost-neon/30 opacity-70'
                    : 'bg-titanium-950 border-white/[0.1]'
                }`}
              >
                <div 
                  className={`w-4.5 h-4.5 rounded-full transition-all duration-200 ${
                    tweak.enabled 
                      ? 'translate-x-6 bg-ghost-cyan' 
                      : 'translate-x-0 bg-zinc-600'
                  }`}
                />
              </button>
            </div>
          );
        })}

        {filteredTweaks.length === 0 && !loading && (
          <div className="text-center p-8 text-zinc-500 border border-dashed border-white/[0.06] rounded-xl font-mono text-xs">
            {lang === 'ru' ? 'Твики по заданному фильтру не найдены.' : 'No tweaks found matching the filter.'}
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={upgradeFeature}
      />

    </div>
  );
}
