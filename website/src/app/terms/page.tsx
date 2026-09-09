'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Globe, Shield, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function TermsPage() {
  const { lang, setLang } = useI18n();
  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-cyan-400 selection:text-black font-sans pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-obsidian-900/80 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEn ? 'Back to Main' : 'На главную'}</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors hidden sm:inline-block"
            >
              {isEn ? 'Privacy Policy' : 'Политика конфиденциальности'}
            </Link>

            <button
              onClick={() => setLang(isEn ? 'ru' : 'en')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono transition-all text-slate-300"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Header Title */}
        <div className="mb-12 border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            <FileText className="w-3.5 h-3.5" />
            <span>{isEn ? 'Legal Terms & EULA' : 'Пользовательское соглашение'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isEn ? 'Terms of Service & License Agreement' : 'Пользовательское соглашение и условия использования'}
          </h1>
          <p className="mt-3 text-sm font-mono text-slate-400">
            {isEn ? 'Effective Date: September 2026 • Version 1.0.0 • EULA' : 'Дата вступления в силу: Сентябрь 2026 • Версия 1.0.0 • EULA'}
          </p>
        </div>

        {/* Content Body */}
        {isEn ? (
          <article className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
            <section className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-200">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                Anti-Cheat & Game Integrity Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                GhostTweak is not a cheat, hack, or game exploit. It does not inject code into gaming processes, hook DirectX, or modify game binaries. It configures standard Windows OS parameters and is 100% compliant with VAC, Vanguard, Easy Anti-Cheat, and BattlEye.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                1. License Grant
              </h2>
              <p>
                GhostTweak grants you a personal, non-exclusive, non-transferable license to install and run the software on authorized personal computers strictly in accordance with its intended documentation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                2. Scope of System Modifications
              </h2>
              <p>To deliver optimized latency and frame pacing, GhostTweak performs:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 text-sm">
                <li>Adjustments to the Windows multimedia timer interval down to 0.500 ms via <code>timeBeginPeriod</code>.</li>
                <li>Registry adjustments for Windows GameDVR, DiagTrack telemetry, and MMCSS network scheduling.</li>
                <li>Flushing of unreferenced memory pages and DirectX / GPU shader caches.</li>
                <li>Automatic generation of standard <code>.reg</code> snapshots before applying any tweak.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                3. Disclaimer & Limitation of Liability
              </h2>
              <p>
                The software is provided on an &quot;AS IS&quot; basis without warranties of any kind. While GhostTweak provides automated backups for all modified registry keys, users are responsible for verifying their hardware stability when applying aggressive system tweaks.
              </p>
            </section>
          </article>
        ) : (
          <article className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
            <section className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-200">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                Гарантия чистоты перед античитами
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                GhostTweak не является читом и не дает нечестных игровых преимуществ. Программа не внедряет DLL-библиотеки в память игр, не перехватывает рендеринг и полностью совместима с защитой Valve Anti-Cheat (VAC), Riot Vanguard, Easy Anti-Cheat (EAC) и BattlEye.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                1. Предоставление лицензии
              </h2>
              <p>
                Правообладатель предоставляет Пользователю неисключительную персональную лицензию на использование программного обеспечения GhostTweak на принадлежащих ему компьютерах в соответствии с заявленным функционалом.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                2. Характер выполняемых оптимизаций
              </h2>
              <p>Для устранения системных задержек и стабилизации фреймтайма программа производит:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 text-sm">
                <li>Переключение мультимедийного таймера ядра на 0.500 мс через системные вызовы Win32.</li>
                <li>Настройку параметров системного реестра (отключение оверлея GameDVR, фоновой телеметрии DiagTrack).</li>
                <li>Сброс рабочих наборов неиспользуемой оперативной памяти и очистку устаревших кэшей шейдеров.</li>
                <li>Создание обязательных локальных точек отката (.reg) перед каждым изменением системы.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                3. Отказ от гарантий и ответственность
              </h2>
              <p>
                Программа предоставляется на условиях «КАК ЕСТЬ» («AS IS»). Встроенный механизм автоматического бэкапа реестра позволяет в любой момент вернуть систему к исходному состоянию в один клик.
              </p>
            </section>
          </article>
        )}

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{isEn ? 'Read Privacy Policy' : 'Политика конфиденциальности'}</span>
          </Link>

          <Link href="/docs" className="hover:text-cyan-400 transition-colors">
            {isEn ? 'Technical Documentation' : 'Техническая документация'}
          </Link>
        </div>
      </main>
    </div>
  );
}
