import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, ArrowRight,
  Check, Fingerprint, Lock, Shield, AlertCircle, Globe
} from 'lucide-react';
import { verifyLicenseKey, activateTrial, getSystemHwid, getSystemHwidAsync, LicenseData } from '../lib/license';
import { useI18n, setStoredLanguage } from '../lib/i18n';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [hwid, setHwid] = useState<string>(getSystemHwid());

  useEffect(() => {
    inputRef.current?.focus();
    getSystemHwidAsync().then(setHwid);
  }, []);

  // Format key input while preserving existing hyphens
  const handleKeyChange = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (clean.length > 25) clean = clean.substring(0, 25);

    let formatted = clean;
    // Auto-format only if typed as one contiguous word starting with GHOST without any hyphens
    if (!clean.includes('-') && clean.startsWith('GHOST') && clean.length > 5) {
      const rest = clean.slice(5);
      formatted = 'GHOST';
      if (rest.length > 0) formatted += '-' + rest.slice(0, 4);
      if (rest.length > 4) formatted += '-' + rest.slice(4, 8);
      if (rest.length > 8) formatted += '-' + rest.slice(8, 12);
    }

    setKeyInput(formatted);
    setError('');
  };

  const handleActivate = async () => {
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
      setAuthProgress(100);
      setAuthStep(t.auth.stepApproved);
      setSuccess(true);
      setTimeout(() => {
        onAuthorized(res.data!);
      }, 700);
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
    setLoading(true);
    setAuthProgress(50);
    setAuthStep(t.auth.stepTrial);

    try {
      const trialData = await activateTrial();
      setAuthProgress(100);
      setSuccess(true);
      setTimeout(() => {
        onAuthorized(trialData);
      }, 600);
    } catch {
      setError(t.auth.errTrial);
      setLoading(false);
    }
  };

  const parts = keyInput.split('-');
  const slots = [
    parts[0] || '',
    parts[1] || '',
    parts[2] || '',
    parts[3] || '',
  ];

  const isFormatComplete = keyInput.length >= 19 || (keyInput.startsWith('GHOST-') && keyInput.length >= 16);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-titanium-950 micro-grid overflow-hidden select-none font-sans">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-ghost-cyan/[0.05] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div 
        className={`relative z-10 w-full max-w-[480px] bg-titanium-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-satin p-8 transition-all duration-300 ${
          isErrorShaking ? 'translate-x-[-6px] animate-bounce' : ''
        } ${
          success 
            ? 'border-emerald-500/40 shadow-emerald-glow' 
            : 'hover:border-white/[0.14]'
        }`}
      >
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-titanium-950 border border-white/[0.1] shadow-bezel flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-ghost-cyan shadow-[0_0_10px_#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">GhostTweak</span>
                <span className="tech-badge text-zinc-400">v1.0.0</span>
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

        {/* Verification / Loading State */}
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

            {/* Hardware Binding Plate */}
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
          /* Normal Auth Form */
          <div className="flex flex-col gap-5">
            
            {/* Input Header & Machine HWID */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-[11px] font-medium tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
                  <Lock size={12} className="text-zinc-400" /> {t.auth.keyInputTitle}
                </label>
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                  <Fingerprint size={12} className="text-zinc-400" />
                  <span>HWID: {hwid.slice(0, 11)}...</span>
                </div>
              </div>

              {/* Slot Cards */}
              <div 
                onClick={() => inputRef.current?.focus()}
                className="grid grid-cols-4 gap-2 mb-2 cursor-pointer"
              >
                {[0, 1, 2, 3].map((slotIdx) => {
                  const val = slots[slotIdx];
                  const isFilled = val && val.length >= 4;
                  return (
                    <div 
                      key={slotIdx}
                      className={`hardware-well py-2.5 px-2 flex flex-col items-center justify-center transition-all duration-200 border ${
                        isFilled
                          ? 'border-white/[0.18] bg-titanium-850 text-white'
                          : val.length > 0
                            ? 'border-ghost-cyan/40 bg-titanium-850 text-ghost-cyan'
                            : 'border-white/[0.04] text-zinc-600'
                      }`}
                    >
                      <span className="font-mono text-xs font-semibold tracking-wider">
                        {val ? val.padEnd(slotIdx === 0 ? 5 : 4, '·') : (slotIdx === 0 ? 'GHOST' : '----')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
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

              {/* Sub-label */}
              <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-mono text-zinc-500">
                <span className={isFormatComplete ? 'text-emerald-400 flex items-center gap-1 font-medium' : ''}>
                  {isFormatComplete ? t.auth.formatValid : t.auth.formatHint}
                </span>
                <span>{keyInput.length}/20</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-xs mt-2.5 bg-rose-500/[0.08] border border-rose-500/20 px-3 py-2 rounded-xl animate-fade-in">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={handleActivate}
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase"
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
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-white/[0.06] flex justify-between items-center text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Shield size={11} /> GhostTweak
          </span>
          <span>{t.auth.localValidation}</span>
        </div>

      </div>
    </div>
  );
}
