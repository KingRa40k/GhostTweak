'use client';

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  ShieldCheck, 
  CreditCard, 
  Globe, 
  Zap, 
  ArrowRight, 
  Mail, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  MessageSquare,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { PAYMENT_CONFIG } from '@/lib/paymentConfig';

export interface CheckoutTierInfo {
  id: string;
  name: string;
  amount: string;
  period: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: CheckoutTierInfo | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, tier }) => {
  const { lang } = useI18n();
  const [email, setEmail] = useState('');
  const [hwid, setHwid] = useState('');
  const [inquiryNote, setInquiryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card_ru' | 'card_global' | 'crypto'>('card_ru');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInquirySubmitted, setIsInquirySubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  if (!tier) return null;

  // Verify whether live payment gateway is configured by the owner
  const isPaymentConfigured = PAYMENT_CONFIG.isLivePaymentEnabled && Boolean(PAYMENT_CONFIG.paymentGatewayUrl.trim());

  const mailtoSubject = encodeURIComponent(
    lang === 'ru' 
      ? `Запрос на покупку лицензии GhostTweak: ${tier.name}` 
      : `GhostTweak License Inquiry: ${tier.name}`
  );
  
  const mailtoBody = encodeURIComponent(
    lang === 'ru'
      ? `Здравствуйте!\n\nХочу приобрести лицензию GhostTweak:\n- Тариф: ${tier.name}\n- Стоимость: ${tier.amount}\n- Мой Email: ${email || '...'}\n- Мой HWID (опционально): ${hwid || 'будет указан позже'}\n- Комментарий: ${inquiryNote || 'нет'}\n\nПожалуйста, отправьте реквизиты для оплаты и лицензионный ключ.`
      : `Hello!\n\nI want to purchase a GhostTweak license:\n- Plan: ${tier.name}\n- Price: ${tier.amount}\n- My Email: ${email || '...'}\n- My HWID (optional): ${hwid || 'will provide later'}\n- Note: ${inquiryNote || 'none'}\n\nPlease provide payment details and the license key.`
  );

  const directMailtoUrl = `mailto:${PAYMENT_CONFIG.adminEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const handleLivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError(lang === 'ru' ? 'Введите корректный email адрес' : 'Please enter a valid email address');
      return;
    }
    setEmailError('');
    setIsProcessing(true);

    try {
      const targetUrl = new URL(PAYMENT_CONFIG.paymentGatewayUrl, window.location.origin);
      targetUrl.searchParams.set('tier', tier.id);
      targetUrl.searchParams.set('amount', tier.amount);
      targetUrl.searchParams.set('email', email);
      if (hwid) targetUrl.searchParams.set('hwid', hwid);
      targetUrl.searchParams.set('method', paymentMethod);

      window.location.href = targetUrl.toString();
    } catch {
      window.location.href = PAYMENT_CONFIG.paymentGatewayUrl;
    }
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError(lang === 'ru' ? 'Введите корректный email адрес' : 'Please enter a valid email address');
      return;
    }
    setEmailError('');
    setIsInquirySubmitted(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.adminEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleResetAndClose = () => {
    setIsInquirySubmitted(false);
    setIsProcessing(false);
    setEmail('');
    setHwid('');
    setInquiryNote('');
    setEmailError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with smooth blur fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container with Spring Physics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950/95 p-6 sm:p-8 shadow-2xl shadow-black overflow-hidden max-h-[90vh] overflow-y-auto z-10"
          >
            {/* Subtle Top Accent Line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleResetAndClose}
              className="absolute top-5 right-5 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors z-20"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold tracking-wider bg-white/5 text-zinc-300 border border-white/10">
                  {lang === 'ru' ? 'Лицензирование' : 'Licensing & Order'}
                </span>
                {!isPaymentConfigured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-300">
                    <Clock size={11} />
                    <span>{lang === 'ru' ? 'Прямой контакт' : 'Direct Contact'}</span>
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl font-black text-white">
                  {tier.amount}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {tier.period}
                </span>
              </div>
            </div>

            {/* CONDITION 1: Payment gateway pending manual / setup (Default Safe Mode) */}
            {!isPaymentConfigured ? (
              <div>
                {!isInquirySubmitted ? (
                  <div className="space-y-5">
                    {/* Notice Banner */}
                    <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 text-xs font-sans leading-relaxed">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white mb-0.5">
                            {lang === 'ru' 
                              ? 'Прямая выдача ключа через администратора' 
                              : 'Direct Key Issuance via Administrator'}
                          </p>
                          <p className="text-zinc-400 text-[11px]">
                            {lang === 'ru'
                              ? 'В данный момент автоматический эквайринг проходит верификацию. Оставьте заявку ниже или напишите на почту — ключ и реквизиты будут предоставлены моментально.'
                              : 'Automated gateway is undergoing verification. Submit inquiry below or email directly — your key and invoice details will be provided promptly.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Direct Contact Card with Administrator */}
                    <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/30 space-y-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                        {lang === 'ru' ? 'Официальный контакт проекта:' : 'Official Project Contact:'}
                      </span>

                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/50 border border-white/5 font-mono text-xs text-zinc-200">
                        <div className="flex items-center gap-2 truncate">
                          <Mail size={14} className="text-zinc-400" />
                          <span className="truncate">{PAYMENT_CONFIG.adminEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={handleCopyEmail}
                            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            title={lang === 'ru' ? 'Копировать' : 'Copy'}
                          >
                            {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                          <a
                            href={directMailtoUrl}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center gap-1"
                          >
                            <span>{lang === 'ru' ? 'Написать' : 'Email'}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Quick Purchase Request Form */}
                    <form onSubmit={handleSendInquiry} className="space-y-3.5 pt-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-300 font-bold block">
                        {lang === 'ru' ? 'Заявка на получение ключа:' : 'Submit Order Request:'}
                      </span>

                      <div>
                        <label className="block font-mono text-[11px] text-zinc-400 mb-1">
                          {lang === 'ru' ? 'Ваш Email для отправки ключа' : 'Your Email for key delivery'}
                          <span className="text-rose-400 ml-1">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="client@domain.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        {emailError && (
                          <p className="text-[11px] text-rose-400 mt-1 font-mono">{emailError}</p>
                        )}
                      </div>

                      <div>
                        <label className="block font-mono text-[11px] text-zinc-400 mb-1">
                          {lang === 'ru' ? 'Аппаратный HWID (опционально)' : 'Hardware HWID (optional)'}
                        </label>
                        <input
                          type="text"
                          placeholder="GT-XXXX-XXXX-XXXX"
                          value={hwid}
                          onChange={(e) => setHwid(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[11px] text-zinc-400 mb-1">
                          {lang === 'ru' ? 'Предпочтительный способ оплаты (опционально)' : 'Preferred payment method (optional)'}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === 'ru' ? 'СБП / Карта / Криптовалюта USDT' : 'Card / Bank / Crypto USDT'}
                          value={inquiryNote}
                          onChange={(e) => setInquiryNote(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="submit"
                          className="flex-1 py-3 px-5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black shadow-lg transition-all active:scale-[0.98]"
                        >
                          <Send size={13} />
                          <span>{lang === 'ru' ? 'Отправить запрос' : 'Submit Request'}</span>
                        </button>
                        <a
                          href={directMailtoUrl}
                          className="py-3 px-5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white font-mono text-xs font-bold text-center transition-colors"
                        >
                          {lang === 'ru' ? 'Открыть почту' : 'Open Mail Client'}
                        </a>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Inquiry Submitted Confirmation */
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={24} />
                    </div>

                    <h4 className="text-lg font-bold text-white tracking-tight mb-2">
                      {lang === 'ru' ? 'Заявка успешно принята' : 'Inquiry Successfully Accepted'}
                    </h4>
                    <p className="text-xs text-zinc-400 font-sans mb-5 leading-relaxed">
                      {lang === 'ru'
                        ? `Запрос на тариф ${tier.name} (${tier.amount}) отправлен. Администратор свяжется с вами по адресу ${email} для передачи ключа.`
                        : `Your request for ${tier.name} (${tier.amount}) was submitted. The administrator will contact you at ${email} with your license key.`}
                    </p>

                    <div className="p-3.5 rounded-xl border border-white/10 bg-zinc-900/50 text-left text-xs font-mono text-zinc-400 mb-6 space-y-1">
                      <div>
                        <span className="text-zinc-500">Email:</span> <span className="text-white">{email}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">{lang === 'ru' ? 'Тариф:' : 'Plan:'}</span> <span className="text-white font-bold">{tier.name} ({tier.amount})</span>
                      </div>
                      {hwid && (
                        <div>
                          <span className="text-zinc-500">HWID:</span> <span className="text-zinc-300">{hwid}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={directMailtoUrl}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Mail size={14} />
                        <span>{lang === 'ru' ? 'Продублировать на почту' : 'Send via Mail Client'}</span>
                      </a>
                      <button
                        onClick={handleResetAndClose}
                        className="py-2.5 px-5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white font-mono text-xs font-bold transition-colors"
                      >
                        {lang === 'ru' ? 'Закрыть' : 'Close'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CONDITION 2: Live Payment Gateway Configured (Ready for Production) */
              <div>
                <form onSubmit={handleLivePayment} className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold mb-1.5">
                      {lang === 'ru' ? 'Ваш Email (для получения ключа)' : 'Your Email (for license delivery)'}
                      <span className="text-rose-400 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                    {emailError && (
                      <p className="text-xs text-rose-400 mt-1 font-mono">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block font-mono text-xs uppercase tracking-wider text-zinc-400 font-bold">
                        {lang === 'ru' ? 'Аппаратный HWID ПК' : 'Hardware HWID'}
                      </label>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {lang === 'ru' ? 'Опционально (из приложения)' : 'Optional (from app)'}
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder={lang === 'ru' ? 'GT-XXXX-XXXX-XXXX (можно активировать позже)' : 'GT-XXXX-XXXX-XXXX (can bind later)'}
                      value={hwid}
                      onChange={(e) => setHwid(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2">
                      {lang === 'ru' ? 'Способ оплаты' : 'Payment Method'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card_ru')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                          paymentMethod === 'card_ru'
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/5 bg-zinc-900/50 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                        }`}
                      >
                        <CreditCard size={18} />
                        <span className="text-[11px] font-bold">Карта РФ / СБП</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card_global')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                          paymentMethod === 'card_global'
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/5 bg-zinc-900/50 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                        }`}
                      >
                        <Globe size={18} />
                        <span className="text-[11px] font-bold">Visa / MC / Stripe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('crypto')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                          paymentMethod === 'crypto'
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/5 bg-zinc-900/50 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                        }`}
                      >
                        <Zap size={18} />
                        <span className="text-[11px] font-bold">Crypto (USDT / TON)</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 px-6 rounded-xl font-mono text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black shadow-lg transition-all active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>{lang === 'ru' ? 'Переход к платёжному шлюзу...' : 'Redirecting to gateway...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{lang === 'ru' ? `Оплатить ${tier.amount}` : `Pay ${tier.amount}`}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-mono text-zinc-500">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>{lang === 'ru' ? 'Защищённый платеж • Автоматическая выдача лицензии' : 'Encrypted checkout • Automated digital license delivery'}</span>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
