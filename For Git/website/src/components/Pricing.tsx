'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Coins,
  Sparkles,
  Trophy,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { CheckoutModal, CheckoutTierInfo } from './CheckoutModal';

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

// Group 1: Permanent Licenses (3 wide cards)
const LIFETIME_TIERS: TierDefinition[] = [
  {
    id: 'free',
    name: 'Community Edition',
    badgeRu: 'OPEN SOURCE BASE',
    badgeEn: 'OPEN SOURCE BASE',
    prices: {
      RUB: { amount: '0 ₽', periodRu: 'бесплатно навсегда', periodEn: 'free forever' },
      USD: { amount: '$0', periodRu: 'бесплатно навсегда', periodEn: 'free forever' },
      EUR: { amount: '0 €', periodRu: 'бесплатно навсегда', periodEn: 'free forever' },
    },
    descriptionRu: 'Базовый набор инструментов для очистки временных файлов и ручного сброса кэша памяти.',
    descriptionEn: 'Essential tools for temporary file cleaning and manual RAM working-set purging.',
    featuresRu: [
      { text: 'Оптимизация CS2, Valorant, Apex & Dota 2 (базовая калибровка)', included: true },
      { text: 'Киберспортивный профиль Esports и тихий профиль Quiet', included: true },
      { text: 'Очистка памяти Standby List и временных файлов Temp', included: true },
      { text: 'Базовые системные твики реестра и отключение GameDVR', included: true },
      { text: 'Локальные .reg бэкапы перед изменениями', included: true },
      { text: 'Экстремальный Match Turbo с фиксацией таймера 0.5 мс', included: false },
      { text: 'Smart Throttle (заморозка фоновых Discord/браузеров)', included: false },
      { text: 'Глубокая очистка кэша шейдеров DirectX, NVIDIA & AMD', included: false },
      { text: 'Профили AAA Cinematic и Streamer Studio (OBS QoS)', included: false },
    ],
    featuresEn: [
      { text: 'CS2, Valorant, Apex & Dota 2 core calibration', included: true },
      { text: 'Esports competitive profile & Quiet desktop mode', included: true },
      { text: 'RAM standby list working-set flush & Temp cleanup', included: true },
      { text: 'Core Windows latency tweaks & GameDVR disable', included: true },
      { text: 'Local atomic .reg backups before modifications', included: true },
      { text: 'Extreme Match Turbo with 0.5ms timer lock', included: false },
      { text: 'Smart Throttle (background Discord & browser freeze)', included: false },
      { text: 'DirectX, NVIDIA & AMD shader cache flush', included: false },
      { text: 'AAA Cinematic & Streamer Studio (OBS QoS) profiles', included: false },
    ],
    ctaTextRu: 'Скачать бинарник',
    ctaTextEn: 'Download Binary',
    ctaAction: '#download',
  },
  {
    id: 'pro',
    name: 'VIP Lifetime',
    badgeRu: 'ФЛАГМАН • ВЕЧНЫЙ ДОСТУП',
    badgeEn: 'FLAGSHIP • LIFETIME',
    isPopular: true,
    prices: {
      RUB: { amount: '1 490 ₽', periodRu: 'разовый платеж • навсегда', periodEn: 'one-time payment • forever' },
      USD: { amount: '$19', periodRu: 'one-time payment • lifetime', periodEn: 'one-time payment • lifetime' },
      EUR: { amount: '18 €', periodRu: 'one-time payment • lifetime', periodEn: 'one-time payment • lifetime' },
    },
    descriptionRu: 'Полный инженерный арсенал GhostTweak. Максимальное снижение инпут-лага и стабильный фреймтайм.',
    descriptionEn: 'Complete GhostTweak engineering suite. Lowest input latency, peak 1% low FPS and zero bloat.',
    featuresRu: [
      { text: 'Все возможности Community Edition', included: true },
      { text: 'Экстремальный Match Turbo & фиксация таймера 0.500 мс', included: true, highlight: true },
      { text: 'Smart Throttle фоновых процессов (Discord, браузеры)', included: true, highlight: true },
      { text: 'Очистка шейдеров DirectX, NVIDIA GLCache & AMD DxCache', included: true, highlight: true },
      { text: 'Соревновательные профили AAA Cinematic & Streamer Studio', included: true, highlight: true },
      { text: 'Глубокая калибровка IFEO и очередей процессора', included: true, highlight: true },
      { text: 'Синхронизация с частотой экрана (EDID Refresh)', included: true },
      { text: 'Пожизненные обновления и приоритетная поддержка', included: true },
    ],
    featuresEn: [
      { text: 'All Community Edition capabilities included', included: true },
      { text: 'Extreme Match Turbo & 0.500ms hardware timer lock', included: true, highlight: true },
      { text: 'Smart Throttle dynamic background suppression', included: true, highlight: true },
      { text: 'DirectX, NVIDIA & AMD GPU shader cache purge', included: true, highlight: true },
      { text: 'AAA Cinematic & Streamer Studio profiles', included: true, highlight: true },
      { text: 'Deep IFEO priority tuning & DPC interrupt queues', included: true, highlight: true },
      { text: 'EDID display refresh rate synchronization', included: true },
      { text: 'Lifetime updates and VIP priority support', included: true },
    ],
    ctaTextRu: 'Получить VIP навсегда',
    ctaTextEn: 'Get VIP Lifetime',
    ctaAction: 'checkout',
  },
  {
    id: 'club',
    name: 'Cyber Arena & LAN',
    badgeRu: 'ДЛЯ КЛУБОВ И B2B',
    badgeEn: 'FOR ARENAS & B2B',
    prices: {
      RUB: { amount: '19 900 ₽', periodRu: 'разовый платеж • весь клуб', periodEn: 'one-time payment • full venue' },
      USD: { amount: '$199', periodRu: 'one-time payment • full venue', periodEn: 'one-time payment • full venue' },
      EUR: { amount: '189 €', periodRu: 'one-time payment • full venue', periodEn: 'one-time payment • full venue' },
    },
    descriptionRu: 'Инфраструктурная лицензия для компьютерных клубов, буткемпов и киберспортивных площадок.',
    descriptionEn: 'Enterprise venue license for cyber cafes, esports arenas, and tournament bootcamps.',
    featuresRu: [
      { text: 'Все возможности VIP для парка компьютеров клуба', included: true },
      { text: 'Тихая установка: --silent --preset=esports', included: true, highlight: true },
      { text: 'Поддержка бездисковых систем (PXE / CCBoot / Senmo)', included: true, highlight: true },
      { text: 'Защита настроек мастер-паролем администратора', included: true },
      { text: 'Прямой контакт с инженерами ядра', included: true },
      { text: 'Предоставление закрывающих бухгалтерских документов', included: true },
    ],
    featuresEn: [
      { text: 'All VIP capabilities for your entire PC fleet', included: true },
      { text: 'Silent CLI deploy: --silent --preset=esports', included: true, highlight: true },
      { text: 'Diskless boot support (PXE / CCBoot / Senmo)', included: true, highlight: true },
      { text: 'Master admin password tamper protection', included: true },
      { text: 'Direct line to core kernel engineers', included: true },
      { text: 'Official corporate accounting invoices', included: true },
    ],
    ctaTextRu: 'Запросить B2B доступ',
    ctaTextEn: 'Request B2B License',
    ctaAction: 'checkout',
  },
];

