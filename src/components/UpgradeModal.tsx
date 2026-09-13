import React from 'react';
import { Shield, Sparkles, Lock, X, ArrowRight, ExternalLink, Check } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { openUrl } from '../lib/tauri';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  onOpenLicenseInput?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName,
  onOpenLicenseInput,
}) => {
  const { lang } = useI18n();

  if (!isOpen) return null;

  const handleOpenPricing = () => {
    openUrl('https://ghosttweak.com/#pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-titanium-950 border border-white/10 p-6 shadow-2xl overflow-hidden page-enter"
        style={{ boxShadow: '0 0 40px rgba(0, 240, 255, 0.12)' }}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-ghost-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ghost-neon/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ghost-cyan/20 to-ghost-neon/20 border border-ghost-cyan/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <Lock className="text-ghost-cyan" size={26} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ghost-cyan/10 border border-ghost-cyan/30 text-ghost-cyan text-[11px] font-mono uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>PRO / VIP FEATURE</span>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight mb-2">
            {lang === 'ru' ? 'Функция недоступна в текущем тарифе' : 'Feature Not Available in Current Plan'}
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mb-5">
            {featureName ? (
              lang === 'ru' ? (
                <>Данная функция недоступна в вашем тарифном плане. Для модуля <span className="text-ghost-cyan font-semibold">{featureName}</span> требуется тариф PRO (24h Pass, Pro Monthly) или VIP Lifetime.</>
              ) : (
                <>This feature is not available under your current tariff plan. Module <span className="text-ghost-cyan font-semibold">{featureName}</span> requires a PRO (24h Pass, Monthly) or VIP Lifetime license.</>
              )
            ) : (
              lang === 'ru'
                ? 'Данная функция недоступна в связи с вашим текущим тарифным планом. Требуется лицензия PRO или VIP Lifetime.'
                : 'This feature is not available under your current tariff plan. A PRO or VIP Lifetime license is required.'
            )}
          </p>

          <div className="w-full bg-titanium-900/60 border border-white/5 rounded-xl p-3.5 mb-6 text-left space-y-2 text-xs">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
              {lang === 'ru' ? 'Что открывает Pro подписка:' : 'What Pro unlocks:'}
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>{lang === 'ru' ? 'Таймер ядра 0.5 мс и DPC-приоритизация' : '0.5ms kernel timer resolution & DPC priority'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>{lang === 'ru' ? 'Очистка шейдеров DirectX, NVIDIA и AMD' : 'DirectX, NVIDIA & AMD shader cache flush'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>{lang === 'ru' ? 'CS2 Game Optimizer и готовые профили' : 'CS2 Game Optimizer & competitive profiles'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>{lang === 'ru' ? '24h Pass (149 ₽), подписка (790 ₽) или навсегда (1 490 ₽)' : '24h Pass ($1.99), monthly ($9.99) or lifetime ($19)'}</span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={() => {
                onClose();
                if (onOpenLicenseInput) {
                  onOpenLicenseInput();
                } else {
                  window.dispatchEvent(new CustomEvent('ghosttweak:open-license-modal'));
                }
              }}
              className="btn-cyan w-full py-2.5 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-cyan-glow cursor-pointer"
            >
              <Shield size={14} />
              <span>{lang === 'ru' ? 'Активировать лицензионный ключ' : 'Activate License Key'}</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={handleOpenPricing}
              className="btn-outline w-full py-2 text-xs flex items-center justify-center gap-1.5 text-zinc-400 hover:text-white cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>{lang === 'ru' ? 'Выбрать тариф на сайте' : 'View Plans on Website'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
