'use client';

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ComparisonRow {
  metric: string;
  category: string;
  electron: {
    value: string;
    status: 'bad' | 'warning' | 'good';
    subtext: string;
  };
  scripts: {
    value: string;
    status: 'bad' | 'warning' | 'good';
    subtext: string;
  };
  ghosttweak: {
    value: string;
    status: 'good';
    subtext: string;
  };
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    metric: 'Размер исполняемого файла',
    category: 'Архитектура',
    electron: {
      value: '140 – 280 МБ',
      status: 'bad',
      subtext: 'Включает Chromium и среду Node.js',
    },
    scripts: {
      value: '< 50 КБ',
      status: 'good',
      subtext: 'Текстовые файлы .bat / .ps1',
    },
    ghosttweak: {
      value: '4.8 МБ',
      status: 'good',
      subtext: 'Скомпилированный бинарник Rust (Win32 API)',
    },
  },
  {
    metric: 'Потребление ОЗУ в фоне',
    category: 'Ресурсы',
    electron: {
      value: '220 – 480 МБ',
      status: 'bad',
      subtext: 'Несколько фоновых процессов рендера',
    },
    scripts: {
      value: 'Не применимо',
      status: 'warning',
      subtext: 'Однократное выполнение команды',
    },
    ghosttweak: {
      value: '8.4 МБ',
      status: 'good',
      subtext: 'Минимальное потребление памяти без фоновых сборщиков мусора',
    },
  },
  {
    metric: 'Холодный старт приложения',
    category: 'Производительность',
    electron: {
      value: '1800 – 3400 мс',
      status: 'bad',
      subtext: 'Инициализация движка браузера',
    },
    scripts: {
      value: '~ 300 мс',
      status: 'warning',
      subtext: 'Запуск интерпретатора PowerShell',
    },
    ghosttweak: {
      value: '< 20 мс',
      status: 'good',
      subtext: 'Быстрый запуск нативного процесса',
    },
  },
  {
    metric: 'Работа с реестром Windows',
    category: 'Надежность',
    electron: {
      value: 'Node.js FFI',
      status: 'warning',
      subtext: 'Прослойки между JS и WinAPI',
    },
    scripts: {
      value: 'Вызовы reg.exe',
      status: 'bad',
      subtext: 'Скриптовые команды без проверки типов',
    },
    ghosttweak: {
      value: 'Win32 API & winreg',
      status: 'good',
      subtext: 'Прямые системные вызовы через нативные структуры данных',
    },
  },
  {
    metric: 'Резервное копирование и откат',
    category: 'Безопасность',
    electron: {
      value: 'Редко предусмотрен',
      status: 'bad',
      subtext: 'Обычно не сохраняет исходные значения',
    },
    scripts: {
      value: 'Отсутствует',
      status: 'bad',
      subtext: 'Для отката требуется ручное восстановление системы',
    },
    ghosttweak: {
      value: 'Автоматический .reg бэкап',
      status: 'good',
      subtext: 'Экспорт ветки реестра перед каждым изменением',
    },
  },
  {
    metric: 'Совместимость с античитами',
    category: 'Безопасность',
    electron: {
      value: 'Зависит от сборки',
      status: 'warning',
      subtext: 'Оверлеи могут вызывать предупреждения',
    },
    scripts: {
      value: 'Риск блокировок',
      status: 'bad',
      subtext: 'Отключение системных служб может нарушать требования античитов',
    },
    ghosttweak: {
      value: 'Безопасно',
      status: 'good',
      subtext: 'Без инъекций DLL, используются только стандартные параметры Windows',
    },
  },
  {
    metric: 'Телеметрия и внешние запросы',
    category: 'Приватность',
    electron: {
      value: 'Встроенная аналитика',
      status: 'bad',
      subtext: 'Сбор ошибок и метрик использования через сеть',
    },
    scripts: {
      value: 'Зависит от источника',
      status: 'bad',
      subtext: 'Возможны скрытые сетевые запросы',
    },
    ghosttweak: {
      value: 'Полный офлайн',
      status: 'good',
      subtext: 'Работает без сетевых запросов и сторонней аналитики',
    },
  },
];

