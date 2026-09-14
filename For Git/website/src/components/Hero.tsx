"use client";

import React from "react";
import { Hero as HeroOne } from "@/components/ui/hero-1";
import { useI18n } from "@/lib/i18n";
import AppMockup from "./AppMockup";

export default function Hero() {
  const { t } = useI18n();

  return (
    <div className="relative">
      <HeroOne
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        ctaLabel={t.hero.ctaButton}
        ctaHref="#download"
        secondaryLabel={t.hero.secondaryButton}
        secondaryHref="#architecture"
      />

      {/* Interactive App Mockup positioned seamlessly right under the Hero */}
      <div id="telemetry" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 -mt-8 sm:-mt-12 relative z-30">
        <AppMockup />
      </div>
    </div>
  );
}
