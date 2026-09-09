'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Globe, Code2, Cpu, Key, Palette, Cloud, HelpCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function DocsPage() {
  const { lang, setLang } = useI18n();
  const isEn = lang === 'en';

  const sections = isEn
    ? [
        {
          icon: Cpu,
          title: '01. Architecture & Codebase',
          desc: 'Rust kernel (Tauri v2), Win32 API direct syscalls, React 19 frontend layout, and folder directory breakdown.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/01_ARCHITECTURE.md',
        },
        {
          icon: Code2,
          title: '02. Building & Packaging',
          desc: 'Single-click build via build.bat, compiling NSIS Setup, MSI packages, and standalone Portable binaries.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/02_BUILD_AND_RELEASE.md',
        },
        {
          icon: Key,
          title: '03. Licensing & Monetization',
          desc: 'Hardware UUID binding, cryptographic checksums, generating batches of license keys, and payment integration.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/03_LICENSING_AND_MONETIZATION.md',
        },
        {
          icon: Palette,
          title: '04. Branding & Customization',
          desc: 'How to update Telegram support contacts, customize pricing tiers, modify brand names, and adjust themes.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/04_CUSTOMIZATION_AND_CONTACTS.md',
        },
        {
          icon: Cloud,
          title: '05. Zero-Cost Vercel Deploy',
          desc: 'Deploy the Next.js landing page to Vercel in 2 minutes with automated global CDN and custom domain SSL.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/05_DEPLOYMENT_VERCEL.md',
        },
        {
          icon: HelpCircle,
          title: '06. FAQ & Troubleshooting',
          desc: 'Why Administrator elevation is needed, SmartScreen reputation, registry rollback safety, and build fixes.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/06_FAQ_AND_TROUBLESHOOTING.md',
        },
      ]
    : [
        {
          icon: Cpu,
          title: '01. Архитектура и структура',
          desc: 'Ядро на Rust (Tauri v2), прямые вызовы Win32 API, интерфейс на React 19 и назначение всех каталогов проекта.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/01_ARCHITECTURE.md',
        },
        {
          icon: Code2,
          title: '02. Сборка и релизы',
          desc: 'Сборка в 1 клик через build.bat, компиляция NSIS Setup, MSI-установщика и портативной версии Portable.exe.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/02_BUILD_AND_RELEASE.md',
        },
        {
          icon: Key,
          title: '03. Лицензии и монетизация',
          desc: 'Привязка к HWID материнской платы, алгоритмы генерации ключей, подключение Telegram-ботов и эквайринга.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/03_LICENSING_AND_MONETIZATION.md',
        },
        {
          icon: Palette,
          title: '04. Брендинг и контакты',
          desc: 'Замена ссылок поддержки (Telegram/Email), настройка цен тарифов на сайте и добавление новых тем.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/04_CUSTOMIZATION_AND_CONTACTS.md',
        },
        {
          icon: Cloud,
          title: '05. Деплой сайта на Vercel',
          desc: 'Бесплатный запуск маркетингового сайта на Vercel за 2 минуты с привязкой собственного домена и SSL.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/05_DEPLOYMENT_VERCEL.md',
        },
        {
          icon: HelpCircle,
          title: '06. FAQ и решение проблем',
          desc: 'Зачем нужны права UAC, реакция SmartScreen, безопасность точек отката реестра и частые вопросы.',
          link: 'https://github.com/KingRa40k/GhostTweak/blob/main/docs/06_FAQ_AND_TROUBLESHOOTING.md',
        },
      ];

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-cyan-400 selection:text-black font-sans pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-obsidian-900/80 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
              {isEn ? 'Privacy Policy' : 'Конфиденциальность'}
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
      <main className="max-w-5xl mx-auto px-6 pt-12">
        <div className="mb-12 border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isEn ? 'Developer & Owner Hub' : 'Портал документации'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isEn ? 'GhostTweak Technical Documentation' : 'Техническая документация GhostTweak'}
          </h1>
          <p className="mt-3 text-sm font-mono text-slate-400">
            {isEn
              ? 'Complete modular manuals covering architecture, automated builds, licensing engine, and deployment.'
              : 'Полный комплект инструкций: архитектура ядра, сборка дистрибутивов, система ключей и запуск сайта.'}
          </p>
        </div>

        {/* Grid of Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <a
                key={idx}
                href={sec.link}
                target="_blank"
                rel="noreferrer"
                className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {sec.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                    {sec.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>{isEn ? 'Open Guide on GitHub →' : 'Открыть руководство →'}</span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
              {isEn ? 'Privacy Policy' : 'Политика конфиденциальности'}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">
              {isEn ? 'Terms of Service' : 'Пользовательское соглашение'}
            </Link>
          </div>

          <a
            href="https://github.com/KingRa40k/GhostTweak"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </main>
    </div>
  );
}
