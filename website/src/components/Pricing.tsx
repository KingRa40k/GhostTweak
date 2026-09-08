'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Crown, 
  ExternalLink,
  Coins
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export type Currency = 'RUB' | 'USD' | 'EUR';

interface PriceInfo {
  amount: string;
  periodRu: string;
  periodEn: string;
}

interface TierDefinition {
  id: string;
  name: string;
  badgeRu?: string;
  badgeEn?: string;
  prices: Record<Currency, PriceInfo>;
  descriptionRu: string;
  descriptionEn: string;
  isPopular?: boolean;
  featuresRu: { text: string; included: boolean; highlight?: boolean }[];
  featuresEn: { text: string; included: boolean; highlight?: boolean }[];
  ctaTextRu: string;
  ctaTextEn: string;
  ctaAction: string;
}

const TIERS_DATA: TierDefinition[] = [
  {
    id: 'free',
    name: 'Community Edition',
    prices: {
      RUB: { amount: '0 ₽', periodRu: 'бесплатно навсегда', periodEn: 'free forever' },
      USD: { amount: '$0', periodRu: 'бесплатно навсегда', periodEn: 'free forever' },
      EUR: { amount: '0 €', periodRu: 'бесплатно навсегда', periodEn: 'free forever' },
    },
    descriptionRu: 'Базовые инструменты для очистки временных файлов и ручного сброса кэша памяти.',
    descriptionEn: 'Essential tools for temporary file cleaning and manual RAM working-set purging.',
    featuresRu: [
      { text: 'Очистка пользовательских и системных Temp файлов', included: true },
      { text: 'Сброс кэша оперативной памяти (RAM)', included: true },
      { text: 'Отключение фоновой записи GameDVR', included: true },
      { text: 'Локальные .reg бэкапы перед изменениями', included: true },
      { text: 'Настройка системного таймера (0.5 мс)', included: false },
      { text: 'Очистка кэша шейдеров DirectX и видеокарт', included: false },
      { text: 'Готовые сценарные профили', included: false },
      { text: 'Приоритетные обновления', included: false },
    ],
    featuresEn: [
      { text: 'Clean user and system Temp files', included: true },
      { text: 'RAM standby list working-set flush', included: true },
      { text: 'Disable background GameDVR recording', included: true },
      { text: 'Local atomic .reg backups before modifications', included: true },
      { text: 'System kernel timer tuning (0.5 ms)', included: false },
      { text: 'DirectX, NVIDIA & AMD shader cache flush', included: false },
      { text: 'Pre-configured scenario profiles', included: false },
      { text: 'Priority technical updates', included: false },
    ],
    ctaTextRu: 'Скачать бесплатно',
    ctaTextEn: 'Download Free',
    ctaAction: '#download',
  },
  {
    id: 'pro',
    name: 'Pro Operator',
    badgeRu: 'ПОЛНАЯ ВЕРСИЯ',
    badgeEn: 'FULL VERSION',
    isPopular: true,
    prices: {
      RUB: { amount: '1 490 ₽', periodRu: 'разовый платеж • вечная лицензия', periodEn: 'one-time payment • lifetime license' },
      USD: { amount: '$19', periodRu: 'разовый платеж • вечная лицензия', periodEn: 'one-time payment • lifetime license' },
      EUR: { amount: '18 €', periodRu: 'разовый платеж • вечная лицензия', periodEn: 'one-time payment • lifetime license' },
    },
    descriptionRu: 'Полный доступ ко всем модулям оптимизации, таймерам ядра и сценарным профилям.',
    descriptionEn: 'Full access to all optimization modules, kernel timers, and scenario tuning presets.',
    featuresRu: [
      { text: 'Все возможности Community Edition', included: true },
      { text: 'Настройка системного таймера (0.5 мс)', included: true, highlight: true },
      { text: 'Очистка кэша шейдеров DirectX, NVIDIA и AMD', included: true, highlight: true },
      { text: '4 готовых сценарных профиля', included: true },
      { text: 'Создание и восстановление .reg бэкапов в 1 клик', included: true },
      { text: 'Синхронизация с частотой экрана (EDID)', included: true },
      { text: 'Лицензия на 3 личных компьютера', included: true },
      { text: 'Все будущие обновления включены', included: true },
    ],
    featuresEn: [
      { text: 'All Community Edition capabilities', included: true },
      { text: 'High-resolution kernel timer (0.5 ms)', included: true, highlight: true },
      { text: 'DirectX, NVIDIA & AMD shader cache purge', included: true, highlight: true },
      { text: '4 ready-to-use scenario profiles', included: true },
      { text: '1-click .reg backup creation and restore', included: true },
      { text: 'Hardware EDID refresh rate sync', included: true },
      { text: 'Personal license for up to 3 PCs', included: true },
      { text: 'All future updates included', included: true },
    ],
    ctaTextRu: 'Купить Pro',
    ctaTextEn: 'Buy Pro',
    ctaAction: '#checkout',
  },
  {
    id: 'club',
    name: 'Cyber Club & LAN',
    badgeRu: 'ДЛЯ КЛУБОВ И АРЕН',
    badgeEn: 'FOR CLUBS & ARENAS',
    prices: {
      RUB: { amount: '19 900 ₽', periodRu: 'разовый платеж • без ограничений', periodEn: 'one-time payment • unlimited access' },
      USD: { amount: '$199', periodRu: 'разовый платеж • без ограничений', periodEn: 'one-time payment • unlimited access' },
      EUR: { amount: '189 €', periodRu: 'разовый платеж • без ограничений', periodEn: 'one-time payment • unlimited access' },
    },
    descriptionRu: 'Лицензия для компьютерных клубов, киберарен и локальных сетей с поддержкой тихой установки.',
    descriptionEn: 'License for cyber cafes, esports arenas, and LAN centers with silent installer support.',
    featuresRu: [
      { text: 'Все возможности Pro для парка ПК клуба', included: true },
      { text: 'Тихая установка (--silent --preset=esports)', included: true, highlight: true },
      { text: 'Поддержка бездисковых систем и PXE-образов', included: true },
      { text: 'Защита настроек мастер-паролем администратора', included: true },
      { text: 'Прямой контакт с инженерами поддержки', included: true },
      { text: 'Предоставление закрывающих документов', included: true },
    ],
    featuresEn: [
      { text: 'All Pro capabilities for your venue PC fleet', included: true },
      { text: 'Silent installation (--silent --preset=esports)', included: true, highlight: true },
      { text: 'Diskless boot & PXE netboot image support', included: true },
      { text: 'Master administrator password protection', included: true },
      { text: 'Direct line to technical support engineers', included: true },
      { text: 'Official commercial billing & invoices', included: true },
    ],
    ctaTextRu: 'Запросить для клуба',
    ctaTextEn: 'Request for Club',
    ctaAction: 'https://t.me/ghosttweak_support',
  },
];

