import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, Copy, Check, LogOut, ArrowRight, Cpu, AlertCircle } from 'lucide-react';
import { LicenseData, verifyLicenseKey } from '../lib/license';
import { useI18n } from '../lib/i18n';

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
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpgrade = async () => {
    if (!newKey.trim()) return;
    setLoading(true);
    setError('');

    const res = await verifyLicenseKey(newKey);
    if (res.success && res.data) {
      onUpdateLicense(res.data);
      setNewKey('');
      setLoading(false);
      onClose();
    } else {
      setError(res.error || (lang === 'ru' ? 'Ошибка активации ключа' : 'Error activating license key'));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-scale-in">
      <div className="relative w-full max-w-md glass-card p-6 border-ghost-border/90 rounded-2xl shadow-neon-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-ghost-border/70 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-ghost-accent/20 text-ghost-neon border border-ghost-accent/30">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t.licenseModal.title}</h3>
              <p className="text-xs text-ghost-muted">GhostTweak Licensing & Hardware Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-ghost-hover text-ghost-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current License Details */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="bg-ghost-bg/80 border border-ghost-border/60 rounded-xl p-3 flex flex-col gap-1.5">
            <span className="text-[11px] font-mono text-ghost-muted uppercase">{t.licenseModal.plan}</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ghost-green animate-pulse" />
                {license?.plan === 'VIP_LIFETIME' ? 'VIP Lifetime Edition' : 'Trial Edition'}
              </span>
              <span className="text-xs font-mono text-ghost-cyan">
                {license?.expiresAt}
              </span>
            </div>
          </div>

          <div className="bg-ghost-bg/80 border border-ghost-border/60 rounded-xl p-3 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-ghost-muted uppercase">{lang === 'ru' ? 'Текущий ключ' : 'Active Key'}</span>
              <span className="text-xs font-mono text-ghost-text mt-0.5">{license?.key}</span>
            </div>
            <button
              onClick={() => license && handleCopy(license.key)}
              title={lang === 'ru' ? "Скопировать ключ" : "Copy key"}
              className="p-1.5 rounded-lg hover:bg-ghost-card text-ghost-muted hover:text-ghost-neon transition-colors"
            >
              {copied ? <Check size={14} className="text-ghost-green" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="bg-ghost-bg/80 border border-ghost-border/60 rounded-xl p-3 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-ghost-muted uppercase">{t.licenseModal.hwid}</span>
              <span className="text-xs font-mono text-ghost-muted/90 mt-0.5">{license?.hwid}</span>
            </div>
            <button
              onClick={() => license && handleCopy(license.hwid)}
              title={lang === 'ru' ? "Скопировать HWID" : "Copy HWID"}
              className="p-1.5 rounded-lg hover:bg-ghost-card text-ghost-muted hover:text-ghost-cyan transition-colors"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        {/* Change / Upgrade Key Input */}
        <div className="pt-4 border-t border-ghost-border/70 flex flex-col gap-3">
          <label className="text-xs font-semibold text-ghost-muted uppercase flex items-center gap-1.5">
            <KeyRound size={13} className="text-ghost-neon" /> {lang === 'ru' ? 'Активировать другой ключ' : 'Activate Different Key'}
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              placeholder="GHOST-XXXX-XXXX-XXXX"
              className="flex-1 bg-ghost-bg border border-ghost-border focus:border-ghost-neon rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
            />
            <button
              onClick={handleUpgrade}
              disabled={loading || !newKey.trim()}
              className="neon-btn px-4 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              {loading ? <Cpu size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              <span>{t.auth.btnActivate}</span>
            </button>
          </div>

          {error && (
            <div className="text-ghost-red text-xs flex items-center gap-1.5 bg-ghost-red/10 border border-ghost-red/20 p-2 rounded-lg">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-ghost-border/50 flex justify-between items-center">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="text-xs text-ghost-red hover:underline flex items-center gap-1.5 font-medium"
          >
            <LogOut size={13} />
            <span>{t.licenseModal.btnLogout}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ghost-card hover:bg-ghost-hover text-xs font-medium text-ghost-text transition-colors"
          >
            {t.licenseModal.btnClose}
          </button>
        </div>

      </div>
    </div>
  );
}
