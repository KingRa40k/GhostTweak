import React from 'react';
import { Lock, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface PlanRestrictionBannerProps {
  featureName: string;
  onUnlock?: () => void;
  className?: string;
}

export const PlanRestrictionBanner: React.FC<PlanRestrictionBannerProps> = ({
  featureName,
  onUnlock,
  className = '',
}) => {
  const { lang } = useI18n();

  const handleAction = () => {
    if (onUnlock) {
      onUnlock();
    } else {
      window.dispatchEvent(new CustomEvent('ghosttweak:open-upgrade-modal', {
        detail: { feature: featureName }
      }));
    }
  };

  return (
    <div 
      className={`rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-4 sm:p-5 shadow-lg relative overflow-hidden ${className}`}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Lock size={18} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {lang === 'ru' ? 'Ограничение тарифа' : 'Plan Restricted'}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {lang === 'ru' ? 'Текущий план: Community (Базовый)' : 'Current Plan: Community (Free)'}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight">
              {lang === 'ru'
                ? 'Данная функция недоступна в связи с вашим тарифным планом'
                : 'This feature is not available under your current tariff plan'}
            </h4>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-2xl">
              {lang === 'ru' ? (
                <>
                  Для использования модуля <span className="text-amber-300 font-semibold">{featureName}</span> требуется тарифный план <span className="text-white font-semibold">PRO</span> (24h Pass, Месячная подписка) или вечная лицензия <span className="text-white font-semibold">VIP Lifetime</span>.
                </>
              ) : (
                <>
                  The module <span className="text-amber-300 font-semibold">{featureName}</span> requires a <span className="text-white font-semibold">PRO</span> plan (24h Pass, Monthly Subscription) or a permanent <span className="text-white font-semibold">VIP Lifetime</span> license.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAction}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 shrink-0 cursor-pointer"
        >
          <Sparkles size={13} className="text-zinc-950" />
          <span>{lang === 'ru' ? 'Сменить тарифный план' : 'Change Tariff Plan'}</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default PlanRestrictionBanner;
