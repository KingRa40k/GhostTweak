'use client';

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  AlertTriangle,
  Cpu,
  Zap,
  Shield,
  Clock,
  HardDrive,
  Activity,
  Layers
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface BenchmarkMetric {
  id: string;
  category: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  unit: string;
  ghosttweak: {
    display: string;
    score: number; // 0-100 (higher is better)
    noteRu: string;
    noteEn: string;
  };
  electron: {
    display: string;
    score: number;
    noteRu: string;
    noteEn: string;
  };
  scripts: {
    display: string;
    score: number;
    noteRu: string;
    noteEn: string;
  };
}

const BENCHMARKS: BenchmarkMetric[] = [
  {
    id: 'ram',
    category: 'Memory Footprint',
    nameRu: 'Потребление RAM в фоне',
    nameEn: 'Background RAM Footprint',
    descriptionRu: 'Объем выделенной памяти при активном мониторинге системы',
    descriptionEn: 'Working set memory allocated during active monitoring',
    unit: 'MB',
    ghosttweak: {
      display: '8.4 МБ',
      score: 96,
      noteRu: 'Rust Win32 API • 0 фонового GC',
      noteEn: 'Rust Win32 API • 0 background GC',
    },
    electron: {
      display: '380 – 520 МБ',
      score: 18,
      noteRu: 'Chromium + Node.js V8 движок',
      noteEn: 'Chromium + Node.js V8 engine',
    },
    scripts: {
      display: '0 МБ (нет UI)',
      score: 75,
      noteRu: 'Нет графического интерфейса и телеметрии',
      noteEn: 'No GUI or runtime telemetry',
    },
  },
  {
    id: 'startup',
    category: 'Latency',
    nameRu: 'Холодный старт процесса',
    nameEn: 'Cold Start Latency',
    descriptionRu: 'Время от клика до готовности UI и ядра к выполнению команд',
    descriptionEn: 'Time from execution to full UI and kernel readiness',
    unit: 'ms',
    ghosttweak: {
      display: '< 18 мс',
      score: 98,
      noteRu: 'Моментальная инициализация DirectWin32',
      noteEn: 'Instant DirectWin32 initialization',
    },
    electron: {
      display: '2 400 – 3 800 мс',
      score: 15,
      noteRu: 'Инициализация V8, парсинг бандлов',
      noteEn: 'V8 startup & heavy bundle parsing',
    },
    scripts: {
      display: '~ 450 мс',
      score: 60,
      noteRu: 'Интерпретация powershell.exe',
      noteEn: 'powershell.exe runtime load',
    },
  },
  {
    id: 'rollback',
    category: 'Safety & Atomicity',
    nameRu: 'Атомарность отката изменений',
    nameEn: 'Atomic Change Rollback',
    descriptionRu: 'Механизм резервного копирования и восстановления реестра Windows',
    descriptionEn: 'Windows registry backup and safe transactional restore',
    unit: 'mode',
    ghosttweak: {
      display: '1-Click RegExport',
      score: 95,
      noteRu: 'Атомарный .reg снапшот перед каждой операцией',
      noteEn: 'Atomic .reg snapshot before any mutation',
    },
    electron: {
      display: 'Частичный / JSON',
      score: 35,
      noteRu: 'Риск рассинхронизации при сбое процесса',
      noteEn: 'Desync risk if renderer process crashes',
    },
    scripts: {
      display: 'Ручной бэкап',
      score: 20,
      noteRu: 'В 90% скриптов откат вообще не предусмотрен',
      noteEn: '90% of scripts lack rollback logic',
    },
  },
  {
    id: 'kernel',
    category: 'Kernel Security',
    nameRu: 'Безопасность ядра системы',
    nameEn: 'Kernel Space Safety',
    descriptionRu: 'Использование системных Ring-0 драйверов и риск синего экрана (BSOD)',
    descriptionEn: 'Ring-0 driver injection risk and BSOD exposure',
    unit: 'security',
    ghosttweak: {
      display: '0 сторонних драйверов',
      score: 100,
      noteRu: 'Исключительно официальные Win32 / NT API',
      noteEn: 'Strictly official Win32 / NT kernel APIs',
    },
    electron: {
      display: 'Ring-0 драйверы',
      score: 30,
      noteRu: 'Установка неподписанных .sys служб',
      noteEn: 'Unsigned .sys services injection',
    },
    scripts: {
      display: 'Слепое применение',
      score: 25,
      noteRu: 'Ломает службы Windows Update и сетевой стек',
      noteEn: 'Breaks Windows Update & network stack',
    },
  },
  {
    id: 'timer',
    category: 'Input Lag',
    nameRu: 'Точность системного таймера (DPC)',
    nameEn: 'System Timer Resolution & DPC',
    descriptionRu: 'Разрешение прерываний процессора для отклика мыши и фреймтайма',
    descriptionEn: 'CPU interrupt clock resolution for mouse & frame timing',
    unit: 'jitter',
    ghosttweak: {
      display: '0.500 мс (NT Lock)',
      score: 97,
      noteRu: 'Аппаратная фиксация без плавающего джиттера',
      noteEn: 'Hardware lock without floating jitter',
    },
    electron: {
      display: '1.000 – 15.6 мс',
      score: 40,
      noteRu: 'Нестабильное удержание, конфликт с браузером',
      noteEn: 'Unstable lock, browser render collisions',
    },
    scripts: {
      display: '15.6 мс (Дефолт)',
      score: 30,
      noteRu: 'Сбрасывается при закрытии окна консоли',
      noteEn: 'Resets immediately when terminal closes',
    },
  },
  {
    id: 'size',
    category: 'Distribution',
    nameRu: 'Размер бинарного пакета',
    nameEn: 'Binary Distribution Size',
    descriptionRu: 'Чистый вес утилиты без скрытых зависимостей и мусора',
    descriptionEn: 'Pure binary weight without embedded browser bloat',
    unit: 'MB',
    ghosttweak: {
      display: '4.8 МБ',
      score: 99,
      noteRu: 'Один оптимизированный .exe x86_64',
      noteEn: 'Single optimized x86_64 native executable',
    },
    electron: {
      display: '180 – 320 МБ',
      score: 12,
      noteRu: 'Chromium, Node runtime, веб-ассеты',
      noteEn: 'Chromium, Node runtime & web assets',
    },
    scripts: {
      display: '< 1 МБ',
      score: 85,
      noteRu: 'Скрипты .bat/.ps1 без интерфейса',
      noteEn: 'Bare text scripts without GUI',
    },
  },
];

