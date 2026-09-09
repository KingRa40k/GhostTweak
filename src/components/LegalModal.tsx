import React, { useState } from 'react';
import { X, Shield, Lock, FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { openUrl } from '../lib/tauri';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
  onAccept?: () => void;
}

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy', onAccept }: LegalModalProps) {
  const { lang } = useI18n();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-scale-in select-none font-sans">
      <div className="relative w-full max-w-xl bg-titanium-900/95 border border-white/[0.12] rounded-2xl shadow-satin p-6 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-ghost-cyan/10 text-ghost-cyan border border-ghost-cyan/30">
              {activeTab === 'privacy' ? <Lock size={18} /> : <FileText size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">
                {activeTab === 'privacy' 
                  ? (lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy')
                  : (lang === 'ru' ? 'Пользовательское соглашение' : 'Terms of Service & EULA')}
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">GhostTweak Desktop Security & Compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 pt-4 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-medium transition-all ${
              activeTab === 'privacy'
                ? 'bg-ghost-cyan/20 text-ghost-cyan border border-ghost-cyan/40 shadow-cyan-glow'
                : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            {lang === 'ru' ? '🔒 Конфиденциальность' : '🔒 Privacy Policy'}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-medium transition-all ${
              activeTab === 'terms'
                ? 'bg-ghost-cyan/20 text-ghost-cyan border border-ghost-cyan/40 shadow-cyan-glow'
                : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            {lang === 'ru' ? '📜 Условия использования' : '📜 Terms of Service'}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar my-3 pr-2 text-xs text-zinc-300 leading-relaxed space-y-4 font-sans select-text">
          {activeTab === 'privacy' ? (
            lang === 'ru' ? (
              <>
                <div className="p-3 rounded-xl bg-ghost-cyan/[0.06] border border-ghost-cyan/20 text-ghost-cyan text-[11px] font-mono">
                  ✓ 100% Локальная обработка • Без сбора личных данных • Без фонового трекинга
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">1. Принцип локальной конфиденциальности</h4>
                  <p className="text-zinc-400">
                    GhostTweak работает полностью локально на вашем компьютере. Приложение не отправляет ваши личные файлы, историю браузера, переписки или введённые пароли ни на какие серверы.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">2. Аппаратный идентификатор (HWID)</h4>
                  <p className="text-zinc-400">
                    Для привязки лицензии вычисляется необратимый SHA-256 хэш компонентов материнской платы и процессора. Этот хэш используется исключительно локально для предотвращения несанкционированного клонирования ключа.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">3. Отключение телеметрии Windows</h4>
                  <p className="text-zinc-400">
                    GhostTweak помогает защитить вашу приватность в Windows, отключая встроенные механизмы слежения Microsoft (DiagTrack, Cortana, сбор диагностических данных).
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-ghost-cyan/[0.06] border border-ghost-cyan/20 text-ghost-cyan text-[11px] font-mono">
                  ✓ 100% Local Processing • No Personal Data Collected • Zero Telemetry
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">1. Local Privacy First</h4>
                  <p className="text-zinc-400">
                    GhostTweak runs strictly on your machine. The software never transmits personal files, keystrokes, browser history, or private data to any remote server.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">2. Hardware Identifier (HWID)</h4>
                  <p className="text-zinc-400">
                    A cryptographic one-way SHA-256 hash of motherboard and CPU parameters is generated strictly for local key activation.
                  </p>
                </div>
              </>
            )
          ) : (
            lang === 'ru' ? (
              <>
                <div className="p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                  ✓ Совместимо с античитами: VAC, Easy Anti-Cheat, BattlEye, Vanguard, FACEIT
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">1. Безопасность и легальность</h4>
                  <p className="text-zinc-400">
                    GhostTweak НЕ внедряется в память процессов и НЕ модифицирует файлы игр (DLL-инъекции отсутствуют). Все оптимизации выполняются исключительно через официальный WinAPI и ветки реестра Windows (IFEO, Multimedia Scheduler, Network Throttle). Вы не получите блокировку в играх.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">2. Точки отката и резервные копии</h4>
                  <p className="text-zinc-400">
                    Перед каждым твиком утилита автоматически экспортирует ветку реестра в .reg файл. Вы в любой момент можете вернуть исходные значения системы в разделе «Резервные копии».
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">3. Лицензирование</h4>
                  <p className="text-zinc-400">
                    Лицензионный ключ предоставляет право использования программы на одном компьютере. Запрещается декомпиляция ядра и обход систем защиты.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                  ✓ Anti-Cheat Compliant: VAC, Easy Anti-Cheat, BattlEye, Vanguard, FACEIT
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">1. Zero Memory Injections</h4>
                  <p className="text-zinc-400">
                    GhostTweak does NOT inject code into game processes. All tweaks use documented Windows APIs, registry keys, and system scheduling policies. It is 100% safe from game bans.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">2. Automatic Backups</h4>
                  <p className="text-zinc-400">
                    System registry state is backed up before any changes are applied. You can revert tweaks at any time in 1 click.
                  </p>
                </div>
              </>
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => openUrl('https://ghosttweak.vercel.app')}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1 transition-colors"
          >
            <ExternalLink size={12} />
            <span>{lang === 'ru' ? 'Открыть сайт онлайн' : 'Open Website Online'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-zinc-300 font-medium transition-colors"
            >
              {lang === 'ru' ? 'Закрыть' : 'Close'}
            </button>

            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 font-bold"
              >
                <CheckCircle2 size={14} />
                <span>{lang === 'ru' ? 'Принять условия' : 'Accept Terms'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
