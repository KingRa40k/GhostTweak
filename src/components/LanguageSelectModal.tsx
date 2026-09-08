import React, { useState } from 'react';
import { Globe, ArrowRight, Check } from 'lucide-react';
import { Language, setStoredLanguage } from '../lib/i18n';

interface LanguageSelectModalProps {
  onSelect: (lang: Language) => void;
}

export default function LanguageSelectModal({ onSelect }: LanguageSelectModalProps) {
  const [selected, setSelected] = useState<Language>('ru');

  const handleConfirm = () => {
    setStoredLanguage(selected);
    onSelect(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 select-none animate-fade-in font-sans">
      <div className="relative w-full max-w-[500px] bg-titanium-900/95 border border-white/[0.1] rounded-2xl shadow-satin p-8 flex flex-col gap-6">
        
        {/* Glow Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-titanium-950 border border-white/[0.1] flex items-center justify-center text-ghost-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              <span>GhostTweak</span>
              <span className="tech-badge text-zinc-400">INIT</span>
            </h2>
            <p className="text-[11px] text-zinc-400 font-mono">
              Выберите язык / Select Language
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {/* Russian */}
          <button
            type="button"
            onClick={() => setSelected('ru')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              selected === 'ru'
                ? 'bg-ghost-cyan/[0.08] border-ghost-cyan/50 text-white shadow-glow'
                : 'bg-titanium-950/60 border-white/[0.06] hover:border-white/[0.15] text-zinc-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">Русский</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">RU</span>
              </div>
              <p className="text-xs text-zinc-400">
                Полная русская локализация, киберспортивные профили и документация
              </p>
            </div>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
              selected === 'ru'
                ? 'bg-ghost-cyan border-ghost-cyan text-black'
                : 'border-white/[0.1] bg-white/[0.02]'
            }`}>
              {selected === 'ru' && <Check size={14} className="stroke-[3]" />}
            </div>
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => setSelected('en')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              selected === 'en'
                ? 'bg-ghost-cyan/[0.08] border-ghost-cyan/50 text-white shadow-glow'
                : 'bg-titanium-950/60 border-white/[0.06] hover:border-white/[0.15] text-zinc-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">English</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">EN</span>
              </div>
              <p className="text-xs text-zinc-400">
                English interface, gaming latency profiles, and documentation
              </p>
            </div>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
              selected === 'en'
                ? 'bg-ghost-cyan border-ghost-cyan text-black'
                : 'border-white/[0.1] bg-white/[0.02]'
            }`}>
              {selected === 'en' && <Check size={14} className="stroke-[3]" />}
            </div>
          </button>
        </div>

        {/* Footer info & confirm */}
        <div className="pt-2 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-glow"
          >
            <span>{selected === 'ru' ? 'Продолжить' : 'Continue'}</span>
            <ArrowRight size={14} />
          </button>
          <span className="text-[10px] text-zinc-500 font-mono text-center">
            {selected === 'ru' 
              ? 'Язык можно изменить в любой момент в заголовке или настройках' 
              : 'You can change the language anytime in the titlebar or settings'}
          </span>
        </div>

      </div>
    </div>
  );
}