// Group 2: Passes & Subscriptions (2 wide cards)
const TOURNAMENT_TIERS: TierDefinition[] = [
  {
    id: 'daypass',
    name: '24h Esports Pass',
    badgeRu: 'НА ТУРНИР ИЛИ ВЕЧЕР',
    badgeEn: 'FOR TOURNAMENT NIGHT',
    prices: {
      RUB: { amount: '149 ₽', periodRu: 'разовый пропуск • 24 часа с момента запуска', periodEn: '24 hours from activation' },
      USD: { amount: '$1.99', periodRu: 'one-time pass • 24 hours', periodEn: 'one-time pass • 24 hours' },
      EUR: { amount: '1.8 €', periodRu: 'one-time pass • 24 hours', periodEn: 'one-time pass • 24 hours' },
    },
    descriptionRu: 'Мгновенный доступ ко всем Pro-модулям на соревновательный вечер или турнир. Без подписок и автопродлений.',
    descriptionEn: 'Instant access to all Pro modules for tournament nights and scrims. No recurring subscriptions.',
    featuresRu: [
      { text: 'Полный доступ ко всем возможностям VIP на 24 часа', included: true, highlight: true },
      { text: 'Аппаратный таймер ядра 0.5 мс и DPC-приоритизация', included: true, highlight: true },
      { text: 'Оптимизация фреймтайма CS2, Valorant & Apex', included: true },
      { text: 'Моментальная генерация ключа в личном сообщении', included: true },
      { text: 'Идеально для LAN-турниров и интернет-кафе', included: true },
    ],
    featuresEn: [
      { text: 'Full VIP functionality unlocked for 24 hours', included: true, highlight: true },
      { text: '0.5ms hardware timer & DPC queue prioritization', included: true, highlight: true },
      { text: 'CS2, Valorant & Apex frame time stabilizer', included: true },
      { text: 'Instant key delivery right after checkout', included: true },
      { text: 'Perfect for LAN events and cyber cafes', included: true },
    ],
    ctaTextRu: 'Активировать на 24 часа',
    ctaTextEn: 'Activate 24h Pass',
    ctaAction: 'checkout',
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    badgeRu: 'СЕЗОН РЕЙТИНГА • 30 ДНЕЙ',
    badgeEn: 'RANKED SEASON • 30 DAYS',
    prices: {
      RUB: { amount: '790 ₽', periodRu: 'в месяц • доступ на 30 дней', periodEn: 'per month • 30 days access' },
      USD: { amount: '$9.99', periodRu: 'per month • 30 days', periodEn: 'per month • 30 days' },
      EUR: { amount: '9.5 €', periodRu: 'per month • 30 days', periodEn: 'per month • 30 days' },
    },
    descriptionRu: 'Полная Pro функциональность на 30 дней для регулярных рейтинговых сезонов, стримов и соревнований.',
    descriptionEn: 'Full Pro performance for 30 days. Perfect for competitive ranked seasons and streaming.',
    featuresRu: [
      { text: 'Все Pro возможности без ограничений на 30 дней', included: true, highlight: true },
      { text: 'Таймер ядра 0.5 мс + DPC приоритизация', included: true, highlight: true },
      { text: 'Все сценарные пресеты (Esports, Streamer, AAA)', included: true },
      { text: 'Очистка кэша шейдеров и сброс RAM в 1 клик', included: true },
      { text: 'Техническая поддержка обновлений в течение месяца', included: true },
    ],
    featuresEn: [
      { text: 'All Pro capabilities without limits for 30 days', included: true, highlight: true },
      { text: '0.5ms kernel timer + DPC prioritization', included: true, highlight: true },
      { text: 'All scenario presets (Esports, Streamer, AAA)', included: true },
      { text: '1-click shader cache purge and RAM flush', included: true },
      { text: 'Active technical update coverage during the month', included: true },
    ],
    ctaTextRu: 'Оформить на 30 дней',
    ctaTextEn: 'Get 30-Day Access',
    ctaAction: 'checkout',
  },
];

