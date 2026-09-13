'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown,
  Mail
} from 'lucide-react';

import { useI18n } from '@/lib/i18n';
import { PAYMENT_CONFIG } from '@/lib/paymentConfig';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const FAQS: FAQItem[] = [
  {
    id: 'anti-cheat',
    question: 'Безопасен ли GhostTweak для Riot Vanguard, Easy Anti-Cheat, BattlEye и VAC?',
    answer: 'Да. GhostTweak не модифицирует исполняемые файлы игр, не внедряет сторонние DLL в чужие процессы и не перехватывает системные хуки. Все настройки применяются через официальный Win32 API: параметры групповых политик реестра, мультимедийный таймер ядра (timeBeginPeriod) и параметры сетевого стека TCP/IP.',
    category: 'Безопасность',
    tags: ['Anti-Cheat', 'Vanguard', 'EAC', 'Faceit'],
  },
  {
    id: 'rollback',
    question: 'Как вернуть настройки Windows в исходное состояние?',
    answer: 'Перед применением любой оптимизации утилита автоматически экспортирует целевые ветки реестра в стандартный файл .reg в локальную папку %APPDATA%\\GhostTweak\\backups. В разделе «Резервные копии» можно в любой момент вернуть исходные параметры нажатием кнопки «Откатить».',
    category: 'Надежность',
    tags: ['Rollback', 'Резервная копия', 'Безопасность'],
  },
  {
    id: 'rust-vs-electron',
    question: 'Почему Rust + Tauri v2, а не Electron или C# .NET?',
    answer: 'Приложения на базе Electron запускают внутри себя Chromium и среду Node.js, потребляя сотни мегабайт ОЗУ. GhostTweak написан на Rust и скомпилирован в нативный машинный код. Программа весит 4.8 МБ, стартует менее чем за 20 миллисекунд и потребляет около 8.4 МБ оперативной памяти в простое.',
    category: 'Архитектура',
    tags: ['Rust', 'Tauri', 'Производительность'],
  },
  {
    id: 'xbox-store',
    question: 'Повлияют ли настройки на Microsoft Store и службы Xbox?',
    answer: 'Нет. GhostTweak не удаляет системные пакеты Windows. Microsoft Store, учетные записи Microsoft и сетевые службы Xbox Live остаются нетронутыми. Отключаются только фоновые задачи сбора телеметрии (DiagTrack) и фоновый захват видео GameDVR.',
    category: 'Совместимость',
    tags: ['Windows Store', 'Xbox Live', 'Game Pass'],
  },
  {
    id: 'win11-support',
    question: 'Поддерживаются ли Windows 11 (включая 24H2) и Windows 10?',
    answer: 'Да. GhostTweak протестирован на Windows 10 (21H2+) и Windows 11, включая актуальную сборку 24H2. При запуске утилита определяет версию ядра операционной системы и активирует только совместимые ключи.',
    category: 'Совместимость',
    tags: ['Win 11 24H2', 'Win 10', 'Совместимость'],
  },
  {
    id: 'uac-admin',
    question: 'Зачем утилите требуются права администратора?',
    answer: 'Права администратора необходимы для изменения системных параметров в ветке HKEY_LOCAL_MACHINE, остановки службы сбора телеметрии DiagTrack и управления мультимедийным таймером ядра Windows (MMCSS). Запрос прав происходит стандартно через окно контроля учетных записей (UAC).',
    category: 'Безопасность',
    tags: ['UAC', 'Администратор', 'Привилегии'],
  },
];

export const FAQ: React.FC = () => {
  const { t, lang } = useI18n();
  const [openId, setOpenId] = useState<string | null>('anti-cheat');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="relative py-28 border-t border-white/[0.06] overflow-hidden bg-[#0A0B10]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/[0.03] backdrop-blur-md mb-4">
            <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
              {t.faq.tag}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            {t.faq.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'border-white/20 bg-[#12141D] shadow-xl' 
                    : 'border-white/[0.06] bg-[#0E1017]/80 hover:border-white/15'
                }`}
                style={{
                  borderColor: isOpen ? 'var(--accent-border)' : undefined,
                }}
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span 
                      className="font-mono text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 mt-0.5 sm:mt-0"
                      style={{
                        backgroundColor: isOpen ? 'var(--accent-bg-subtle)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isOpen ? 'var(--accent-border)' : 'rgba(255, 255, 255, 0.06)',
                        color: isOpen ? 'var(--accent-color)' : '#94A3B8',
                      }}
                    >
                      {faq.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {faq.question}
                    </span>
                  </div>

                  <div 
                    className={`w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-white/10' : 'bg-white/[0.02]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed border-t border-white/[0.04]">
                        <p>{faq.answer}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                          {faq.tags.map((tag, tIdx) => (
                            <span 
                              key={tIdx}
                              className="font-mono text-[10px] text-slate-500 bg-black/30 px-2 py-0.5 rounded border border-white/5"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Support & Admin Contact Note */}
        <div className="mt-10 p-4 rounded-xl border border-white/[0.08] bg-[#121520] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-color)' }} />
            <span>
              {lang === 'ru' 
                ? 'Вопросы по совместимости или покупке лицензии напрямую у владельца?' 
                : 'Questions about compatibility or direct license purchase from the owner?'}
            </span>
          </div>
          <a 
            href={`mailto:${PAYMENT_CONFIG.adminEmail}?subject=${encodeURIComponent(lang === 'ru' ? 'Вопрос / Покупка лицензии GhostTweak' : 'Question / GhostTweak License Inquiry')}`}
            className="text-white hover:underline shrink-0 font-bold flex items-center gap-1.5"
            style={{ color: 'var(--accent-color)' }}
          >
            <span>{lang === 'ru' ? `Связаться с администратором (${PAYMENT_CONFIG.adminEmail}) \u2192` : `Contact Administrator (${PAYMENT_CONFIG.adminEmail}) \u2192`}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
