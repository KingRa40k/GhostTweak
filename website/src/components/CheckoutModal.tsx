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
  MessageSquare
} from 'lucide-react';
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

  if (!isOpen || !tier) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl border bg-[#0B0D14] p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ borderColor: 'var(--accent-border)' }}
      >
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="inline-block px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold tracking-wider border"
              style={{
                backgroundColor: 'var(--accent-bg-subtle)',
                borderColor: 'var(--accent-border)',
                color: 'var(--accent-color)',
              }}
            >
              {lang === 'ru' ? 'Лицензирование' : 'Licensing & Order'}
            </span>
            {!isPaymentConfigured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Clock size={11} />
                <span>{lang === 'ru' ? 'Режим настройки' : 'Setup Mode'}</span>
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {tier.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-extrabold text-white">
              {tier.amount}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {tier.period}
            </span>
          </div>
        </div>

        {/* CONDITION 1: Payment system NOT configured (Default Safe Mode) */}
        {!isPaymentConfigured ? (
          <div>
            {!isInquirySubmitted ? (
              <div className="space-y-5">
                {/* Notice Banner */}
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] text-amber-200/90 text-xs font-sans leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white mb-1">
                        {lang === 'ru' 
                          ? 'Автоматический онлайн-эквайринг временно настраивается' 
                          : 'Automated checkout is undergoing setup'}
                      </p>
                      <p className="text-slate-300 text-[11px]">
                        {lang === 'ru'
                          ? 'В данный момент прямое автоматическое списание отключено администратором проекта. Бесплатная раздача мастер-ключей заблокирована в целях безопасности.'
                          : 'Automated gateway processing is paused for configuration. Free key generation is locked for security.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Card with Administrator */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    {lang === 'ru' ? 'Связь с владельцем / администратором:' : 'Contact Owner / Administrator:'}
                  </span>

                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-xs text-slate-200">
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={14} style={{ color: 'var(--accent-color)' }} />
                      <span className="truncate">{PAYMENT_CONFIG.adminEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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

                  {PAYMENT_CONFIG.discordUrl && (
                    <a
                      href={PAYMENT_CONFIG.discordUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>{lang === 'ru' ? 'Discord сообщество проекта' : 'Project Discord Community'}</span>
                    </a>
                  )}
                </div>

                {/* Quick Purchase Request Form */}
                <form onSubmit={handleSendInquiry} className="space-y-3 pt-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300 font-bold block">
                    {lang === 'ru' ? 'Оставить заявку на получение ключа:' : 'Leave a key purchase request:'}
                  </span>

                  <div>
                    <label className="block font-mono text-[11px] text-slate-400 mb-1">
                      {lang === 'ru' ? 'Ваш Email для ответа' : 'Your Email for reply'}
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="buyer@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    {emailError && (
                      <p className="text-[11px] text-red-400 mt-1 font-mono">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-slate-400 mb-1">
                      {lang === 'ru' ? 'Аппаратный HWID (опционально)' : 'Hardware HWID (optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="GT-XXXX-XXXX-XXXX"
                      value={hwid}
                      onChange={(e) => setHwid(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-slate-400 mb-1">
                      {lang === 'ru' ? 'Комментарий / удобный способ связи (опционально)' : 'Message / Preferred contact method (optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'ru' ? 'Например, удобна оплата через СБП или криптовалюту' : 'e.g. Prefer payment via Card or Crypto'}
                      value={inquiryNote}
                      onChange={(e) => setInquiryNote(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 btn-accent transition-all active:scale-[0.98]"
                    >
                      <Send size={13} />
                      <span>{lang === 'ru' ? 'Отправить заявку' : 'Submit Inquiry'}</span>
                    </button>
                    <a
                      href={directMailtoUrl}
                      className="py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-mono text-xs font-bold text-center transition-colors"
                    >
                      {lang === 'ru' ? 'Открыть почту' : 'Open Mail Client'}
                    </a>
                  </div>
                </form>
              </div>
            ) : (
              /* Inquiry Submitted Confirmation */
              <div className="text-center py-4 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={28} />
                </div>

                <h4 className="text-xl font-black text-white tracking-tight mb-2">
                  {lang === 'ru' ? 'Заявка успешно зафиксирована' : 'Inquiry Successfully Submitted'}
                </h4>
                <p className="text-xs text-slate-300 font-sans mb-4 leading-relaxed">
                  {lang === 'ru'
                    ? `Администратор получил ваш запрос на тариф ${tier.name} (${tier.amount}) и свяжется с вами по адресу ${email} для предоставления реквизитов и ключа.`
                    : `The administrator has received your inquiry for ${tier.name} (${tier.amount}) and will contact you at ${email} with payment details and your license key.`}
                </p>

                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-left text-xs font-mono text-slate-400 mb-6 space-y-1">
                  <div>
                    <span className="text-slate-500">Email:</span> <span className="text-white">{email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{lang === 'ru' ? 'Тариф:' : 'Plan:'}</span> <span className="text-emerald-400 font-bold">{tier.name} ({tier.amount})</span>
                  </div>
                  {hwid && (
                    <div>
                      <span className="text-slate-500">HWID:</span> <span className="text-slate-200">{hwid}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={directMailtoUrl}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail size={14} />
                    <span>{lang === 'ru' ? 'Дублировать письмом' : 'Send via Email App'}</span>
                  </a>
                  <button
                    onClick={handleResetAndClose}
                    className="py-2.5 px-5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-mono text-xs font-bold transition-colors"
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
                <label className="block font-mono text-xs uppercase tracking-wider text-slate-300 font-bold mb-1.5">
                  {lang === 'ru' ? 'Ваш Email (для получения ключа)' : 'Your Email (for license delivery)'}
                  <span className="text-red-400 ml-1">*</span>
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
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {emailError && (
                  <p className="text-xs text-red-400 mt-1 font-mono">{emailError}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">
                    {lang === 'ru' ? 'Аппаратный HWID ПК' : 'Hardware HWID'}
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {lang === 'ru' ? 'Опционально (из приложения)' : 'Optional (from app)'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder={lang === 'ru' ? 'GT-XXXX-XXXX-XXXX (можно активировать позже)' : 'GT-XXXX-XXXX-XXXX (can bind later)'}
                  value={hwid}
                  onChange={(e) => setHwid(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  {lang === 'ru' ? 'Способ оплаты' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_ru')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                      paymentMethod === 'card_ru'
                        ? 'border-cyan-400 bg-cyan-400/10 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-slate-300'
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
                        ? 'border-cyan-400 bg-cyan-400/10 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-slate-300'
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
                        ? 'border-cyan-400 bg-cyan-400/10 text-white'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-slate-300'
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
                  className="w-full py-3.5 px-6 rounded-xl font-mono text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 btn-accent transition-all active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-500">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>{lang === 'ru' ? 'Защищённый платеж • Автоматическая выдача лицензии' : 'Encrypted checkout • Automated digital license delivery'}</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