export const Pricing: React.FC = () => {
  const { t, lang } = useI18n();
  const [currency, setCurrency] = useState<Currency>(lang === 'ru' ? 'RUB' : 'USD');
  const [activeTab, setActiveTab] = useState<'lifetime' | 'tournament'>('lifetime');
  const [checkoutTier, setCheckoutTier] = useState<CheckoutTierInfo | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    setCurrency(lang === 'ru' ? 'RUB' : 'USD');
  }, [lang]);

  const handleOpenCheckout = (tier: TierDefinition) => {
    const priceData = tier.prices[currency];
    setCheckoutTier({
      id: tier.id,
      name: tier.name,
      amount: priceData.amount,
      period: lang === 'ru' ? priceData.periodRu : priceData.periodEn,
    });
    setIsCheckoutOpen(true);
  };

  return (
    <section id="pricing" className="relative py-28 border-t border-white/[0.08] bg-[#07090e] overflow-hidden">
      {/* Subtle Background Glow using theme accent */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] pointer-events-none rounded-full blur-[160px] opacity-15"
        style={{ backgroundColor: 'var(--accent-color)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded border mb-4 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--accent-bg-subtle)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent-color)',
            }}
          >
            <Crown className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              {t.pricing.tag}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            {t.pricing.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans">
            {t.pricing.subtitle}
          </p>

          {/* Tab Switcher & Currency Row */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Plan Category Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-[#0d1017] border border-white/10 shadow-inner">
              <button
                onClick={() => setActiveTab('lifetime')}
                className={`relative px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wide transition-all ${
                  activeTab === 'lifetime'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeTab === 'lifetime' && (
                  <motion.div
                    layoutId="pricingTabHighlight"
                    className="absolute inset-0 rounded-lg border shadow-sm"
                    style={{
                      backgroundColor: 'var(--accent-bg-subtle)',
                      borderColor: 'var(--accent-border)',
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span 
                  className="relative z-10 flex items-center gap-2"
                  style={{ color: activeTab === 'lifetime' ? 'var(--accent-color)' : undefined }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === 'ru' ? 'Постоянные лицензии' : 'Permanent Licenses'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tournament')}
                className={`relative px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wide transition-all ${
                  activeTab === 'tournament'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeTab === 'tournament' && (
                  <motion.div
                    layoutId="pricingTabHighlight"
                    className="absolute inset-0 rounded-lg border shadow-sm"
                    style={{
                      backgroundColor: 'var(--accent-bg-subtle)',
                      borderColor: 'var(--accent-border)',
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span 
                  className="relative z-10 flex items-center gap-2"
                  style={{ color: activeTab === 'tournament' ? 'var(--accent-color)' : undefined }}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  {lang === 'ru' ? 'Турнирные пропуски' : 'Tournament Passes'}
                </span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#0d1017] border border-white/10">
              <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1.5 uppercase font-medium">
                <Coins className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                {lang === 'ru' ? 'Валюта:' : 'Currency:'}
              </span>
              {(['RUB', 'USD', 'EUR'] as Currency[]).map((curr) => {
                const active = currency === curr;
                const symbols: Record<Currency, string> = { RUB: '₽ RUB', USD: '$ USD', EUR: '€ EUR' };
                return (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      active
                        ? 'font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                    style={active ? {
                      backgroundColor: 'var(--accent-color)',
                      color: '#060708',
                      boxShadow: 'var(--accent-glow)',
                    } : {}}
                  >
                    {symbols[curr]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Cards Container with Smooth Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === 'lifetime' ? (
            <motion.div
              key="lifetime-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
            >
              {LIFETIME_TIERS.map((tier) => renderPricingCard(tier))}
            </motion.div>
          ) : (
            <motion.div
              key="tournament-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
            >
              {TOURNAMENT_TIERS.map((tier) => renderPricingCard(tier))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Reassurance Banner */}
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#0d1018]/90 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--accent-bg-subtle)',
                borderColor: 'var(--accent-border)',
              }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            </div>
            <div className="text-xs text-slate-400 font-sans">
              <p className="font-semibold text-slate-200">
                {lang === 'ru' ? 'Прозрачные условия и моментальная выдача' : 'Clear Terms & Instant Key Generation'}
              </p>
              <p>
                {lang === 'ru'
                  ? 'Ключ генерируется сразу после подтверждения. Никаких скрытых списаний и навязанных подписок.'
                  : 'Keys generated immediately upon verification. No hidden charges or forced recurring billing.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0">
            <Info className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span>Win 10/11 x86_64</span>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        tier={checkoutTier}
      />
    </section>
  );

  function renderPricingCard(tier: TierDefinition) {
    const priceData = tier.prices[currency];
    const badge = lang === 'ru' ? tier.badgeRu : tier.badgeEn;
    const description = lang === 'ru' ? tier.descriptionRu : tier.descriptionEn;
    const period = lang === 'ru' ? priceData.periodRu : priceData.periodEn;
    const features = lang === 'ru' ? tier.featuresRu : tier.featuresEn;
    const ctaText = lang === 'ru' ? tier.ctaTextRu : tier.ctaTextEn;

    return (
      <div
        key={tier.id}
        className={`rounded-2xl flex flex-col justify-between p-8 sm:p-9 transition-all relative overflow-hidden border ${
          tier.isPopular
            ? 'bg-[#10141f] shadow-2xl lg:-translate-y-2 z-10'
            : 'border-white/[0.08] bg-[#0c0e16]/80 hover:border-white/15'
        }`}
        style={{
          borderColor: tier.isPopular ? 'var(--accent-border)' : undefined,
          boxShadow: tier.isPopular ? '0 0 45px -12px var(--accent-color)' : undefined,
        }}
      >
        {/* Subtle Top Accent Line for Popular Card */}
        {tier.isPopular && (
          <div 
            className="absolute top-0 inset-x-0 h-0.5"
            style={{ backgroundColor: 'var(--accent-color)' }}
          />
        )}

        <div>
          {/* Card Badge */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tier.name}
            </h3>
            {badge && (
              <span 
                className="px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold tracking-wider rounded-md border"
                style={tier.isPopular ? {
                  backgroundColor: 'var(--accent-bg-subtle)',
                  borderColor: 'var(--accent-border)',
                  color: 'var(--accent-color)',
                } : {
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                {badge}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 font-sans min-h-[36px] mb-6">
            {description}
          </p>

          {/* Price Display */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-6">
            <div className="flex items-baseline gap-2">
              <span 
                className="text-3xl sm:text-4xl font-mono font-black text-white"
                style={tier.isPopular ? { color: 'var(--accent-color)' } : {}}
              >
                {priceData.amount}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              {period}
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-3 mb-8">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              {lang === 'ru' ? 'Возможности тарифа:' : 'Included Features:'}
            </p>
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                {feat.included ? (
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border"
                    style={feat.highlight ? {
                      backgroundColor: 'var(--accent-bg-subtle)',
                      borderColor: 'var(--accent-border)',
                      color: 'var(--accent-color)',
                    } : {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#cbd5e1',
                    }}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 mt-0.5 text-zinc-600">
                    <span className="w-1.5 h-px bg-zinc-600"></span>
                  </div>
                )}
                <span className={`${
                  feat.included 
                    ? feat.highlight 
                      ? 'text-white font-semibold' 
                      : 'text-slate-300'
                    : 'text-zinc-600 line-through'
                }`}>
                  {feat.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Action */}
        <div>
          {tier.ctaAction === 'checkout' ? (
            <button
              onClick={() => handleOpenCheckout(tier)}
              className={`w-full py-3.5 px-6 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                tier.isPopular
                  ? 'btn-accent shadow-accent-glow'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10'
              }`}
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <a
              href={tier.ctaAction}
              className="w-full py-3.5 px-6 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 text-center"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }
};
