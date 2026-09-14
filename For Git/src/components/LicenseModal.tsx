import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, Copy, Check, LogOut, ArrowRight, Cpu, AlertCircle, Sparkles, ExternalLink, Shield } from 'lucide-react';
import { LicenseData, verifyLicenseKey } from '../lib/license';
import { useI18n } from '../lib/i18n';
import FireworksOverlay from './FireworksOverlay';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: LicenseData | null;
  onUpdateLicense: (license: LicenseData) => void;
  onLogout: () => void;
}

export default function LicenseModal({ isOpen, onClose, license, onUpdateLicense, onLogout }: LicenseModalProps) {
  const { t, lang } = useI18n();
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, isHwid: boolean) => {
    navigator.clipboard.writeText(text);
    if (isHwid) {
      setCopiedHwid(true);
      setTimeout(() => setCopiedHwid(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleUpgrade = async () => {
    if (!newKey.trim()) return;
    setLoading(true);
    setError('');

    const res = await verifyLicenseKey(newKey);
    if (res.success && res.data) {
      onUpdateLicense(res.data);
      setNewKey('');
      setShowFireworks(true);
      setTimeout(() => {
        setLoading(false);
        setShowFireworks(false);
        onClose();
      }, 2500);
    } else {
      setError(res.error || (lang === 'ru' ? 'Ошибка активации ключа' : 'Error activating license key'));
      setLoading(false);
    }
  };

  const isBeta = license?.plan === 'BETA_TESTER';
  const isVip = license?.plan === 'VIP_LIFETIME';
  const isDayPass = license?.plan === 'DAY_PASS';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 page-enter">
      {showFireworks && <FireworksOverlay durationMs={2600} />}
      <div className="relative w-full max-w-lg bg-titanium-900/95 border border-white/[0.12] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-zinc-100">
        
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: 'var(--accent-color, #00f0ff)' }}
        />

        <div className="flex justify-between items-start pb-4 mb-5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-titanium-950 border border-white/[0.1] shadow-bezel flex items-center justify-center">
              <ShieldCheck size={22} className="text-ghost-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">GhostTweak Pro</h3>
                <span className="tech-badge text-emerald-400">{lang === 'ru' ? 'Лицензия' : 'License'}</span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{lang === 'ru' ? 'Криптографическая подпись (Ed25519)' : 'Cryptographic signature (Ed25519)'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 mb-5 p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              {t.licenseModal.plan}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isBeta ? 'BETA TESTER' : isVip ? 'LIFETIME' : isDayPass ? '24 HOURS' : 'TRIAL ACTIVE'}
            </span>
          </div>

          <div className="text-lg font-black text-white flex items-center gap-2">
            {isBeta ? (
              <>
                <Sparkles size={18} className="text-ghost-neon" />
                <span>Beta Tester Pass</span>
              </>
            ) : isVip ? (
              <>
                <Sparkles size={18} className="text-amber-400" />
                <span>VIP Lifetime</span>
              </>
            ) : isDayPass ? (
              <>
                <Cpu size={18} className="text-ghost-cyan" />
                <span>PRO 24h</span>
              </>
            ) : (
              <>
                <Shield size={18} className="text-ghost-cyan" />
                <span>Trial (3 days)</span>
              </>
            )}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            {lang === 'ru' ? 'Действительна до:' : 'Valid until:'} <span className="text-ghost-cyan font-bold">{license?.expiresAt || 'Бессрочно'}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2.5 mb-5 relative z-10">
          
          <div className="p-3 rounded-xl bg-titanium-950/80 border border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-col overflow-hidden mr-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{lang === 'ru' ? 'Лицензионный ключ' : 'Active License Key'}</span>
              <span className="text-xs font-mono text-zinc-200 truncate select-all mt-0.5">{license?.key}</span>
            </div>
            <button
              onClick={() => license && copyToClipboard(license.key, false)}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedKey ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedKey ? 'OK' : (lang === 'ru' ? 'Копия' : 'Copy')}</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-titanium-950/80 border border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-col overflow-hidden mr-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{lang === 'ru' ? 'Аппаратный HWID ПК' : 'Machine HWID Signature'}</span>
              <span className="text-xs font-mono text-ghost-cyan font-semibold truncate select-all mt-0.5">{license?.hwid}</span>
            </div>
            <button
              onClick={() => license && copyToClipboard(license.hwid, true)}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedHwid ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedHwid ? 'OK' : (lang === 'ru' ? 'Копия' : 'Copy')}</span>
            </button>
          </div>

        </div>

        <div className="pt-4 border-t border-white/[0.08] relative z-10 flex flex-col gap-2.5">
          <label className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
            <KeyRound size={13} className="text-ghost-cyan" />
            <span>{lang === 'ru' ? 'Активировать новый ключ' : 'Activate New Key'}</span>
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleUpgrade()}
              placeholder="GHOST-XXXX-XXXX-XXXX"
              className="flex-1 bg-titanium-950 border border-white/[0.1] focus:border-ghost-cyan/60 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none shadow-inner"
            />
            <button
              onClick={handleUpgrade}
              disabled={loading || !newKey.trim()}
              className="btn-cyan px-4 py-2.5 text-xs font-bold font-mono flex items-center gap-1.5 shrink-0"
            >
              {loading ? <Cpu size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              <span>{t.auth.btnActivate}</span>
            </button>
          </div>

          {error && (
            <div className="text-rose-400 text-xs flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl animate-fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-between items-center relative z-10">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <LogOut size={13} />
            <span>{t.licenseModal.btnLogout}</span>
          </button>

          <button
            onClick={onClose}
            className="btn-outline px-5 py-2 text-xs font-semibold"
          >
            {t.licenseModal.btnClose}
          </button>
        </div>

      </div>
    </div>
  );
}
