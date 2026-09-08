'use client';

import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import { ComparisonMatrix } from '@/components/ComparisonMatrix';
import { CoreArsenal } from '@/components/CoreArsenal';
import { ScenarioProfiles } from '@/components/ScenarioProfiles';
import { Pricing } from '@/components/Pricing';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';
import { Download, ShieldCheck, Terminal, ArrowRight, Zap, Check } from 'lucide-react';

import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#08090A] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Fixed Header */}
      <Header />

      {/* Main Content Sections */}
      <main>
        {/* Section 1 & 2: Hero & App Mockup */}
        <Hero />

        {/* Section 3: Architectural Superiority (Comparison Matrix) */}
        <ComparisonMatrix />

        {/* Section 4: Core Arsenal (Bento Grid / Modules) */}
        <CoreArsenal />

        {/* Section 5: Scenario Profiles (Interactive 4-mode switcher) */}
        <ScenarioProfiles />

        {/* Section 6: Transparent Pricing (Lifetime 3 tiers) */}
        <Pricing />

        {/* Download Banner Section */}
        <section id="download" className="relative py-24 border-t border-white/[0.06] overflow-hidden">
          <div 
            className="absolute inset-0 pointer-events-none opacity-10 blur-[150px]"
            style={{ backgroundColor: 'var(--accent-color)' }}
          />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="p-8 sm:p-14 rounded-2xl border border-white/[0.08] bg-[#0E1119]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div 
                className="w-12 h-12 rounded-xl border mx-auto flex items-center justify-center mb-6 shadow-lg"
                style={{
                  backgroundColor: 'var(--accent-bg-subtle)',
                  borderColor: 'var(--accent-border)',
                }}
              >
                <Download className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mb-4">
                {t.downloadBanner.title}
              </h2>

              <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400 font-sans mb-8">
                {t.downloadBanner.desc}
              </p>

              {/* Download Buttons Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <a
                  href="#download-installer"
                  className="w-full sm:w-auto btn-accent py-3.5 px-8 rounded-lg font-mono text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadBanner.msiBtn}</span>
                </a>

                <a
                  href="#download-portable"
                  className="w-full sm:w-auto py-3.5 px-6 rounded-lg font-mono text-xs uppercase tracking-widest font-bold text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/10 hover:text-white transition-all"
                >
                  <span>{t.downloadBanner.zipBtn}</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-white/[0.06] text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> {t.downloadBanner.cleanTag}
                </span>
                <span>•</span>
                <span>{t.downloadBanner.sizeTag}</span>
                <span>•</span>
                <span>{t.downloadBanner.shaTag}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: FAQ & Technical Knowledge Base */}
        <FAQ />
      </main>

      {/* Section 8: Hardware Specs & System Footer */}
      <Footer />
    </div>
  );
}
