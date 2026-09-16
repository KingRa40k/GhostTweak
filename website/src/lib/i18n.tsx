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
    privacy: string;
    terms: string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    header: {
      telemetry: "Показатели",
      features: "Возможности",
      profiles: "Пресеты",
      compare: "Сравнение",
      pricing: "Тарифы",
      faq: "Вопросы",
      downloadApp: "Скачать GhostTweak",
      downloadExe: ".EXE",
      fileSize: "4.8 МБ",
    },
    hero: {
      eyebrow: "Без Chromium • 4.8 МБ • Прямой доступ к WinAPI",
      title: "GhostTweak — чистый Windows-оптимизатор для CS2 и шутеров",
      subtitle: "Быстрая нативная утилита на Rust. Ставит системный таймер на 0.500 мс, сбрасывает кэш оперативной памяти прямо во время катки по хоткею и устраняет задержку мыши без риска бана в играх.",
      ctaButton: "Скачать бесплатно",
      ctaSpecs: "Windows 10 / 11 x64 • 4.8 МБ • Портативный",
      secondaryButton: "Сравнить с аналогами",
    },
    telemetryPills: {
      latency: "[ТАЙМЕР: 0.50мс]",
      cpu: "[НАГРУЗКА CPU: 0.0%]",
      backups: "[ОТКАТ В 1 КЛИК]",
      win32: "[ЧИСТЫЙ RUST/WINAPI]",
    },
    comparison: {
      tag: "Сравнение",
      title: "Почему игроки выбирают GhostTweak",
      subtitle: "Нативный код на Rust с мгновенным откликом вместо тяжелых веб-оболочек и опасных батников из интернета.",
      colFeature: "Параметр",
      colGhostTweak: "GhostTweak (Rust)",
      colElectron: "Electron-твикеры",
      colScripts: ".bat / .ps1 скрипты",
      rows: [
        {
          name: "Размер файла",
          ghost: "4.8 МБ",
          electron: "180–350 МБ",
          scripts: "10–50 КБ",
        },
        {
          name: "Потребление памяти в фоне",
          ghost: "~14 МБ RAM",
          electron: "200–450 МБ RAM",
          scripts: "Зависит от PowerShell",
        },
        {
          name: "Скорость запуска",
          ghost: "Мгновенно (0.1 сек)",
          electron: "3–6 секунд",
          scripts: "1.5–3 секунды",
        },
        {
          name: "Безопасность системы",
          ghost: "Авто-бэкап реестра .reg",
          electron: "Перезапись без бэкапа",
          scripts: "Без возможности отката",
        },
        {
          name: "Таймер прерываний",
          ghost: "Аппаратный 0.500 мс",
          electron: "Штатный 15.6 мс",
          scripts: "Не поддерживается",
        },
        {
          name: "Фоновые процессы",
          ghost: "0 скрытых служб",
          electron: "Фоновые процессы Node",
          scripts: "Задачи в планировщике",
        },
      ],
    },
    arsenal: {
      tag: "Возможности",
      title: "Что умеет GhostTweak",
      subtitle: "Каждая функция решает конкретную проблему геймера: уменьшает задержку ввода, освобождает память и отключает системный мусор.",
      modules: [
        {
          id: "timer",
          title: "Аппаратный таймер 0.5 мс",
          badge: "WinAPI",
          desc: "Переключает системный таймер Windows с 15.6 мс на 0.5 мс. Мышь ходит плавнее, микрофризы и джиттер в шутерах пропадают.",
          metric: "0.500 мс",
        },
        {
          id: "hotkey",
          title: "Хоткей в игре Ctrl+Alt+F12",
          badge: "Без Alt-Tab",
          desc: "Сбрасывает забитый кэш оперативной памяти и включает режим Turbo прямо во время матча, не сворачивая игру.",
          metric: "Мгновенно",
        },
        {
          id: "ping",
          title: "Замер пинга до серверов Valve",
          badge: "Сеть",
          desc: "Прямой замер задержки до датацентров CS2 (Франкфурт, Варшава, Стокгольм, Хельсинки) и быстрых DNS без спама пакетами.",
          metric: "TCP Ping",
        },
        {
          id: "shaders",
          title: "Очистка кэша шейдеров",
          badge: "GPU",
          desc: "Удаляет поврежденные и устаревшие файлы шейдеров NVIDIA, AMD и DirectX, устраняя статтеры при появлении новых эффектов.",
          metric: "До 8 ГБ",
        },
        {
          id: "tray",
          title: "Тихий автозапуск в трей",
          badge: "Система",
          desc: "Запускается вместе с Windows, тихо висит в области уведомлений и не выскакивает окнами на рабочий стол.",
          metric: "0 окон",
        },
        {
          id: "backup",
          title: "Безопасный откат в 1 клик",
          badge: "Защита",
          desc: "Перед каждым твиком программа сохраняет оригинальные ключи реестра в .reg файл. Все можно вернуть обратно нажатием одной кнопки.",
          metric: "100% откат",
        },
      ],
    },
    profiles: {
      tag: "Пресеты",
      title: "Готовые профили в 1 клик",
      subtitle: "Быстрое переключение настроек под соревновательные катки, графику, стримы или работу.",
      applyBtn: "Включить профиль",
      appliedStatus: "Активен",
      items: [
        {
          id: "esports",
          title: "Киберспорт / CS2",
          tag: "Минимум инпут-лага",
          desc: "Таймер 0.5 мс, отключение алгоритма Нагла, максимальный приоритет CPU для игрового процесса, чистка кэша RAM.",
          games: "CS2, Valorant, Apex Legends, PUBG",
          latency: "0.45 мс",
        },
        {
          id: "aaa",
          title: "Одиночные игры / Графика",
          tag: "Плавный фреймтайм",
          desc: "Максимальная производительность видеокарты, оптимизация кэша шейдеров и схемы питания.",
          games: "Cyberpunk 2077, GTA V, Alan Wake 2",
          latency: "0.85 мс",
        },
        {
          id: "stream",
          title: "Стриминг и Запись",
          tag: "Баланс нагрузки",
          desc: "Сетевой приоритет для OBS и Discord, фоновый звук без задержек, приоритет для кодировщика NVENC.",
          games: "OBS Studio, Discord, Twitch",
          latency: "1.00 мс",
        },
        {
          id: "quiet",
          title: "Работа и Офис",
          tag: "Тихий режим",
          desc: "Штатные службы Windows, умеренное энергопотребление и тихая работа кулеров.",
          games: "Браузер, Discord, Офис, Кодинг",
          latency: "Штатный",
        },
      ],
    },
    pricing: {
      tag: "Тарифы",
      title: "Простая покупка без подписок",
      subtitle: "Один раз купил — пользуешься всегда. Никаких ежемесячных списаний.",
      tiers: [
        {
          name: "Базовый",
          tag: "Бесплатно",
          price: "0 ₽",
          period: "Навсегда",
          desc: "Базовые твики и безопасная очистка временных файлов.",
          features: [
            "Очистка Temp и мусорных файлов",
            "Отключение фоновых советов и Game Bar",
            "Ручное создание бэкапов реестра .reg",
            "Полная безопасность античитов",
          ],
          cta: "Скачать бесплатно",
        },
        {
          name: "PRO Лицензия",
          tag: "Хит",
          price: "990 ₽",
          period: "Пожизненный доступ",
          desc: "Полный боекомплект: таймер 0.5 мс, хоткей в игре, Match Turbo и глубокая чистка шейдеров.",
          popular: true,
          features: [
            "Все возможности базовой версии",
            "Аппаратный таймер ядра 0.500 мс",
            "Хоткей сброса RAM прямо в игре (Ctrl+Alt+F12)",
            "Режим Match Turbo & Smart Throttle",
            "Очистка шейдеров NVIDIA / AMD / DirectX",
            "Сетевые оптимизации под CS2 и шутеры",
            "Все будущие обновления бесплатно",
          ],
          cta: "Получить PRO доступ",
        },
        {
          name: "Клубная",
          tag: "Для команд",
          price: "9 900 ₽",
          period: "До 30 ПК",
          desc: "Для компьютерных клубов, буткемпов и киберспортивных команд.",
          features: [
            "Все возможности PRO версии",
            "Лицензия на 30 компьютеров",
            "Быстрое развертывание через MSI установщик",
            "Готовый файл настроек для всех ПК",
            "Прямая поддержка разработчика",
          ],
          cta: "Купить для клуба",
        },
      ],
    },
    downloadBanner: {
      title: "Скачать GhostTweak",
      desc: "Официальные сборки под Windows 10 и 11. Без встроенной рекламы, майнеров и скрытых служб. Чистый софт на Rust.",
      msiBtn: "Скачать установщик (.exe)",
      zipBtn: "Портативная версия (.exe)",
      cleanTag: "VirusTotal 0/72",
      sizeTag: "Вес: ~4.8 МБ",
      shaTag: "Откат в 1 клик",
      moreOptions: "Другие форматы загрузки:",
      msiLink: "MSI установщик (.msi)",
      githubLink: "Исходники на GitHub",
    },
    faq: {
      tag: "FAQ",
      title: "Частые вопросы",
      subtitle: "Ответы на главные вопросы о безопасности и работе софта.",
      items: [
        {
          q: "Могут ли забанить в CS2, Valorant или других играх?",
          a: "Нет, бан исключен на 100%. GhostTweak не внедряется в память игр (no DLL injection) и не меняет игровые файлы. Софт настраивает системные параметры самой Windows (аналогично ручной правке через regedit). VAC, Vanguard, EAC и BattlEye к этому относятся абсолютно спокойно.",
        },
        {
          q: "Как работает хоткей прямо во время игры?",
          a: "В разгаре матча достаточно нажать Ctrl + Alt + F12. Софт в фоновом режиме выгрузит забитый кэш памяти (Standby List), переведет фоновые программы в режим сна и зафиксирует таймер 0.5 мс — без необходимости сворачивать игру через Alt-Tab.",
        },
        {
          q: "Как вернуть настройки назад, если захочу удалить софт?",
          a: "Перед каждым изменением GhostTweak автоматически сохраняет оригинальные параметры в файлы реестра .reg. В разделе 'Резервные копии' можно в один клик откатить любые твики к исходному состоянию Windows.",
        },
        {
          q: "Нужны ли права администратора?",
          a: "Да, для управления таймером прерываний, системными службами и приоритетами процессов требуются стандартные права администратора Windows.",
        },
        {
          q: "Работает ли софт на Windows 11 24H2?",
          a: "Да, GhostTweak полностью совместим и протестирован на всех свежих сборках Windows 10 (22H2) и Windows 11 (23H2 и 24H2).",
        },
      ],
    },
    footer: {
      desc: "Легковесный игровой твикер Windows на Rust. Аппаратный таймер 0.5 мс, сброс памяти в игре и очистка кэшей шейдеров.",
      reqTitle: "Требования к системе",
      reqText: "Windows 10 / 11 (x64) • Права администратора • 25 МБ на диске",
      hashTitle: "Контрольная сумма SHA-256",
      copied: "Скопировано!",
      copy: "Копировать хэш",
      disclaimer: "GhostTweak не связан с корпорацией Microsoft. Все названия игр и торговые марки принадлежат их законным правообладателям.",
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
      eyebrow: "Zero Chromium • 4.8 MB • Direct WinAPI",
      title: "GhostTweak — Clean Windows Gaming Optimizer",
      subtitle: "Ultra-fast native Windows 10 & 11 utility built in Rust. Sets kernel timer to 0.500 ms, flushes RAM cache mid-game with in-game hotkey, and eliminates mouse delay with zero ban risk.",
      ctaButton: "Download Free",
      ctaSpecs: "Windows 10 / 11 x64 • 4.8 MB • Portable",
      secondaryButton: "Compare Alternatives",
    },
    telemetryPills: {
      latency: "[TIMER: 0.50ms]",
      cpu: "[CPU USAGE: 0.0%]",
      backups: "[1-CLICK RESTORE]",
      win32: "[NATIVE RUST / WINAPI]",
    },
    comparison: {
      tag: "Comparison",
      title: "Why Gamers Choose GhostTweak",
      subtitle: "Direct WinAPI in Rust with instant response instead of heavy web wrappers and risky internet scripts.",
      colFeature: "Parameter",
      colGhostTweak: "GhostTweak (Rust)",
      colElectron: "Electron Tweakers",
      colScripts: ".bat / .ps1 Scripts",
      rows: [
        {
          name: "File Size",
          ghost: "4.8 MB",
          electron: "180–350 MB",
          scripts: "10–50 KB",
        },
        {
          name: "Idle RAM Usage",
          ghost: "~14 MB RAM",
          electron: "200–450 MB RAM",
          scripts: "Depends on PowerShell",
        },
        {
          name: "Startup Speed",
          ghost: "Instant (0.1s)",
          electron: "3–6 seconds",
          scripts: "1.5–3 seconds",
        },
        {
          name: "System Safety",
          ghost: "Auto .reg backup",
          electron: "Overwrites with no backup",
          scripts: "No undo capability",
        },
        {
          name: "Kernel Timer",
          ghost: "Hardware 0.500 ms",
          electron: "Stock 15.6 ms",
          scripts: "Not supported",
        },
        {
          name: "Background Services",
          ghost: "0 hidden services",
          electron: "Node.js background procs",
          scripts: "Scheduled tasks",
        },
      ],
    },
    arsenal: {
      tag: "Features",
      title: "What GhostTweak Does",
      subtitle: "Every feature tackles a specific gaming bottleneck: lowers input lag, frees memory, and stops system stuttering.",
      modules: [
        {
          id: "timer",
          title: "0.5ms Hardware Timer",
          badge: "WinAPI",
          desc: "Lowers Windows kernel timer resolution from default 15.6ms down to 0.5ms. Mouse tracking feels smoother, eliminating frame pacing jitter.",
          metric: "0.500 ms",
        },
        {
          id: "hotkey",
          title: "In-Game Hotkey Ctrl+Alt+F12",
          badge: "No Alt-Tab",
          desc: "Flushes bloated standby RAM cache and activates Turbo mode mid-game without switching windows.",
          metric: "Instant",
        },
        {
          id: "ping",
          title: "Valve Server Ping Tester",
          badge: "Network",
          desc: "Measures real TCP ping to CS2 server clusters (Frankfurt, Warsaw, Stockholm, Helsinki) and fast DNS servers.",
          metric: "TCP Ping",
        },
        {
          id: "shaders",
          title: "Shader Cache Purge",
          badge: "GPU",
          desc: "Cleans outdated or corrupted DirectX, NVIDIA, and AMD shader caches to eliminate sudden stutter when new game effects render.",
          metric: "Up to 8 GB",
        },
        {
          id: "tray",
          title: "Silent Tray Startup",
          badge: "System",
          desc: "Launches quietly with Windows straight into the notification tray with zero popup windows on boot.",
          metric: "0 Popups",
        },
        {
          id: "backup",
          title: "1-Click Safety Rollback",
          badge: "Safety",
          desc: "Automatically creates timestamped .reg backups before every tweak. Restore original settings at any time with a single click.",
          metric: "100% Reversible",
        },
      ],
    },
    profiles: {
      tag: "Presets",
      title: "Ready Presets in 1 Click",
      subtitle: "Instantly toggle configurations optimized for competitive games, cinematic titles, streaming, or office work.",
      applyBtn: "Apply Profile",
      appliedStatus: "Active",
      items: [
        {
          id: "esports",
          title: "Esports / FPS",
          tag: "Lowest Input Lag",
          desc: "0.5ms timer, Nagle algorithm disabled, high CPU priority for the game, auto RAM cache flush.",
          games: "CS2, Valorant, Apex Legends, PUBG",
          latency: "0.45 ms",
        },
        {
          id: "aaa",
          title: "Cinematic & RPG",
          tag: "Smooth Frame Times",
          desc: "Optimized GPU shader caching, high-performance power plan, background process throttling.",
          games: "Cyberpunk 2077, Alan Wake 2, GTA V",
          latency: "0.85 ms",
        },
        {
          id: "stream",
          title: "Streamer & Creator",
          tag: "Stream Priority",
          desc: "Network QoS prioritizing OBS and Discord, audio subsystem isolation, hardware encoding boost.",
          games: "OBS Studio, Discord, Twitch, YouTube",
          latency: "1.00 ms",
        },
        {
          id: "quiet",
          title: "Work & Battery",
          tag: "Balanced Efficiency",
          desc: "Default Windows services, energy-efficient scheduler, whisper-quiet fan operation.",
          games: "VS Code, Figma, Browser, Office",
          latency: "Default",
        },
      ],
    },
    pricing: {
      tag: "Pricing",
      title: "Simple & Fair Licensing",
      subtitle: "No subscriptions, no recurring fees, no adware. Lifetime access.",
      tiers: [
        {
          name: "Community",
          tag: "Free",
          price: "$0",
          period: "Forever",
          desc: "Essential cleaning, safe tweaks, and manual rollback.",
          features: [
            "Temp & Windows Update cache cleaning",
            "Basic gaming tweaks (Game Bar, Tips)",
            "Automatic .reg backup creation",
            "Open & transparent Rust binary",
          ],
          cta: "Download Free",
        },
        {
          name: "Pro",
          tag: "Popular",
          price: "$19",
          period: "Lifetime License",
          desc: "Full feature set: 0.5ms hardware timer, in-game hotkey, GPU shader cache purge, Valve ping tester.",
          popular: true,
          features: [
            "Everything in Community",
            "0.5ms hardware multimedia timer",
            "Ctrl+Alt+F12 in-game Turbo hotkey",
            "DirectX / NVIDIA / AMD shader cache purge",
            "Valve CS2 server ping tester",
            "TCP / Nagle off network tweaks",
            "Lifetime updates",
          ],
          cta: "Get Lifetime License",
        },
        {
          name: "LAN Center / Club",
          tag: "Commercial",
          price: "$199",
          period: "Up to 50 PCs",
          desc: "For esports arenas, gaming lounges, and clubs with silent mass deployment.",
          features: [
            "All Pro features included",
            "Licensed for up to 50 gaming rigs",
            "Silent install (.msi / command line)",
            "Export / import settings via JSON",
            "Priority direct support",
          ],
          cta: "Deploy for Club",
        },
      ],
    },
    downloadBanner: {
      title: "Download GhostTweak",
      desc: "Official release for Windows 10 & 11. No ads, no telemetry, no background daemons. Standalone compiled Rust executable.",
      msiBtn: "Download Setup (.exe)",
      zipBtn: "Portable (.exe, 4.8 MB)",
      cleanTag: "VirusTotal Clean (0/72)",
      sizeTag: "Installer: 1.58 MB",
      shaTag: "SHA-256 Verified",
      moreOptions: "Also available:",
      msiLink: "MSI Package (.msi, 2.39 MB)",
      githubLink: "GitHub Releases",
    },
    faq: {
      tag: "FAQ",
      title: "Frequently Asked Questions",
      subtitle: "Safety, anti-cheat compatibility, and system requirements.",
      items: [
        {
          q: "Is GhostTweak safe with anti-cheat (Vanguard, VAC, FACEIT, EAC)?",
          a: "Yes, 100% safe. GhostTweak does not inject into game processes or modify game memory. It only tweaks documented Windows registry settings and system APIs, exactly like regedit.",
        },
        {
          q: "How do I revert changes if I want to?",
          a: "Before modifying any setting, GhostTweak automatically saves a .reg backup file. You can restore your original Windows configuration at any time with one click in the Backups tab.",
        },
        {
          q: "Do I need Administrator rights?",
          a: "Yes. Changing system-wide Windows settings, stopping background telemetry services, and configuring the 0.5ms kernel timer require standard Windows administrator permissions.",
        },
        {
          q: "Does it work on Windows 11 24H2?",
          a: "Yes. GhostTweak is tested and fully compatible with Windows 10 (22H2) and Windows 11 (all versions, including 23H2 and 24H2).",
        },
      ],
    },
    footer: {
      desc: "Lightweight Windows gaming optimizer built in Rust. 0.5ms hardware timer, in-game RAM cache flush, and GPU shader cleaning.",
      reqTitle: "System Requirements",
      reqText: "Windows 10 / 11 (x64) • Administrator rights • 25 MB disk space",
      hashTitle: "SHA-256 Checksum",
      copied: "Copied!",
      copy: "Copy Hash",
      disclaimer: "GhostTweak is an independent software tool and is not affiliated with Microsoft Corporation. All registered trademarks belong to their respective owners.",
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
