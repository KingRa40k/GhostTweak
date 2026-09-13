"use client";

import React from "react";
import { Download, ChevronRight, Cpu } from "lucide-react";

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function Hero({
  eyebrow = "ENGINEERED IN RUST • 4.8 MB NATIVE BINARY • ZERO OVERHEAD",
  title,
  subtitle,
  ctaLabel = "Скачать GhostTweak v1.0.0",
  ctaHref = "#download",
  secondaryLabel = "Архитектурный бенчмарк",
  secondaryHref = "#architecture",
}: HeroProps) {
  return (
    <section
      id="hero"
      className="relative mx-auto w-full pt-28 sm:pt-36 md:pt-40 pb-10 sm:pb-14 px-4 sm:px-6 md:px-8 text-center overflow-hidden bg-[#09090b]"
    >
      {/* Subtle Industrial Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 15%, black 40%, transparent 100%)",
        }}
      />

      {/* Very subtle cold top spotlight */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] pointer-events-none rounded-full blur-[140px] opacity-10 bg-white"
      />

      {/* Minimalist Rust Badge */}
      <div className="relative z-10 flex justify-center mb-6">
        <a
          href="#architecture"
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full 
          bg-zinc-900/90 border border-white/[0.08] hover:border-white/20 
          backdrop-blur-md shadow-sm transition-all duration-200 group"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-zinc-300 group-hover:text-white transition-colors">
            {eyebrow}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      {/* Main Title */}
      <h1 className="relative z-10 mx-auto max-w-5xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-zinc-400 font-sans leading-relaxed font-normal">
        {subtitle}
      </p>

      {/* CTA Buttons with Metadata */}
      <div className="relative z-10 mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        {ctaLabel && (
          <div className="flex flex-col items-center">
            <a
              href={ctaHref}
              className="w-full sm:w-auto py-3.5 px-7 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 
              bg-white text-zinc-950 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.6),0_0_24px_rgba(255,255,255,0.12)] cursor-pointer"
            >
              <Download className="w-4 h-4 text-zinc-950" />
              <span>{ctaLabel}</span>
            </a>
            <span className="font-mono text-[10px] text-zinc-500 mt-2 tracking-wide flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              .exe • x86_64 • Windows 10/11 Signed • VirusTotal 0/72
            </span>
          </div>
        )}

        {secondaryLabel && (
          <a
            href={secondaryHref}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-semibold text-xs sm:text-sm text-zinc-300 hover:text-white 
            bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/[0.08] hover:border-white/[0.18] flex items-center justify-center gap-2 transition-all"
          >
            <Cpu className="w-4 h-4 text-zinc-400" />
            <span>{secondaryLabel}</span>
          </a>
        )}
      </div>
    </section>
  );
}
