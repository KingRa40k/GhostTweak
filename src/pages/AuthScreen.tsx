import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, ArrowRight,
  Check, Fingerprint, Lock, Shield, AlertCircle, Globe, Copy
} from 'lucide-react';
import { verifyLicenseKey, activateTrial, activateFreeMode, getSystemHwid, getSystemHwidAsync, LicenseData } from '../lib/license';
import { useI18n, setStoredLanguage } from '../lib/i18n';
import { openUrl } from '../lib/tauri';
import LegalModal from '../components/LegalModal';
import FireworksOverlay from '../components/FireworksOverlay';

interface AuthScreenProps {
  onAuthorized: (license: LicenseData) => void;
}

export default function AuthScreen({ onAuthorized }: AuthScreenProps) {
  const { t, lang } = useI18n();
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState<string>('');
  const [authProgress, setAuthProgress] = useState<number>(0);
  const [error, setError] = useState('');
  const [isErrorShaking, setIsErrorShaking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);
  const [hasAgreed, setHasAgreed] = useState<boolean>(() => {
    return localStorage.getItem('ghosttweak_agreement_accepted') === 'true';
  });
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');
  const inputRef = useRef<HTMLInputElement>(null);
  const [hwid, setHwid] = useState<string>(getSystemHwid());

  useEffect(() => {
    inputRef.current?.focus();
    getSystemHwidAsync().then(setHwid);
  }, []);

  const handleCopyHwid = () => {
    navigator.clipboard.writeText(hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2200);
  };

  const handleKeyChange = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (clean.length > 32) clean = clean.substring(0, 32);

    let formatted = clean;
    if (!clean.includes('-') && clean.startsWith('GHOST') && clean.length > 5) {
      const rest = clean.slice(5);
      let tag = '';
      if (rest.startsWith('VIP')) tag = 'VIP';
      else if (rest.startsWith('MTH')) tag = 'MTH';
      else if (rest.startsWith('DAY')) tag = 'DAY';
      else if (rest.startsWith('TRL')) tag = 'TRL';
      else if (rest.startsWith('CLB')) tag = 'CLB';
      else if (rest.startsWith('PRO')) tag = 'PRO';

      if (tag) {
        const afterTag = rest.slice(tag.length);
        formatted = `GHOST-${tag}`;
        if (afterTag.length > 0) formatted += '-' + afterTag.slice(0, 4);
        if (afterTag.length > 4) formatted += '-' + afterTag.slice(4, 8);
        if (afterTag.length > 8) formatted += '-' + afterTag.slice(8, 12);
      } else {
        formatted = 'GHOST';
        if (rest.length > 0) formatted += '-' + rest.slice(0, 4);
        if (rest.length > 4) formatted += '-' + rest.slice(4, 8);
        if (rest.length > 8) formatted += '-' + rest.slice(8, 12);
        if (rest.length > 12) formatted += '-' + rest.slice(12, 16);
      }
    }

    setKeyInput(formatted);
    setError('');
  };

  const handleActivate = async () => {
    if (!hasAgreed) {
      setError(t.auth.errMustAgree);
      triggerErrorShake();
      return;
    }

    if (!keyInput.trim()) {
      setError(t.auth.errEmptyKey);
      triggerErrorShake();
      return;
    }

    setLoading(true);
    setError('');
    setAuthProgress(30);
    setAuthStep(t.auth.stepHwid);

    const timer1 = setTimeout(() => {
      setAuthProgress(70);
      setAuthStep(t.auth.stepSignature);
    }, 300);

    const res = await verifyLicenseKey(keyInput);

    clearTimeout(timer1);

    if (res.success && res.data) {
      localStorage.setItem('ghosttweak_agreement_accepted', 'true');
      setAuthProgress(100);
      setAuthStep(t.auth.stepApproved);
      setSuccess(true);
      setShowFireworks(true);
      setTimeout(() => {
        onAuthorized(res.data!);
      }, 2500);
    } else {
      setLoading(false);
      setAuthProgress(0);
      setAuthStep('');
      setError(res.error || t.auth.errInvalidKey);
      triggerErrorShake();
    }
  };

  const triggerErrorShake = () => {
    setIsErrorShaking(true);
    setTimeout(() => setIsErrorShaking(false), 450);
  };

  const handleTrial = async () => {
    if (!hasAgreed) {
      setError(t.auth.errMustAgree);
      triggerErrorShake();
      return;
    }

    setLoading(true);
    setError('');
    setAuthProgress(50);
    setAuthStep(t.auth.stepTrial);

    try {
      const trialData = await activateTrial();
      localStorage.setItem('ghosttweak_agreement_accepted', 'true');
      setAuthProgress(100);
      setSuccess(true);
      setShowFireworks(true);
      setTimeout(() => {
        onAuthorized(trialData);
      }, 2500);
    } catch {
      setError(t.auth.errTrial);
      setLoading(false);
    }
  };

  const handleFreeMode = async () => {
    if (!hasAgreed) {
      setError(t.auth.errMustAgree);
      triggerErrorShake();
      return;
    }

    setLoading(true);
    setError('');
    setAuthProgress(60);
    setAuthStep(lang === 'ru' ? 'Запуск Community Edition...' : 'Launching Community Edition...');

    try {
      const freeData = await activateFreeMode();
      localStorage.setItem('ghosttweak_agreement_accepted', 'true');
      setAuthProgress(100);
      setSuccess(true);
      setTimeout(() => {
        onAuthorized(freeData);
      }, 1200);
    } catch {
      setError(lang === 'ru' ? 'Ошибка запуска бесплатного режима' : 'Failed to launch free mode');
      setLoading(false);
    }
  };

  const parts = keyInput.split('-');
  const isFiveBlock = parts.length > 4 || keyInput.startsWith('GHOST-VIP-') || keyInput.startsWith('GHOST-MTH-') || keyInput.startsWith('GHOST-DAY-') || keyInput.startsWith('GHOST-TRL-') || keyInput.startsWith('GHOST-CLB-') || keyInput.startsWith('GHOST-PRO-');
  const slotCount = isFiveBlock ? 5 : 4;
  const slots = Array.from({ length: slotCount }, (_, i) => parts[i] || '');

  const isFormatComplete = keyInput.startsWith('GHOST-') && (isFiveBlock ? keyInput.length >= 23 : keyInput.length >= 19);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-titanium-950 micro-grid overflow-hidden select-none font-sans">
      
      {showFireworks && <FireworksOverlay durationMs={2700} />}

      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-ghost-cyan/[0.05] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div 
        className={`relative z-10 w-full max-w-[480px] bg-titanium-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-satin p-8 transition-all duration-300 ${
          isErrorShaking ? 'translate-x-[-6px] animate-bounce' : ''
        } ${
          success 
            ? 'border-emerald-500/40 shadow-emerald-glow' 
            : 'hover:border-white/[0.14]'
        }`}
      >
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-titanium-950 border border-white/[0.1] shadow-bezel flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-ghost-cyan shadow-[0_0_10px_#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">GhostTweak</span>
                <span className="tech-badge text-ghost-cyan border-ghost-cyan/30">v1.0.0</span>
              </div>
              <p className="text-[11px] text-zinc-400">{t.auth.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStoredLanguage(lang === 'ru' ? 'en' : 'ru')}
              title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Globe size={12} className="text-ghost-cyan" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.auth.ready}</span>
            </div>
          </div>
        </div>

        {loading || success ? (
          <div className="py-6 flex flex-col items-center text-center gap-5 page-enter">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/[0.06]"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`transition-all duration-300 ease-out ${
                    success ? 'text-emerald-400' : 'text-ghost-cyan'
                  }`}
                  strokeDasharray={`${authProgress}, 100`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-white">
                {authProgress}%
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-w-sm">
              <h3 className="text-sm font-semibold text-white">
                {success ? t.auth.activatedSuccess : t.auth.verifyingTitle}
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                {authStep}
              </p>
            </div>

            <div className="w-full hardware-well p-3.5 flex flex-col gap-2 text-left font-mono text-[11px]">
              <div className="flex justify-between items-center text-zinc-500 border-b border-white/[0.04] pb-1.5">
                <span className="text-[10px] tracking-wider uppercase">{lang === 'ru' ? 'Параметры оборудования' : 'Hardware Specifications'}</span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <Check size={11} /> OK
                </span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">HWID:</span>
                <span className="text-white">{hwid}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">{lang === 'ru' ? 'Ключ:' : 'Key:'}</span>
                <span className="text-ghost-cyan truncate max-w-[200px]">{keyInput || 'TRIAL'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            
            <div className="p-3 rounded-2xl bg-titanium-950/90 border border-white/[0.08] hover:border-ghost-cyan/40 transition-all shadow-inner">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-ghost-cyan/10 border border-ghost-cyan/20 flex items-center justify-center shrink-0">
                    <Fingerprint size={16} className="text-ghost-cyan" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                      {lang === 'ru' ? 'Ваш уникальный HWID ПК:' : 'Your Unique PC HWID:'}
                    </span>
                    <span className="font-mono text-xs font-bold text-white tracking-widest select-all truncate">
                      {hwid}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyHwid}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                    copiedHwid
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/[0.06] hover:bg-ghost-cyan/20 text-zinc-300 hover:text-white border-white/[0.08] hover:border-ghost-cyan/40'
                  }`}
                  title={lang === 'ru' ? 'Скопировать HWID' : 'Copy HWID'}
                >
                  {copiedHwid ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span>{lang === 'ru' ? 'Скопирован!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-ghost-cyan" />
                      <span>{lang === 'ru' ? 'Скопировать' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-1.5 pl-0.5">
                {lang === 'ru' 
                  ? 'Скопируйте этот HWID при оформлении заказа на сайте или вставьте полученный ключ ниже.' 
                  : 'Copy this HWID during checkout on the website or paste your key below.'}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-[11px] font-medium tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
                  <Lock size={12} className="text-zinc-400" /> {t.auth.keyInputTitle}
                </label>
                <span className="text-[10px] font-mono text-zinc-500">
                  {lang === 'ru' ? 'Формат: GHOST-PLAN-XXXX-XXXX-XXXX' : 'Format: GHOST-PLAN-XXXX-XXXX-XXXX'}
                </span>
              </div>

              <div 
                onClick={() => inputRef.current?.focus()}
                className={`grid ${slotCount === 5 ? 'grid-cols-5' : 'grid-cols-4'} gap-2 mb-2 cursor-pointer`}
              >
                {slots.map((val, slotIdx) => {
                  const isFilled = val && (slotIdx === 1 && isFiveBlock ? val.length >= 3 : val.length >= 4);
                  const placeholder = slotIdx === 0 
                    ? 'GHOST' 
                    : (isFiveBlock && slotIdx === 1 ? 'PLAN' : '----');
                  return (
                    <div 
                      key={slotIdx}
                      className={`hardware-well py-2 px-1 sm:px-2 flex flex-col items-center justify-center transition-all duration-200 border ${
                        isFilled
                          ? 'border-white/[0.18] bg-titanium-850 text-white'
                          : val.length > 0
                            ? 'border-ghost-cyan/40 bg-titanium-850 text-ghost-cyan'
                            : 'border-white/[0.04] text-zinc-600'
                      }`}
                    >
                      <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider truncate max-w-full">
                        {val ? val : placeholder}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={keyInput}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                  placeholder={t.auth.keyPlaceholder}
                  disabled={loading}
                  className="w-full bg-titanium-950/80 border border-white/[0.08] focus:border-ghost-cyan/60 rounded-xl px-4 py-2.5 text-xs font-mono tracking-wider text-white placeholder:text-zinc-600 outline-none transition-all shadow-bezel"
                />
              </div>

              <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-mono text-zinc-500">
                <span className={isFormatComplete ? 'text-emerald-400 flex items-center gap-1 font-medium' : ''}>
                  {isFormatComplete ? t.auth.formatValid : t.auth.formatHint}
                </span>
                <span>{keyInput.length}/{isFiveBlock ? 24 : 20}</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-xs mt-2.5 bg-rose-500/[0.08] border border-rose-500/20 px-3 py-2 rounded-xl animate-fade-in">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-titanium-950/60 border border-white/[0.05] hover:border-white/[0.1] transition-all text-[11px] leading-relaxed">
              <label className="relative flex items-center justify-center w-4 h-4 mt-0.5 rounded cursor-pointer border border-white/20 bg-titanium-900 transition-all hover:border-ghost-cyan/60 shrink-0">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasAgreed(checked);
                    if (checked) {
                      localStorage.setItem('ghosttweak_agreement_accepted', 'true');
                      if (error === t.auth.errMustAgree) setError('');
                    } else {
                      localStorage.removeItem('ghosttweak_agreement_accepted');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className={`w-full h-full rounded flex items-center justify-center transition-all ${
                  hasAgreed ? 'bg-ghost-cyan text-titanium-950 font-bold' : 'opacity-0'
                }`}>
                  <Check size={12} strokeWidth={3} />
                </div>
              </label>

              <div className="text-zinc-400">
                <span>{t.auth.agreePrefix}{' '}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLegalModalTab('privacy');
                    setLegalModalOpen(true);
                  }}
                  className="text-ghost-cyan hover:underline inline font-medium cursor-pointer"
                >
                  {t.auth.privacyLink}
                </button>
                <span>{' '}{t.auth.agreeAnd}{' '}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLegalModalTab('terms');
                    setLegalModalOpen(true);
                  }}
                  className="text-ghost-cyan hover:underline inline font-medium cursor-pointer"
                >
                  {t.auth.termsLink}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleActivate}
                disabled={loading}
                className="btn-cyan w-full py-3.5 flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase shadow-cyan-glow"
              >
                <ShieldCheck size={16} />
                <span>{t.auth.btnActivate}</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={handleTrial}
                disabled={loading}
                className="btn-outline w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                <span>{t.auth.btnTrial}</span>
              </button>

              <button
                onClick={handleFreeMode}
                disabled={loading}
                className="w-full py-2 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                {lang === 'ru' ? 'Или продолжить в бесплатной версии (Community Edition) →' : 'Or continue in Free Community Edition →'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-white/[0.06] flex justify-between items-center text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Shield size={11} /> GhostTweak
          </span>
          <span>{t.auth.localValidation}</span>
        </div>

      </div>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
        onAccept={() => {
          setHasAgreed(true);
          localStorage.setItem('ghosttweak_agreement_accepted', 'true');
          if (error === t.auth.errMustAgree) setError('');
        }}
      />
    </div>
  );
}
