'use client';

import React from 'react';
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Crown, 
  ExternalLink
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  price: string;
  period: string;
  description: string;
  isPopular?: boolean;
  features: { text: string; included: boolean; highlight?: boolean }[];
  ctaText: string;
  ctaAction: string;
}

const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Community Edition',
    price: '0 ₽',
    period: 'бесплатно навсегда',
    description: 'Базовые инструменты для очистки временных файлов и ручного сброса кэша памяти.',
    features: [
      { text: 'Очистка пользовательских и системных Temp файлов', included: true },
      { text: 'Сброс кэша оперативной памяти (RAM)', included: true },
      { text: 'Отключение фоновой записи GameDVR', included: true },
      { text: 'Локальные .reg бэкапы перед изменениями', included: true },
      { text: 'Настройка системного таймера (0.5 мс)', included: false },
      { text: 'Очистка кэша шейдеров DirectX и видеокарт', included: false },
      { text: 'Готовые сценарные профили', included: false },
      { text: 'Приоритетные обновления', included: false },
    ],
    ctaText: 'Скачать бесплатно',
    ctaAction: '#download',
  },
  {
    id: 'pro',
    name: 'Pro Operator',
    badge: 'ПОЛНАЯ ВЕРСИЯ',
    price: '1 490 ₽',
    period: 'разовый платеж • вечная лицензия',
    description: 'Полный доступ ко всем модулям оптимизации, таймерам ядра и сценарным профилям.',
    isPopular: true,
    features: [
      { text: 'Все возможности Community Edition', included: true },
      { text: 'Настройка системного таймера (0.5 мс)', included: true, highlight: true },
      { text: 'Очистка кэша шейдеров DirectX, NVIDIA и AMD', included: true, highlight: true },
      { text: '4 готовых сценарных профиля', included: true },
      { text: 'Создание и восстановление .reg бэкапов в 1 клик', included: true },
      { text: 'Синхронизация с частотой экрана (EDID)', included: true },
      { text: 'Лицензия на 3 личных компьютера', included: true },
      { text: 'Все будущие обновления включены', included: true },
    ],
    ctaText: 'Купить Pro',
    ctaAction: '#checkout',
  },
  {
    id: 'club',
    name: 'Cyber Club & LAN',
    badge: 'ДЛЯ КЛУБОВ И АРЕН',
    price: '19 900 ₽',
    period: 'разовый платеж • без ограничений',
    description: 'Лицензия для компьютерных клубов, киберарен и локальных сетей с поддержкой тихой установки.',
    features: [
      { text: 'Все возможности Pro для парка ПК клуба', included: true },
      { text: 'Тихая установка (--silent --preset=esports)', included: true, highlight: true },
      { text: 'Поддержка бездисковых систем и PXE-образов', included: true },
      { text: 'Защита настроек мастер-паролем администратора', included: true },
      { text: 'Прямой контакт с инженерами поддержки', included: true },
      { text: 'Предоставление закрывающих документов', included: true },
    ],
    ctaText: 'Запросить для клуба',
    ctaAction: 'https://t.me/ghosttweak_support',
  },
];

import { useI18n } from '@/lib/i18n';

export const Pricing: React.FC = () => {
  const { t } = useI18n();

  return (
    <section id="pricing" className="relative py-28 border-t border-white/[0.06] overflow-hidden">
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none rounded-full blur-[160px] opacity-10"
        style={{ backgroundColor: 'var(--accent-color)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/[0.03] backdrop-blur-md mb-4">
            <Crown className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
              {t.pricing.tag}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            {t.pricing.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* 3 Columns Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {TIERS.map((tier) => {
            return (
              <div
                key={tier.id}
                className={`rounded-2xl flex flex-col justify-between p-7 sm:p-8 transition-all relative overflow-hidden border ${
                  tier.isPopular
                    ? 'border-white/30 bg-[#10131C] shadow-2xl scale-[1.02] z-20'
                    : 'border-white/[0.08] bg-[#0C0E14] hover:border-white/15'
                }`}
                style={{
                  borderColor: tier.isPopular ? 'var(--accent-border)' : undefined,
                }}
              >
                {/* Popular Badge */}
                {tier.badge && (
                  <div 
                    className="absolute top-0 right-0 px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest rounded-bl-lg border-l border-b"
                    style={{
                      backgroundColor: 'var(--accent-bg-subtle)',
                      borderColor: 'var(--accent-border)',
                      color: 'var(--accent-color)',
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans min-h-[36px] mb-6">
                    {tier.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl sm:text-4xl font-black text-white">
                        {tier.price}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block mt-1">
                      {tier.period}
                    </span>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 mb-8">
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 text-xs">
                        <div className="mt-0.5 shrink-0">
                          {feat.included ? (
                            <Check 
                              className="w-4 h-4" 
                              style={{ color: feat.highlight ? 'var(--accent-color)' : '#10B981' }} 
                            />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-700 mx-auto mt-0.5" />
                          )}
                        </div>
                        <span 
                          className={`font-sans leading-tight ${
                            feat.included 
                              ? feat.highlight 
                                ? 'text-white font-semibold' 
                                : 'text-slate-300' 
                              : 'text-slate-600 line-through'
                          }`}
                        >
                          {feat.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <a
                    href={tier.ctaAction}
                    className={`w-full py-3.5 px-6 rounded-lg font-mono text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 transition-all ${
                      tier.isPopular
                        ? 'btn-accent'
                        : 'bg-white/[0.05] hover:bg-white/10 text-white border border-white/10 active:scale-[0.98]'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    {tier.id === 'club' ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                  </a>

                  <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-mono text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>30 дней на возврат средств</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