export const ComparisonMatrix: React.FC = () => {
  const { t } = useI18n();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <section id="architecture" className="relative py-28 border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] pointer-events-none rounded-full blur-[140px] opacity-15"
        style={{ backgroundColor: 'var(--accent-color)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/[0.03] backdrop-blur-md mb-4">
            <Layers className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
              {t.comparison.tag}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            {t.comparison.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans">
            {t.comparison.subtitle}
          </p>
        </div>

        {/* Comparison Table / Grid */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0E1015]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/[0.08] bg-[#14161E]/80 text-xs font-mono uppercase tracking-wider text-slate-400">
            <div className="p-4 md:col-span-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span>{t.comparison.colFeature}</span>
            </div>
            <div className="hidden md:flex p-4 md:col-span-2 items-center justify-center text-red-400/80">
              <span>{t.comparison.colElectron}</span>
            </div>
            <div className="hidden md:flex p-4 md:col-span-3 items-center justify-center text-amber-400/80">
              <span>{t.comparison.colScripts}</span>
            </div>
            <div 
              className="p-4 md:col-span-3 flex items-center justify-center font-bold relative"
              style={{ color: 'var(--accent-color)', backgroundColor: 'var(--accent-bg-subtle)' }}
            >
              <span>{t.comparison.colGhostTweak}</span>
              <div 
                className="absolute inset-y-0 left-0 w-0.5" 
                style={{ backgroundColor: 'var(--accent-color)' }}
              />
              <span className="tracking-widest flex items-center gap-2">
                GhostTweak (Rust)
              </span>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/[0.05]">
            {COMPARISON_DATA.map((row, idx) => {
              const isHovered = hoveredRow === idx;

              return (
                <div 
                  key={idx}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`grid grid-cols-1 md:grid-cols-12 transition-colors duration-150 ${
                    isHovered ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  {/* Metric column */}
                  <div className="p-4 md:col-span-4 flex flex-col justify-center">
                    <span className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-1">
                      {row.category}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-200">
                      {row.metric}
                    </span>
                  </div>

                  {/* Electron Column */}
                  <div className="p-4 md:col-span-2 flex flex-col justify-center md:items-center border-t md:border-t-0 border-white/[0.03] bg-black/10">
                    <span className="md:hidden font-mono text-[10px] text-red-400 uppercase mb-1">
                      Electron / C#:
                    </span>
                    <div className="flex items-center gap-1.5 text-red-400 font-mono text-sm font-bold">
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span>{row.electron.value}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 text-left md:text-center mt-1 leading-tight font-sans">
                      {row.electron.subtext}
                    </span>
                  </div>

                  {/* Scripts Column */}
                  <div className="p-4 md:col-span-3 flex flex-col justify-center md:items-center border-t md:border-t-0 border-white/[0.03] bg-black/10">
                    <span className="md:hidden font-mono text-[10px] text-amber-400 uppercase mb-1">
                      Скрипты .bat/.ps1:
                    </span>
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono text-sm font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{row.scripts.value}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 text-left md:text-center mt-1 leading-tight font-sans">
                      {row.scripts.subtext}
                    </span>
                  </div>

                  {/* GhostTweak Column */}
                  <div 
                    className="p-4 md:col-span-3 flex flex-col justify-center md:items-center border-t md:border-t-0 border-white/[0.04] relative transition-all"
                    style={{
                      backgroundColor: isHovered ? 'var(--accent-bg-subtle)' : 'rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <div 
                      className="absolute inset-y-0 left-0 w-[1px] hidden md:block" 
                      style={{ backgroundColor: 'var(--accent-border)' }} 
                    />
                    
                    <span className="md:hidden font-mono text-[10px] uppercase mb-1" style={{ color: 'var(--accent-color)' }}>
                      GhostTweak:
                    </span>

                    <div 
                      className="flex items-center gap-1.5 font-mono text-sm font-extrabold"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{row.ghosttweak.value}</span>
                    </div>
                    <span className="text-[11px] text-slate-300 text-left md:text-center mt-1 leading-tight font-sans font-medium">
                      {row.ghosttweak.subtext}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner */}
          <div className="p-4 bg-[#14161E]/90 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Скомпилировано с флагами LTO (Link-Time Optimization) и strip-symbols.</span>
            </div>
            <div className="text-slate-500 shrink-0">
              Поддержка: Windows 10 (21H2+) и Windows 11 (24H2)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