export const ComparisonMatrix: React.FC = () => {
  const { lang } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', labelRu: 'Все параметры', labelEn: 'All Metrics' },
    { id: 'perf', labelRu: 'Производительность', labelEn: 'Performance' },
    { id: 'safety', labelRu: 'Безопасность и ядро', labelEn: 'Safety & Kernel' },
  ];

  const filteredBenchmarks = BENCHMARKS.filter((b) => {
    if (activeCategory === 'perf') return ['ram', 'startup', 'timer', 'size'].includes(b.id);
    if (activeCategory === 'safety') return ['rollback', 'kernel'].includes(b.id);
    return true;
  });

  return (
    <section id="architecture" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#090b10]">
      {/* Background Accent Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none rounded-full blur-[160px] opacity-15"
        style={{ backgroundColor: 'var(--accent-color)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded border mb-4 backdrop-blur-md"
              style={{
                backgroundColor: 'var(--accent-bg-subtle)',
                borderColor: 'var(--accent-border)',
                color: 'var(--accent-color)',
              }}
            >
              <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
              <span className="font-mono text-xs uppercase tracking-widest font-bold">
                {lang === 'ru' ? 'Архитектурный бенчмарк' : 'Architectural Benchmark'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {lang === 'ru' ? 'Инженерия против раздутого софта' : 'Engineering vs. Bloated Software'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl font-sans">
              {lang === 'ru' 
                ? 'Сравнение GhostTweak с типичными Electron-твикерами и случайными PowerShell-скриптами из GitHub.'
                : 'Direct comparison of GhostTweak against heavy Electron tweakers and untrusted GitHub scripts.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0e111a] border border-white/10 self-start md:self-auto">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    active
                      ? 'font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  style={active ? {
                    backgroundColor: 'var(--accent-color)',
                    color: '#060708',
                    boxShadow: 'var(--accent-glow)',
                  } : {}}
                >
                  {lang === 'ru' ? cat.labelRu : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Competitor Column Headers */}
        <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 px-6 border-b border-white/[0.06] text-[11px] font-mono uppercase tracking-wider text-slate-400">
          <div className="col-span-5">{lang === 'ru' ? 'Метрика / Параметр' : 'Metric & Purpose'}</div>
          <div className="col-span-3 flex items-center gap-2 font-bold" style={{ color: 'var(--accent-color)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }}></span>
            GhostTweak (Rust Native)
          </div>
          <div className="col-span-2 text-slate-400">Electron Tweakers</div>
          <div className="col-span-2 text-slate-400">CMD / PS1 Scripts</div>
        </div>

        {/* Benchmark Bento Rows */}
        <div className="space-y-3 mt-4">
          {filteredBenchmarks.map((bm) => {
            const name = lang === 'ru' ? bm.nameRu : bm.nameEn;
            const desc = lang === 'ru' ? bm.descriptionRu : bm.descriptionEn;
            const gtNote = lang === 'ru' ? bm.ghosttweak.noteRu : bm.ghosttweak.noteEn;
            const elNote = lang === 'ru' ? bm.electron.noteRu : bm.electron.noteEn;
            const scNote = lang === 'ru' ? bm.scripts.noteRu : bm.scripts.noteEn;

            return (
              <div
                key={bm.id}
                className="group rounded-xl border border-white/[0.08] bg-[#0d1018]/90 hover:bg-[#111520] hover:border-white/20 p-5 sm:p-6 transition-all duration-200 shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  {/* Metric Info */}
                  <div className="lg:col-span-5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                        {bm.category}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-100">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      {desc}
                    </p>
                  </div>

                  {/* GhostTweak (Champion with Theme Accent Color) */}
                  <div 
                    className="lg:col-span-3 rounded-xl p-3.5 space-y-2 border transition-all"
                    style={{
                      backgroundColor: 'var(--accent-bg-subtle)',
                      borderColor: 'var(--accent-border)',
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-color)' }} />
                        <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                          GhostTweak
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-mono font-black text-white">
                        {bm.ghosttweak.display}
                      </span>
                    </div>
                    {/* Micro Progress Bar with Signature Accent Color */}
                    <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/10">
                      <div 
                        className="h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{ 
                          width: `${bm.ghosttweak.score}%`,
                          backgroundColor: 'var(--accent-color)',
                          boxShadow: 'var(--accent-glow)',
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-slate-300 truncate">
                      {gtNote}
                    </p>
                  </div>

                  {/* Electron Alternative */}
                  <div className="lg:col-span-2 rounded-xl p-3 bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400">Electron</span>
                      <span className="text-xs font-mono font-semibold text-slate-300">
                        {bm.electron.display}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500/80 rounded-full"
                        style={{ width: `${bm.electron.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      {elNote}
                    </p>
                  </div>

                  {/* Raw Scripts Alternative */}
                  <div className="lg:col-span-2 rounded-xl p-3 bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400">Scripts</span>
                      <span className="text-xs font-mono font-semibold text-slate-300">
                        {bm.scripts.display}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-red-500/70 rounded-full"
                        style={{ width: `${bm.scripts.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      {scNote}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Technical Assurance Callout */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-[#0d1018]/90 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--accent-bg-subtle)',
                borderColor: 'var(--accent-border)',
              }}
            >
              <Shield className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {lang === 'ru' ? '100% обратимые операции через Windows API' : '100% Reversible via Windows APIs'}
              </p>
              <p className="text-xs text-slate-400">
                {lang === 'ru' 
                  ? 'Каждое изменение сопровождается локальным экспортным файлом .reg до совершения операции.'
                  : 'Every modification generates a localized atomic .reg backup before touching system keys.'}
              </p>
            </div>
          </div>
          <a
            href="#features"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border"
            style={{
              backgroundColor: 'var(--accent-bg-subtle)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent-color)',
            }}
          >
            {lang === 'ru' ? 'Изучить архитектуру →' : 'Explore Architecture →'}
          </a>
        </div>
      </div>
    </section>
  );
};