export const Pricing: React.FC = () => {
  const { t, lang } = useI18n();
  const [currency, setCurrency] = useState<Currency>(lang === 'ru' ? 'RUB' : 'USD');
  const [isPriceAnimating, setIsPriceAnimating] = useState(false);

  // Automatically adapt currency when language changes
  useEffect(() => {
    setCurrency(lang === 'ru' ? 'RUB' : 'USD');
  }, [lang]);

  const handleCurrencyChange = (newCurr: Currency) => {
    if (newCurr === currency) return;
    setIsPriceAnimating(true);
    setCurrency(newCurr);
    setTimeout(() => setIsPriceAnimating(false), 300);
  };

  return (
    <section id="pricing" className="relative py-28 border-t border-white/[0.06] overflow-hidden">
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none rounded-full blur-[160px] opacity-10"
        style={{ backgroundColor: 'var(--accent-color)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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

          {/* Interactive Currency Switcher */}
          <div className="mt-8 inline-flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-inner">
            <span className="text-[11px] font-mono text-slate-400 px-2.5 flex items-center gap-1.5 uppercase font-medium">
              <Coins className="w-3.5 h-3.5 text-accent" />
              {lang === 'ru' ? 'Валюта:' : 'Currency:'}
            </span>
            {(['RUB', 'USD', 'EUR'] as Currency[]).map((curr) => {
              const active = currency === curr;
              const symbols: Record<Currency, string> = { RUB: '₽ RUB', USD: '$ USD', EUR: '€ EUR' };
              return (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-200 ${
                    active
                      ? 'bg-white text-black shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {symbols[curr]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Columns Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {TIERS_DATA.map((tier) => {
            const priceData = tier.prices[currency];
            const badge = lang === 'ru' ? tier.badgeRu : tier.badgeEn;
            const description = lang === 'ru' ? tier.descriptionRu : tier.descriptionEn;
            const period = lang === 'ru' ? priceData.periodRu : priceData.periodEn;
            const features = lang === 'ru' ? tier.featuresRu : tier.featuresEn;
            const ctaText = lang === 'ru' ? tier.ctaTextRu : tier.ctaTextEn;

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
                {badge && (
                  <div 
                    className="absolute top-0 right-0 px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest rounded-bl-lg border-l border-b"
                    style={{
                      backgroundColor: 'var(--accent-bg-subtle)',
                      borderColor: 'var(--accent-border)',
                      color: 'var(--accent-color)',
                    }}
                  >
                    {badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans min-h-[36px] mb-6">
                    {description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-mono text-3xl sm:text-4xl font-black text-white transition-all duration-300 ${
                        isPriceAnimating ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                      }`}>
                        {priceData.amount}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block mt-1">
                      {period}
                    </span>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 mb-8">
                    {features.map((feat, fIdx) => (
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
                    <span>{ctaText}</span>
                    {tier.id === 'club' ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                  </a>

                  <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-mono text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'ru' ? '30 дней на возврат средств' : '30-day money-back guarantee'}</span>
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
