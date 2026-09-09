'use client';

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Github, 
  Download
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useI18n } from '@/lib/i18n';

export const Footer: React.FC = () => {
  const { t } = useI18n();
  const [copied, setCopied] = useState<boolean>(false);
  const sha256 = '038045ea66744b2a8772c2ee00740e632c9e8718ce4655fd3f75cc67d4747579';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#07080B] text-slate-400 font-sans text-xs relative overflow-hidden">
      {/* Top Section: System Requirements & Binary Verification */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-white/[0.05]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8 drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]" />
              <span className="font-mono text-base font-extrabold tracking-wider text-white">
                GHOST<span style={{ color: 'var(--accent-color)' }}>TWEAK</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {t.footer.desc}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="/downloads/GhostTweak_Setup_v1.0.0.exe"
                download="GhostTweak_Setup_v1.0.0.exe"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-[11px] font-bold text-white border border-white/10 bg-white/[0.04] hover:bg-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-accent" />
                <span>v1.0.0 Setup (.exe)</span>
              </a>

              <a
                href="https://github.com/KingRa40k/GhostTweak"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* System Requirements */}
          <div className="lg:col-span-4 space-y-3 font-mono">
            <span className="text-[11px] uppercase tracking-widest text-slate-300 font-bold block mb-1">
              {t.footer.reqTitle}
            </span>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0E1017] space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">OS:</span>
                <span className="text-slate-200">Win 10 (21H2+) / Win 11 (24H2)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Arch:</span>
                <span className="text-slate-200">x86_64 (Intel / AMD)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RAM:</span>
                <span className="text-slate-200">4 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disk:</span>
                <span className="text-emerald-400 font-bold">&lt; 15 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UAC:</span>
                <span className="text-amber-400">Administrator</span>
              </div>
            </div>
          </div>

          {/* Binary Integrity */}
          <div className="lg:col-span-4 space-y-3 font-mono">
            <span className="text-[11px] uppercase tracking-widest text-slate-300 font-bold block mb-1 flex items-center justify-between">
              <span>{t.footer.hashTitle}</span>
              <span className="text-[10px] text-emerald-400 font-normal">SHA-256</span>
            </span>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0E1017] space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">
                  SHA-256 ({t.footer.copy}):
                </span>
                <div className="flex items-center gap-2 p-2 rounded bg-black/40 border border-white/5">
                  <span className="font-mono text-[10px] text-slate-300 truncate">
                    {sha256}
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white shrink-0 transition-colors"
                    title={copied ? t.footer.copied : t.footer.copy}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                <span>x86_64-pc-windows-msvc</span>
                <span className="text-slate-400">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <div className="text-center sm:text-left">
          <p>© {new Date().getFullYear()} GhostTweak Team.</p>
          <p className="mt-1 text-slate-600">
            {t.footer.disclaimer}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 shrink-0 font-mono text-[10px]">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">
            {t.footer.terms}
          </Link>
          <span className="text-white/10 hidden sm:inline">|</span>
          <a href="#architecture" className="hover:text-slate-300 transition-colors">{t.header.compare}</a>
          <a href="#arsenal" className="hover:text-slate-300 transition-colors">{t.header.features}</a>
          <a href="#pricing" className="hover:text-slate-300 transition-colors">{t.header.pricing}</a>
          <a href="#faq" className="hover:text-slate-300 transition-colors">{t.header.faq}</a>
        </div>
      </div>
    </footer>
  );
};
