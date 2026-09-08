import React, { useEffect, useState } from 'react';
import { 
  Loader2, ShieldCheck, AlertTriangle, Search, Zap, 
  Sliders, CheckCircle2, Shield, Lock, Activity, Globe
} from 'lucide-react';
import { invoke } from '../lib/tauri';
import { TweakInfo, ApplyResult } from '../lib/types';
import { useI18n } from '../lib/i18n';

export default function Tweaks() {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [tweaks, setTweaks] = useState<TweakInfo[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchTweaks();
  }, []);

  const fetchTweaks = async () => {
    try {
      setLoading(true);
      const data = await invoke<TweakInfo[]>('get_tweaks_status');
      setTweaks(data);
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
      setLoading(true);
      const result = await invoke<ApplyResult>('apply_all_tweaks');
      await fetchTweaks();
      if (result.applied.length > 0) {
        showNotification(lang === 'ru' ? `Успешно применено ${result.applied.length} твиков` : `Successfully applied ${result.applied.length} tweaks`, 'success');
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
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-zinc-400">{lang === 'ru' ? 'РЕЕСТР И СЛУЖБЫ' : 'REGISTRY & SERVICES'}</span>
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
          <span>{t.tweaks.btnApplyRecommended}</span>
        </button>
      </div>

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

      {/* Categories Bar & Search Input */}
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

      {/* Tweaks List */}
      <div className="flex flex-col gap-2.5">
        {filteredTweaks.map(tweak => {
          const isProcessing = processingId === tweak.id;
          return (
            <div 
              key={tweak.id} 
              className={`glass-card p-4 rounded-xl border transition-all flex items-center justify-between ${
                tweak.enabled 
                  ? 'border-white/[0.14] bg-titanium-850' 
                  : 'border-white/[0.04] bg-white/[0.01]'
              }`}
            >
              <div className="flex items-start gap-3.5 pr-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs tracking-wide">{tweak.name}</span>
                    
                    {/* Category Tag */}
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-400">
                      {tweak.category}
                    </span>

                    {tweak.risky && (
                      <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        <AlertTriangle size={10} /> {t.tweaks.badgeRisky}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{tweak.description}</p>
                </div>
              </div>

              {/* Physical Titanium Toggle Switch */}
              <button
                onClick={() => handleToggle(tweak)}
                disabled={isProcessing}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 border p-0.5 shrink-0 ${
                  tweak.enabled 
                    ? 'bg-ghost-cyan/20 border-ghost-cyan shadow-[0_0_10px_rgba(0,240,255,0.25)]' 
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

    </div>
  );
}
