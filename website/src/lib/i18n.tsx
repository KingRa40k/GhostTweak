"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "ru" | "en";

export interface Translations {
  header: {
    telemetry: string;
    features: string;
    profiles: string;
    compare: string;
    pricing: string;
    faq: string;
    downloadApp: string;
    downloadExe: string;
    fileSize: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaButton: string;
    ctaSpecs: string;
    secondaryButton: string;
  };
  telemetryPills: {
    latency: string;
    cpu: string;
    backups: string;
    win32: string;
  };
  comparison: {
    tag: string;
    title: string;
    subtitle: string;
    colFeature: string;
    colGhostTweak: string;
    colElectron: string;
    colScripts: string;
    rows: {
      name: string;
      ghost: string;
      electron: string;
      scripts: string;
    }[];
  };
  arsenal: {
    tag: string;
    title: string;
    subtitle: string;
    modules: {
      id: string;
      title: string;
      badge: string;
      desc: string;
      metric: string;
    }[];
  };
  profiles: {
    tag: string;
    title: string;
    subtitle: string;
    applyBtn: string;
    appliedStatus: string;
    items: {
      id: string;
      title: string;
      tag: string;
      desc: string;
      games: string;
      latency: string;
    }[];
  };
  pricing: {
    tag: string;
    title: string;
    subtitle: string;
    tiers: {
      name: string;
      tag: string;
      price: string;
      period: string;
      desc: string;
      features: string[];
      cta: string;
      popular?: boolean;
    }[];
  };
  downloadBanner: {
    title: string;
    desc: string;
    msiBtn: string;
    zipBtn: string;
    cleanTag: string;
    sizeTag: string;
    shaTag: string;
    moreOptions: string;
    msiLink: string;
    githubLink: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
    items: {
      q: string;
      a: string;
    }[];
  };
  footer: {
    desc: string;
    reqTitle: string;
    reqText: string;
    hashTitle: string;
    copied: string;
    copy: string;
    disclaimer: string;
    docs: string;
    privacy: string;
    terms: string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    header: {
      telemetry: "Телеметрия",
      features: "Возможности",
      profiles: "Профили",
      compare: "Сравнение",
      pricing: "Тарифы",
      faq: "Вопросы",
      downloadApp: "Скачать приложение",
      downloadExe: ".EXE",
      fileSize: "4.8 МБ",
    },
    hero: {
      eyebrow: "Без Chromium • 4.8 МБ • Прямой доступ к WinAPI",
      title: "GhostTweak — настройка системы и снижение задержек",
      subtitle: "Нативная утилита для Windows 10 и 11. Высокоточный мультимедийный таймер ядра (0.5 мс), глубокая очистка кэша шейдеров DirectX и видеокарт, отключение фоновой телеметрии и безопасные точки отката реестра.",
      ctaButton: "Скачать GhostTweak",
      ctaSpecs: "Windows 10 / 11 x64 • 4.8 МБ",
      secondaryButton: "Сравнение с аналогами",
    },
    telemetryPills: {
      latency: "[DPC ЗАДЕРЖКА: 0.45мс]",
      cpu: "[CPU НАГРУЗКА: 0.0%]",
      backups: "[ТОЧКИ ОТКАТА .REG]",
      win32: "[ПРЯМОЙ WIN32 API]",
    },
    comparison: {
      tag: "Архитектура",
      title: "Архитектурные Различия Решений",
      subtitle: "Прямой WinAPI без промежуточных веб-движков, скрытых служб и кустарных PowerShell-скриптов.",
      colFeature: "Параметр",
      colGhostTweak: "GhostTweak (Rust)",
      colElectron: "Electron-твикеры",
      colScripts: ".bat / .ps1 скрипты",
      rows: [
        {
          name: "Размер бинарного файла",
          ghost: "4.8 МБ (LTO сжатие)",
          electron: "180–350 МБ",
          scripts: "10–50 КБ",
        },
        {
          name: "Потребление ОЗУ в простое",
          ghost: "14 МБ RAM",
          electron: "220–450 МБ RAM",
          scripts: "Зависит от PowerShell",
        },
        {
          name: "Время холодного запуска",
          ghost: "0.12 секунды",
          electron: "3.5–6.0 секунд",
          scripts: "1.5–3.0 секунды",
        },
        {
          name: "Безопасность реестра",
          ghost: "Атомарный бэкап .reg",
          electron: "Перезапись без бэкапа",
          scripts: "Без возможности отката",
        },
        {
          name: "Таймер ядра ОС",
          ghost: "Аппаратный 0.5 мс",
          electron: "Штатный 15.6 мс",
          scripts: "Не поддерживается",
        },
        {
          name: "Фоновая активность",
          ghost: "0 служб, 0 демонов",
          electron: "Node.js сервисы",
          scripts: "Планировщик задач",
        },
      ],
    },
    arsenal: {
      tag: "Модули",
      title: "Функциональные Компоненты",
      subtitle: "Каждый модуль выполняет одну техническую задачу и проверяет системные зависимости перед внесением изменений.",
      modules: [
        {
          id: "timer",
          title: "Мультимедийный Таймер 0.5 мс",
          badge: "WinAPI",
          desc: "Принудительное переключение системного квантования времени со стандартных 15.6 мс на 0.5 мс для стабилизации фреймтайма.",
          metric: "0.5 мс точность",
        },
        {
          id: "shaders",
          title: "Очистка Кэша Шейдеров",
          badge: "DirectX / GPU",
          desc: "Удаление устаревших скомпилированных файлов из каталогов DirectX D3DSCache, NVIDIA GLCache и AMD DxcCache.",
          metric: "До 8 ГБ кэша",
        },
        {
          id: "telemetry",
          title: "Отключение Телеметрии DiagTrack",
          badge: "Privacy",
          desc: "Остановка службы Connected User Experiences, отключение фонового логирования и сбора данных.",
          metric: "0 запросов к MS",
        },
        {
          id: "network",
          title: "Сетевой Стек (Nagle Off)",
          badge: "TCP/IP",
          desc: "Отключение алгоритма объединения пакетов Нагла (TcpAckFrequency = 1, TCPNoDelay = 1) для прямого отправления пакетов.",
          metric: "Минимум буферизации",
        },
        {
          id: "backup",
          title: "Автоматический Откат Реестра",
          badge: "Безопасность",
          desc: "Экспорт исходных ключей в файлы .reg перед каждым изменением с возможностью восстановления в один клик.",
          metric: "100% обратимость",
        },
        {
          id: "memory",
          title: "Сброс Рабочего Набора ОЗУ",
          badge: "RAM",
          desc: "Вызов EmptyWorkingSet для выгрузки неиспользуемых страниц системных процессов в фоновый резерв.",
          metric: "Мгновенный сброс",
        },
      ],
    },
    profiles: {
      tag: "Профили",
      title: "Сценарные Пресеты",
      subtitle: "Комплексные конфигурации параметров под конкретные сценарии использования компьютера.",
      applyBtn: "Активировать профиль",
      appliedStatus: "Активен",
      items: [
        {
          id: "esports",
          title: "Киберспорт / Competitve",
          tag: "Минимальный Input Lag",
          desc: "Таймер 0.5 мс, отключение Nagle, DPC приоритет для игрового потока, отключение Game DVR.",
          games: "CS2, Valorant, Apex Legends, PUBG",
          latency: "0.45 мс",
        },
        {
          id: "aaa",
          title: "AAA Игры / Графика",
          tag: "Стабильный Фреймтайм",
          desc: "Оптимизация размера кэша шейдеров, максимальная производительность GPU, энергосхема Min.",
          games: "Cyberpunk 2077, Alan Wake 2, GTA V",
          latency: "0.85 мс",
        },
        {
          id: "stream",
          title: "Стриминг и Запись",
          tag: "Баланс Потоков",
          desc: "Сетевой QoS приоритет для OBS/Discord, сохранение фонового звука, приоритет кодировщика NVENC.",
          games: "OBS Studio, Discord, Twitch, YouTube",
          latency: "1.00 мс",
        },
        {
          id: "quiet",
          title: "Работа и Офис",
          tag: "Тихий Режим",
          desc: "Стандартные службы Windows, сбалансированное энергопотребление, умеренная активность вентиляторов.",
          games: "VS Code, Figma, Браузер, Офис",
          latency: "Штатный",
        },
      ],
    },
    pricing: {
      tag: "Тарифы",
      title: "Варианты Использования",
      subtitle: "Без скрытых платежей, подписок и принудительного обновления. Пожизненная лицензия.",
      tiers: [
        {
          name: "Community",
          tag: "Базовый",
          price: "0 ₽",
          period: "Навсегда",
          desc: "Базовая очистка кэшей, ручные твики реестра и ручной откат.",
          features: [
            "Очистка Temp и кэша Windows Update",
            "Базовые твики реестра (Game Bar, Tips)",
            "Ручное создание точек отката .reg",
            "Открытый исходный код",
          ],
          cta: "Скачать бесплатно",
        },
        {
          name: "Pro Operator",
          tag: "Популярный",
          price: "1 490 ₽",
          period: "Пожизненный доступ",
          desc: "Полный функционал: таймер 0.5 мс, все 4 игровых профиля и глубокая очистка шейдеров.",
          popular: true,
          features: [
            "Все возможности Community",
            "Мультимедийный таймер ядра 0.5 мс",
            "4 игровых профиля в один клик",
            "Глубокая очистка шейдеров NVIDIA / AMD",
            "Сетевые оптимизации (Nagle Off, TCP)",
            "Приоритетные обновления",
          ],
          cta: "Купить лицензию",
        },
        {
          name: "Cyber Club",
          tag: "Для клубов",
          price: "19 900 ₽",
          period: "До 50 ПК",
          desc: "Пакет для компьютерных клубов и команд с централизованным развертыванием через .msi.",
          features: [
            "Все возможности Pro Operator",
            "Лицензия на 50 рабочих станций",
            "Тихая установка через MSI / Group Policy",
            "Конфигурационный файл pre-set JSON",
            "Прямая линия технической поддержки",
          ],
          cta: "Оформить для клуба",
        },
      ],
    },
    downloadBanner: {
      title: "Загрузка GhostTweak",
      desc: "Официальные сборки GhostTweak для Windows 10 и 11. Без рекламы, телеметрии и фоновых служб. Нативный бинарный файл на Rust.",
      msiBtn: "Скачать инсталлятор (.exe)",
      zipBtn: "Portable (.exe, 4.8 МБ)",
      cleanTag: "VirusTotal Clean (0/72)",
      sizeTag: "Инсталлятор: 1.58 МБ",
      shaTag: "SHA-256 Проверен",
      moreOptions: "Также доступны для загрузки:",
      msiLink: "MSI пакет (.msi, 2.39 МБ)",
      githubLink: "Релизы на GitHub",
    },
    faq: {
      tag: "FAQ",
      title: "Часто Задаваемые Вопросы",
      subtitle: "Техническая информация о безопасности и принципах работы программы.",
      items: [
        {
          q: "Безопасен ли GhostTweak для античитов (Vanguard, EAC, BattlEye)?",
          a: "Да, полностью безопасен. GhostTweak не внедряет DLL в память игровых процессов и не модифицирует игровые файлы. Программа изменяет только стандартные параметры Windows, аналогично штатному редактору реестра regedit.",
        },
        {
          q: "Как восстановить исходные настройки Windows в случае сбоя?",
          a: "Перед каждым изменением GhostTweak создает снимок затронутых ключей реестра в виде стандартного файла .reg в папке резервных копий. Вы можете откатить любые твики в один клик через раздел 'Резервные копии'.",
        },
        {
          q: "Нужны ли права администратора для запуска?",
          a: "Да. Для изменения настроек реестра в ветке HKEY_LOCAL_MACHINE, остановки службы DiagTrack и управления мультимедийным таймером требуются стандартные права администратора (UAC).",
        },
        {
          q: "Работает ли программа на Windows 11 24H2?",
          a: "Да, все модули и твики протестированы на актуальных сборках Windows 10 (22H2) и Windows 11 (23H2 / 24H2).",
        },
      ],
    },
    footer: {
      desc: "Легковесная нативная утилита для Windows 10/11. Аппаратный контроль задержек, очистка кэшей шейдеров и оптимизация реестра.",
      reqTitle: "Системные требования",
      reqText: "Windows 10 / 11 (x64) • Права администратора • 20 МБ на диске",
      hashTitle: "Контрольная сумма SHA-256",
      copied: "Скопировано!",
      copy: "Копировать хэш",
      disclaimer: "GhostTweak не является продуктом корпорации Microsoft. Все зарегистрированные товарные знаки принадлежат их законным владельцам.",
      docs: "Документация",
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
    },
  },
  en: {
    header: {
      telemetry: "Telemetry",
      features: "Features",
      profiles: "Profiles",
      compare: "Compare",
      pricing: "Pricing",
      faq: "FAQ",
      downloadApp: "Download App",
      downloadExe: ".EXE",
      fileSize: "4.8 MB",
    },
    hero: {
      eyebrow: "Zero Chromium • 4.8 MB • Direct WinAPI Access",
      title: "GhostTweak — System Tuning & Low Latency Windows",
      subtitle: "Native Windows 10 & 11 utility. High-precision 0.5ms kernel multimedia timer, deep DirectX and GPU shader cache flushing, background telemetry removal, and atomic registry restore points.",
      ctaButton: "Download GhostTweak",
      ctaSpecs: "Windows 10 / 11 x64 • 4.8 MB",
      secondaryButton: "Architecture Comparison",
    },
    telemetryPills: {
      latency: "[DPC LATENCY: 0.45ms]",
      cpu: "[CPU USAGE: 0.0%]",
      backups: "[.REG RESTORE POINTS]",
      win32: "[DIRECT WIN32 API]",
    },
    comparison: {
      tag: "Architecture",
      title: "Architectural Comparison",
      subtitle: "Direct WinAPI without intermediate web runtimes, background services, or brittle scripts.",
      colFeature: "Parameter",
      colGhostTweak: "GhostTweak (Rust)",
      colElectron: "Electron Tweakers",
      colScripts: ".bat / .ps1 Scripts",
      rows: [
        {
          name: "Binary File Size",
          ghost: "4.8 MB (LTO optimized)",
          electron: "180–350 MB",
          scripts: "10–50 KB",
        },
        {
          name: "Idle RAM Usage",
          ghost: "14 MB RAM",
          electron: "220–450 MB RAM",
          scripts: "Depends on PowerShell",
        },
        {
          name: "Cold Start Time",
          ghost: "0.12 seconds",
          electron: "3.5–6.0 seconds",
          scripts: "1.5–3.0 seconds",
        },
        {
          name: "Registry Safety",
          ghost: "Atomic .reg snapshot",
          electron: "Blind overwrite",
          scripts: "No undo capability",
        },
        {
          name: "OS Kernel Timer",
          ghost: "Hardware 0.5 ms",
          electron: "Standard 15.6 ms",
          scripts: "Not supported",
        },
        {
          name: "Background Activity",
          ghost: "0 services, 0 daemons",
          electron: "Node.js background processes",
          scripts: "Windows Task Scheduler",
        },
      ],
    },
    arsenal: {
      tag: "Modules",
      title: "Core System Modules",
      subtitle: "Each component performs a focused technical job with dependency validation before making changes.",
      modules: [
        {
          id: "timer",
          title: "0.5ms Multimedia Timer",
          badge: "WinAPI",
          desc: "Enforces kernel time quantization from default 15.6ms down to 0.5ms to stabilize frame times and eliminate micro-stutter.",
          metric: "0.5ms precision",
        },
        {
          id: "shaders",
          title: "Shader Cache Purge",
          badge: "DirectX / GPU",
          desc: "Removes outdated compiled shader caches from DirectX D3DSCache, NVIDIA GLCache, and AMD DxcCache.",
          metric: "Up to 8 GB saved",
        },
        {
          id: "telemetry",
          title: "Disable DiagTrack Telemetry",
          badge: "Privacy",
          desc: "Stops Connected User Experiences service, disables background event tracing and telemetry queues.",
          metric: "0 MS requests",
        },
        {
          id: "network",
          title: "Network Stack (Nagle Off)",
          badge: "TCP/IP",
          desc: "Disables Nagle packet coalescing (TcpAckFrequency = 1, TCPNoDelay = 1) for immediate frame transmission.",
          metric: "Minimal buffering",
        },
        {
          id: "backup",
          title: "Automatic Registry Rollback",
          badge: "Safety",
          desc: "Exports targeted registry subkeys to .reg files before any write operations with one-click restore.",
          metric: "100% reversible",
        },
        {
          id: "memory",
          title: "Working Set RAM Flush",
          badge: "RAM",
          desc: "Calls EmptyWorkingSet API to immediately flush unreferenced process pages back to standby pool.",
          metric: "Instant recovery",
        },
      ],
    },
    profiles: {
      tag: "Profiles",
      title: "Scenario Presets",
      subtitle: "Comprehensive configurations tailored for specific computer gaming and productivity tasks.",
      applyBtn: "Activate Profile",
      appliedStatus: "Active",
      items: [
        {
          id: "esports",
          title: "Esports Competitive",
          tag: "Lowest Input Lag",
          desc: "0.5ms timer, Nagle Off, DPC priority on render threads, Game DVR disabled.",
          games: "CS2, Valorant, Apex Legends, PUBG",
          latency: "0.45 ms",
        },
        {
          id: "aaa",
          title: "AAA Cinematic",
          tag: "Stable Frame Times",
          desc: "Optimized shader cache allocation, maximum GPU power scheme, background throttling.",
          games: "Cyberpunk 2077, Alan Wake 2, GTA V",
          latency: "0.85 ms",
        },
        {
          id: "stream",
          title: "Streamer & Creator",
          tag: "Stream Priority",
          desc: "Network QoS prioritizing OBS and Discord, audio isolation, NVENC hardware boost.",
          games: "OBS Studio, Discord, Twitch, YouTube",
          latency: "1.00 ms",
        },
        {
          id: "quiet",
          title: "Quiet Work & Office",
          tag: "Balanced Efficiency",
          desc: "Standard Windows services, energy-efficient scheduler, whisper-quiet fan profile.",
          games: "VS Code, Figma, Browser, Office",
          latency: "Default",
        },
      ],
    },
    pricing: {
      tag: "Pricing",
      title: "Transparent Licensing",
      subtitle: "No subscriptions, no recurring fees, no forced telemetry. Lifetime access.",
      tiers: [
        {
          name: "Community",
          tag: "Free",
          price: "$0",
          period: "Forever",
          desc: "Basic cache cleaning, essential registry tweaks, and manual rollback.",
          features: [
            "Temp & Windows Update cache cleaning",
            "Standard registry tweaks (Game Bar, Tips)",
            "Manual .reg backup creation",
            "Open source and transparent",
          ],
          cta: "Download Free",
        },
        {
          name: "Pro Operator",
          tag: "Popular",
          price: "$19",
          period: "Lifetime License",
          desc: "Complete toolkit: 0.5ms kernel timer, all 4 game profiles, and deep GPU shader cleanup.",
          popular: true,
          features: [
            "All Community features included",
            "0.5ms high-resolution multimedia timer",
            "All 4 gaming presets in one click",
            "Deep NVIDIA / AMD shader cache purge",
            "Network optimizations (Nagle Off, TCP)",
            "Lifetime updates and fixes",
          ],
          cta: "Get Lifetime Pro",
        },
        {
          name: "Cyber Club",
          tag: "Commercial",
          price: "$199",
          period: "Up to 50 PCs",
          desc: "For cyber arenas, LAN centers, and esports teams with silent MSI mass-deployment.",
          features: [
            "All Pro Operator features",
            "Licensed for up to 50 workstations",
            "Silent install via MSI / Group Policy",
            "JSON configuration pre-set support",
            "Direct technical support channel",
          ],
          cta: "Deploy for Club",
        },
      ],
    },
    downloadBanner: {
      title: "Download GhostTweak",
      desc: "Official GhostTweak releases for Windows 10 & 11. No ads, no telemetry, no background services. Standalone compiled Rust binary.",
      msiBtn: "Download Setup (.exe)",
      zipBtn: "Portable (.exe, 4.8 MB)",
      cleanTag: "VirusTotal Clean (0/72)",
      sizeTag: "Installer: 1.58 MB",
      shaTag: "SHA-256 Verified",
      moreOptions: "Also available for download:",
      msiLink: "MSI Package (.msi, 2.39 MB)",
      githubLink: "GitHub Releases",
    },
    faq: {
      tag: "FAQ",
      title: "Frequently Asked Questions",
      subtitle: "Technical details about safety, anti-cheat compatibility, and system requirements.",
      items: [
        {
          q: "Is GhostTweak safe with anti-cheat engines (Vanguard, EAC, BattlEye)?",
          a: "Yes, 100% safe. GhostTweak does not inject DLLs into game memory or modify game binaries. It only modifies documented Windows registry settings and system APIs, exactly like regedit.",
        },
        {
          q: "How do I restore original Windows settings if needed?",
          a: "Before any change, GhostTweak creates a timestamped .reg backup of the affected keys in your backup directory. You can restore original settings in one click from the Backups screen.",
        },
        {
          q: "Are Administrator privileges required?",
          a: "Yes. Modifying HKEY_LOCAL_MACHINE registry keys, disabling the DiagTrack service, and adjusting the kernel multimedia timer require standard Windows UAC administrator elevation.",
        },
        {
          q: "Does it support Windows 11 24H2?",
          a: "Yes, all modules and tweaks have been verified on Windows 10 (22H2) as well as Windows 11 (23H2 / 24H2).",
        },
      ],
    },
    footer: {
      desc: "Ultra-lightweight native utility for Windows 10/11. Hardware latency control, shader cache cleaning, and registry tuning.",
      reqTitle: "System Requirements",
      reqText: "Windows 10 / 11 (x64) • Administrator rights • 20 MB disk space",
      hashTitle: "SHA-256 Verification Checksum",
      copied: "Copied!",
      copy: "Copy Hash",
      disclaimer: "GhostTweak is an independent software tool and is not affiliated with Microsoft Corporation. All registered trademarks belong to their respective owners.",
      docs: "Documentation",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: "ru",
  setLang: () => {},
  t: translations.ru,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ru");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gt_lang") as Language;
      if (saved === "ru" || saved === "en") {
        setLangState(saved);
      }
    } catch {}
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("gt_lang", newLang);
    } catch {}
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
