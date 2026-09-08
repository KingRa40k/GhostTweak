"use client";

import React, { useState, useEffect } from "react";
import { Download, Menu, X, ChevronRight, Globe } from "lucide-react";
import Logo from "@/components/Logo";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#telemetry", label: t.header.telemetry },
    { href: "#arsenal", label: t.header.features },
    { href: "#profiles", label: t.header.profiles },
    { href: "#architecture", label: t.header.compare },
    { href: "#pricing", label: t.header.pricing },
    { href: "#faq", label: t.header.faq },
  ];

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex flex-col items-center px-3 sm:px-6 pointer-events-none">
      {/* Floating Glassmorphism Pill Bar */}
      <div
        className={`pointer-events-auto w-full max-w-6xl rounded-2xl md:rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-300 border ${
          scrolled
            ? "bg-[#0A0C12]/90 backdrop-blur-2xl border-white/[0.14] shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)]"
            : "bg-[#0C0E17]/75 backdrop-blur-xl border-white/[0.10] shadow-[0_10px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]"
        }`}
      >
        {/* Brand Logo with Ghost Icon (NO RUST TAG) */}
        <a href="#" className="flex items-center gap-2.5 group select-none flex-shrink-0">
          <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Logo className="w-8 h-8 drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-sans whitespace-nowrap">
            GhostTweak
          </span>
        </a>

        {/* Center Desktop Navigation - Adaptive for Laptop & PC */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs xl:text-[13px] font-medium text-slate-300 hover:text-white transition-colors duration-150 whitespace-nowrap py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Section: Language Toggle & Download Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Language Switcher Pill */}
          <button
            onClick={() => setLang(lang === "ru" ? "en" : "ru")}
            title={lang === "ru" ? "Switch to English" : "Переключить на русский"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border border-white/10 bg-white/[0.04] hover:bg-white/10 text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <Globe className="w-3 h-3 text-accent" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Desktop Download CTA Button */}
          <a
            href="#download"
            className="btn-accent text-xs font-bold py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-full flex items-center gap-1.5 shadow-accent-glow whitespace-nowrap"
          >
            <Download size={13} />
            <span>{t.header.downloadExe}</span>
            <span className="text-[10px] font-mono opacity-80 pl-1 border-l border-black/20 hidden sm:inline-block">
              {t.header.fileSize}
            </span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors lg:hidden"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Card */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 w-full max-w-6xl rounded-2xl bg-[#0C0E17]/95 backdrop-blur-2xl border border-white/[0.12] p-4 shadow-2xl animate-fade-in flex flex-col gap-2 lg:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 px-2.5 rounded-lg hover:bg-white/[0.05] border-b border-white/[0.04] flex items-center justify-between transition-colors"
            >
              <span>{link.label}</span>
              <ChevronRight size={14} className="text-zinc-500" />
            </a>
          ))}

          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-accent w-full text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-2 shadow-accent-glow"
            >
              <Download size={14} />
              <span>GhostTweak {t.header.downloadExe} • {t.header.fileSize}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
