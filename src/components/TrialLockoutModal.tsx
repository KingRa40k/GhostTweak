import React, { useState } from 'react';
import { Lock, Clock, Trash2, Copy, Check, ShieldAlert, Mail } from 'lucide-react';
import { invoke } from '../lib/tauri';
import { TrialStatus } from '../lib/types';
import { useI18n } from '../lib/i18n';

interface TrialLockoutModalProps {
  trialStatus: TrialStatus;
}

export default function TrialLockoutModal({ trialStatus }: TrialLockoutModalProps) {
  const { lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const [isSelfDestructing, setIsSelfDestructing] = useState(false);

  const contactEmail = "admin@ghosttweak.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelfDestruct = async () => {
    setIsSelfDestructing(true);
    try {
      await invoke('trigger_self_destruct');
    } catch {
      // Fallback exit if invocation errors
      window.close();
    }
  };

  const isRu = lang === 'ru';

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#0C0D14] border border-rose-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-rose-500/10 blur-3xl pointer-events-none" />

        {/* Lock header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {isRu ? 'Ознакомительный период завершён' : 'Evaluation Period Expired'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-1">
              {isRu ? '24-часовой триал заблокирован' : '24-Hour Trial Expired'}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-300 font-sans leading-relaxed mb-6">
          {isRu 
            ? 'Срок действия данной ознакомительной сборки подошёл к концу. Все системные настройки безопасно возвращены в исходное состояние. Доступ к интерфейсу заблокирован.'
            : 'This evaluation build has reached its 24-hour time limit. All system tweaks have been safely restored to stock. Access to the interface has been locked.'}
        </p>

        {/* Technical specs card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-6 font-mono text-xs space-y-2 text-zinc-400">
          <div className="flex justify-between items-center">
            <span>{isRu ? 'Тип сборки:' : 'Build Mode:'}</span>
            <span className="text-zinc-200 font-bold">24H Evaluation Build</span>
          </div>
          <div className="flex justify-between items-center">
            <span>{isRu ? 'Время первого запуска:' : 'Activated At:'}</span>
            <span className="text-zinc-200">{trialStatus.started_at_human}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>{isRu ? 'Статус защиты:' : 'Integrity Status:'}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {isRu ? 'Защищено (Safe Stock)' : 'Disarmed & Reversible'}
            </span>
          </div>
        </div>

        {/* Buyer info */}
        <div className="p-4 rounded-xl bg-ghost-surface/60 border border-white/[0.06] mb-6">
          <span className="block font-mono text-[11px] text-ghost-cyan font-bold tracking-wider uppercase mb-1">
            {isRu ? 'Хотите приобрести полный исходный код?' : 'Interested in purchasing full source code?'}
          </span>
          <p className="text-xs text-zinc-400">
            {isRu 
              ? 'Полный проект GhostTweak (исходный код Rust + Tauri v2, лендинг Next.js, генератор лицензий без сервера) продаётся на SideProjectors / Telderi.'
              : 'GhostTweak turnkey project (pure Rust + Tauri v2, Next.js landing, zero-server licensing generator) is listed for sale on SideProjectors / Telderi.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopyEmail}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">{isRu ? 'Email скопирован!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-ghost-cyan" />
                <span>{contactEmail}</span>
              </>
            )}
          </button>

          <button
            onClick={handleSelfDestruct}
            disabled={isSelfDestructing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-mono font-bold shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {isSelfDestructing 
                ? (isRu ? 'Самоудаление...' : 'Cleaning up...') 
                : (isRu ? 'Самоудаление и выход' : 'Self-Destruct & Exit')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
