'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function PrivacyPolicyPage() {
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
              href="/terms"
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors hidden sm:inline-block"
            >
              {isEn ? 'Terms of Service' : 'Условия использования'}
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
            <Shield className="w-3.5 h-3.5" />
            <span>{isEn ? 'Legal Documentation' : 'Юридическая документация'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isEn ? 'Privacy Policy' : 'Политика конфиденциальности'}
          </h1>
          <p className="mt-3 text-sm font-mono text-slate-400">
            {isEn ? 'Effective Date: September 2026 • Version 1.0.0 • Local-First Zero Telemetry' : 'Дата вступления в силу: Сентябрь 2026 • Версия 1.0.0 • Zero Telemetry'}
          </p>
        </div>

        {/* Content Body */}
        {isEn ? (
          <article className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
            <section className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-200">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                Core Philosophy: Zero Telemetry & Offline Processing
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                GhostTweak is engineered strictly as an offline, local-first utility. It does not transmit user behavior, hardware logs, or personal documents to remote cloud infrastructure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                1. Data Categories & Purpose of Processing
              </h2>
              <p>GhostTweak queries only the minimal hardware information required to apply system-level performance optimizations:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 text-sm">
                <li><strong className="text-white">Hardware UUID (HWID):</strong> An anonymized SHA-256 hash derived from the motherboard and Windows Cryptography identifier. Stored locally in <code>%APPDATA%\GhostTweak\</code> solely for software license binding.</li>
                <li><strong className="text-white">System Diagnostics:</strong> Real-time processor, graphics card, RAM usage, and monitor refresh rates queried through standard Win32 APIs for display on the dashboard.</li>
                <li><strong className="text-white">Cache & Temporary Files:</strong> Paths to DirectX, NVIDIA, AMD, and Windows Temp folders for scheduled cache flushing by user command.</li>
                <li><strong className="text-white">Registry Snapshots:</strong> Standard <code>.reg</code> backup files created before applying tweaks to guarantee safe one-click rollbacks.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                2. Outbound Network Connections
              </h2>
              <p>The desktop software operates 100% offline:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 text-sm">
                <li>No background analytics pings or automatic data uploads.</li>
                <li>No advertising tracking scripts or behavioral telemetry SDKs.</li>
                <li>DNS preset adjustments execute locally on your physical network adapters via Windows netsh.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                3. User Control & Data Retention
              </h2>
              <p>
                All configuration files, logs, and registry backups reside within your local user directory at <code>%APPDATA%\GhostTweak\</code>. You retain full control to inspect, export, or delete these files at any time.
              </p>
            </section>
          </article>
        ) : (
          <article className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
            <section className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-200">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                Базовый принцип: полная автономность и Zero Telemetry
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                GhostTweak разработан на базе архитектуры Local-First. Программа не собирает, не сохраняет и не передает персональные данные на сторонние серверы, функционируя полностью локально на вашем компьютере.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                1. Категории данных и цели локального использования
              </h2>
              <p>Приложение опрашивает строго технические параметры операционной системы, необходимые для оптимизации производительности:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 text-sm">
                <li><strong className="text-white">Аппаратный HWID:</strong> криптографический хэш (SHA-256), созданный на базе серийного номера материнской платы и системного реестра Windows. Сохраняется локально в <code>%APPDATA%\GhostTweak\</code> исключительно для проверки лицензии.</li>
                <li><strong className="text-white">Спецификации оборудования:</strong> модель CPU, GPU, объем RAM и частота развертки монитора, запрашиваемые через стандартный Win32 API в реальном времени.</li>
                <li><strong className="text-white">Временные файлы и кэши:</strong> системные директории Temp, кэши шейдеров DirectX, NVIDIA и AMD, очищаемые строго по явной команде пользователя.</li>
                <li><strong className="text-white">Резервные копии реестра:</strong> стандартные файлы <code>.reg</code>, сохраняемые перед любым изменением для гарантии мгновенного отката.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                2. Сетевая активность
              </h2>
              <p>Десктопное приложение GhostTweak работает в полностью изолированном режиме:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 text-sm">
                <li>Отсутствуют фоновые сетевые запросы, отправка дампов памяти и сторонние трекеры.</li>
                <li>Смена DNS-шлюзов производится локально в конфигурации сетевых адаптеров Windows через утилиту netsh.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-l-2 border-cyan-400 pl-3">
                3. Права пользователя и удаление данных
              </h2>
              <p>
                Пользователь имеет полный доступ ко всем генерируемым файлам и резервным копиям в каталоге <code>%APPDATA%\GhostTweak\</code>. При удалении приложения все локальные файлы могут быть удалены без остатка.
              </p>
            </section>
          </article>
        )}

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <Link href="/terms" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>{isEn ? 'Read Terms of Service' : 'Пользовательское соглашение'}</span>
          </Link>

          <Link href="/docs" className="hover:text-cyan-400 transition-colors">
            {isEn ? 'Technical Documentation' : 'Техническая документация'}
          </Link>
        </div>
      </main>
    </div>
  );
}
