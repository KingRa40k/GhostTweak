"use client";

import React from "react";
import { ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

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
  eyebrow = "",
  title,
  subtitle,
  ctaLabel = "Скачать GhostTweak",
  ctaHref = "#download",
  secondaryLabel,
  secondaryHref = "#architecture",
}: HeroProps) {
  return (
    <section
      id="hero"
      className="relative mx-auto w-full pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 text-center overflow-hidden bg-[#060708]"
    >
      {/* Subtle Matrix Grid BG */}
      <div
        className="absolute -z-10 inset-0 opacity-40 h-[700px] w-full 
        bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
        bg-[size:4rem_4rem] 
        [mask-image:radial-gradient(ellipse_70%_60%_at_50%_10%,#000_60%,transparent_100%)] pointer-events-none"
      />

      {/* Cyber Radial Accent (Theme-aware glow, no blinding white or unstyled purple) */}
      <div
        className="absolute left-1/2 top-[calc(100%-140px)] sm:top-[calc(100%-180px)] md:top-[calc(100%-220px)] 
        h-[420px] w-[640px] sm:w-[900px] md:h-[500px] md:w-[1200px] lg:w-[150%] 
        -translate-x-1/2 rounded-[100%] border pointer-events-none transition-all duration-500"
        style={{
          borderColor: "var(--accent-border, rgba(0, 240, 255, 0.3))",
          background: "radial-gradient(closest-side, rgba(13, 16, 25, 0.95) 70%, rgba(var(--accent-rgb, 0 240 255), 0.12) 100%)",
          boxShadow: "0 0 100px -20px var(--accent-color, #00f0ff)",
        }}
      />

      {/* Brand Badge with Ghost Logo */}
      <div className="animate-fade-in inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] shadow-sm mb-6">
        <Logo className="w-5 h-5 text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
          GhostTweak Precision Suite
        </span>
      </div>

      {/* Title with sleek metallic/accent gradient */}
      <h1
        className="animate-fade-in mx-auto max-w-5xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] text-white"
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        className="animate-fade-in mx-auto mt-6 max-w-3xl text-sm sm:text-base md:text-lg text-slate-400 font-sans leading-relaxed"
      >
        {subtitle}
      </p>

      {/* CTA Buttons */}
      <div className="animate-fade-in mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 relative z-20">
        {ctaLabel && (
          <a
            href={ctaHref}
            className="btn-accent w-full sm:w-auto py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-accent-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{ctaLabel}</span>
          </a>
        )}

        {secondaryLabel && (
          <a
            href={secondaryHref}
            className="btn-steel w-full sm:w-auto py-3 sm:py-3.5 px-6 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
          >
            <span>{secondaryLabel}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        )}
      </div>

      {/* Bottom Fade that blends seamlessly into the dark canvas */}
      <div
        className="relative mt-12 sm:mt-16 h-8 sm:h-12 w-full pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, #060708)",
        }}
      />
    </section>
  );
}
