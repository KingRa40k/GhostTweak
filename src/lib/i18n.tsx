import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ru' | 'en';

const LANG_KEY = 'ghosttweak_language_v1';

export function getStoredLanguage(): Language | null {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'ru' || saved === 'en') return saved;
  return null;
}

export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(LANG_KEY, lang);
  window.dispatchEvent(new CustomEvent('ghosttweak:lang-changed', { detail: lang }));
}

export const translations = {
  ru: {
    // Language Selection Screen
    langSelect: {
      title: 'ВЫБЕРИТЕ ЯЗЫК',
      subtitle: 'SELECT YOUR PREFERRED LANGUAGE',
      hint: 'Язык интерфейса можно изменить в любой момент в настройках',
      confirm: 'Продолжить',
      ruCardTitle: 'Русский',
      ruCardDesc: 'Полная локализация, киберспортивные профили и документация',
      enCardTitle: 'English',
      enCardDesc: 'Full English UI, esports profiles, and technical documentation',
    },
    // TitleBar
    titlebar: {
      title: 'GhostTweak',
      subtitle: 'Настройка Windows и оптимизация FPS',
      ready: 'ГОТОВ',
      minimize: 'Свернуть',
      maximize: 'Развернуть',
      restore: 'Восстановить',
      close: 'Закрыть в трей',
      langToggle: 'RU',
    },
    // Sidebar
    sidebar: {
      dashboard: 'Обзор',
      gameOptimizer: 'Оптимизация игр',
      cleaner: 'Очистка диска',
      tweaks: 'Твики реестра',
      profiles: 'Игровые профили',
      backups: 'Резервные копии',
      settings: 'Настройки',
      license: 'Лицензия',
      statusVerified: 'АКТИВИРОВАН',
      statusTrial: 'ТРИАЛ 3 ДНЯ',
      statusGuest: 'ГОСТЬ',
      operator: 'Оператор',
    },
    // AuthScreen
    auth: {
      title: 'GhostTweak',
      version: 'v1.0.0',
      subtitle: 'Настройка Windows и очистка кэшей',
      ready: 'ГОТОВ',
      keyInputTitle: 'ЛИЦЕНЗИОННЫЙ КЛЮЧ',
      keyPlaceholder: 'GHOST-XXXX-XXXX-XXXX',
      formatHint: 'Формат: GHOST-XXXX-XXXX-XXXX',
      formatValid: 'Формат ключа корректен',
      btnActivate: 'Активировать',
      btnTrial: 'Пробный период (3 дня)',
      localValidation: 'Локальная валидация ключа',
      verifyingTitle: 'ВЕРИФИКАЦИЯ КЛЮЧА',
      verifyingSubtitle: 'Проверка подписи в локальном хранилище...',
      activatedSuccess: 'ДОСТУП ПРЕДОСТАВЛЕН',
      stepHwid: 'Проверка идентификатора системы...',
      stepSignature: 'Проверка подписи ключа...',
      stepApproved: 'Ключ подтвержден.',
      stepTrial: 'Активация пробного периода (3 дня)...',
      errEmptyKey: 'Введите лицензионный ключ.',
      errInvalidKey: 'Неверный ключ. Проверьте введенные символы.',
      errTrial: 'Ошибка активации пробного периода',
      agreePrefix: 'Я прочитал(-а) и принимаю',
      privacyLink: 'Политику конфиденциальности',
      agreeAnd: 'и',
      termsLink: 'Условия использования',
      errMustAgree: 'Необходимо подтвердить согласие с Политикой конфиденциальности и Условиями использования',
    },
    // Dashboard
    dashboard: {
      welcome: 'СИСТЕМА ГОТОВА К ОПТИМИЗАЦИИ',
      welcomeSub: 'Профиль задержки ядра активен. Рекомендуется выполнить очистку памяти.',
      btnOptimize: '🚀 Оптимизировать систему',
      optimizing: 'Оптимизация...',
      optimizedDone: 'Система оптимизирована',
      btnFastCs2: '🎮 Оптимизация игр',
      bannerTitle: 'Оптимизация игр и прерываний ядра',
      bannerDesc: 'IFEO высокий приоритет, снятие парковки ядер CPU (Core Unparking) и разгрузка Standby List RAM для Counter-Strike 2, Valorant и Apex.',
      statJunk: 'Кэш и мусор',
      statJunkScanning: 'Сканирование...',
      statJunkSub: 'Готово к очистке',
      statTweaks: 'Активные твики',
      statTweaksSub: 'Реестр и службы',
      statScore: 'Индекс готовности',
      statScoreSub: 'Оптимизация системы',
      statRam: 'Оперативная память',
      statRamFlush: 'Сбросить RAM',
      statRamFlushed: 'Память очищена',
      statRamUsed: 'Занято',
      statRamTotal: 'Всего',
      quickProfiles: 'БЫСТРЫЙ ПРОФИЛЬ:',
      hwTitle: 'АППАРАТНАЯ КОНФИГУРАЦИЯ',
      hwOs: 'ОС',
      hwCpu: 'Процессор',
      hwGpu: 'Видеокарта',
      hwRam: 'Память',
    },
    // Game Optimizer
    gameOpt: {
      badge: 'КИБЕРСПОРТИВНОЕ ЯДРО',
      title: 'Оптимизация игр и прерываний',
      desc: 'Низкоуровневая настройка Windows, приоритизация процессов IFEO и разгрузка памяти для устранения микрофризов.',
      disciplines: 'ВЫБОР ДИСЦИПЛИНЫ',
      matrixTitle: 'МАТРИЦА ТВupdates ЯДРА И ПРИОРИТЕТОВ',
      matrixDesc: 'Настройки применяются напрямую в реестр Windows и планировщик потоков',
      btnApplyAll: 'Применить комплекс для киберспорта',
      btnApplying: 'Применение...',
      btnApplied: 'Комплекс оптимизации применен',
      ramStandbyTitle: 'ЭКСТРЕННАЯ ВЫГРУЗКА STANDBY LIST ОЗУ',
      ramStandbyDesc: 'Освобождает забитый дисковый кэш памяти перед матчем. Предотвращает микростаттеры при обращении к диску.',
      btnFlushRam: 'Очистить Standby List ОЗУ',
      btnFlushing: 'Выгрузка...',
      launchOptionsTitle: 'ГЕНЕРАТОР ПАРАМЕТРОВ ЗАПУСКА',
      launchOptionsDesc: 'Откалибровано под фактическое число потоков процессора',
      threadsLabel: 'Потоков процессора:',
      copyBtn: 'Копировать',
      copiedBtn: 'Скопировано',
      autoexecTitle: 'СОРЕВНОВАТЕЛЬНЫЙ AUTOEXEC.CFG (CS2)',
      autoexecDesc: 'Оптимизация сетевого буфера, рендеринга и аудиоподсистемы',
      saveAutoexec: 'Сохранить autoexec.cfg',
      autoexecHint: 'Поместите файл в папку: game/csgo/cfg/',
      tweakIfeo: 'Высокий приоритет IFEO',
      tweakIfeoDesc: 'Windows автоматически выделяет максимальное время CPU для процесса игры',
      tweakResp: 'SystemResponsiveness 0%',
      tweakRespDesc: 'Отключает 20% резерв процессора под фоновые службы мультимедиа',
      tweakGpu: 'GPU Priority 8',
      tweakGpuDesc: 'Максимальный приоритет графического планировщика для 3D-приложений',
      tweakUnpark: 'Снятие парковки ядер (Core Unparking)',
      tweakUnparkDesc: 'Все ядра CPU остаются активными, предотвращая микрофризы при пробуждении',
      tweakPower: 'Отключение Power Throttling',
      tweakPowerDesc: 'Запрещает Windows сбрасывать частоту процессора при игровой нагрузке',
      tweakDynamicTick: 'Отключение Dynamic Tick',
      tweakDynamicTickDesc: 'Аппаратный таймер прерываний 0.5 мс для минимальной задержки мыши',
    },
    // Cleaner
    cleaner: {
      title: 'Очистка диска и кэшей',
      desc: 'Удаление временных системных файлов, устаревших шейдеров и кэшей без риска для личных данных.',
      btnRescan: 'Повторное сканирование',
      scanning: 'Сканирование накопителей...',
      btnClean: 'Очистить выбранное',
      cleaning: 'Очистка...',
      cleanDone: 'Очистка завершена',
      selectedSize: 'Выбрано для очистки:',
      noFiles: 'Мусорные файлы не обнаружены',
      catTempUser: 'Пользовательские временные файлы',
      catTempUserDesc: 'Временные файлы приложений в каталоге %TEMP%',
      catTempSys: 'Системные временные файлы',
      catTempSysDesc: 'Логи и временные файлы Windows в C:\\Windows\\Temp',
      catNvShader: 'Шейдерный кэш NVIDIA',
      catNvShaderDesc: 'Устаревшие скомпилированные шейдеры OpenGL и DirectX',
      catAmdShader: 'Шейдерный кэш AMD',
      catAmdShaderDesc: 'Кэш шейдеров драйверов Radeon D3D и Vulkan',
      catDxShader: 'Шейдерный кэш DirectX',
      catDxShaderDesc: 'Общесистемный кэш D3D в каталоге пользователя',
      catWinUpdate: 'Кэш обновлений Windows',
      catWinUpdateDesc: 'Загруженные временные пакеты обновлений Windows',
      catThumb: 'Эскизы проводника',
      catThumbDesc: 'Кэш миниатюр проводника Windows thumbcache_*.db',
    },
    // Tweaks
    tweaks: {
      title: 'Твики реестра и служб',
      desc: 'Тонкая настройка компонентов Windows для снижения задержек и повышения стабильности.',
      btnApplyRecommended: 'Применить все рекомендованные',
      tabAll: 'Все',
      tabGaming: 'Игры',
      tabPerformance: 'Производительность',
      tabNetwork: 'Сеть',
      tabPrivacy: 'Конфиденциальность',
      badgeRisky: 'ВНИМАНИЕ',
      searchPlaceholder: 'Поиск по названию или описанию...',
      toastApplied: 'Твик применен',
      toastReverted: 'Твик возвращен к исходному значению',
    },
    // Profiles
    profiles: {
      title: 'Игровые профили',
      desc: 'Предустановленные конфигурации системных прерываний под конкретные сценарии использования.',
      btnActive: 'Активен',
      btnActivate: 'Активировать профиль',
      badgeEsports: 'КИБЕРСПОРТ',
      badgeAaa: 'AAA ИГРЫ',
      badgeStream: 'СТРИМИНГ',
      badgeQuiet: 'ТИХИЙ',
      esportsTitle: 'Esports Competitive',
      esportsDesc: 'Минимальная аппаратная задержка (0.45 мс), отключение алгоритма Nagle, максимальный приоритет игрового процесса.',
      aaaTitle: 'AAA Cinematic',
      aaaDesc: 'Стабилизация фреймтайма для сюжетных игр, оптимизация буфера видеопамяти и приоритизация планировщика GPU.',
      streamTitle: 'Streamer & Creator',
      streamDesc: 'Сетевой QoS для OBS и Discord, изоляция аудиоподсистемы, приоритет кодировщика NVENC/AV1.',
      quietTitle: 'Quiet & Work Balance',
      quietDesc: 'Штатное энергопотребление Windows, возврат анимаций и сохранение заряда батареи ноутбука.',
    },
    // Backups
    backups: {
      title: 'Резервные копии реестра',
      desc: 'Автоматические точки восстановления веток реестра, созданные перед каждым изменением.',
      emptyTitle: 'Резервные копии отсутствуют',
      emptyDesc: 'При первом применении твиков система автоматически сохранит исходные ветки реестра в .reg файлы.',
      colDate: 'Дата создания',
      colDesc: 'Описание',
      colSize: 'Размер',
      colActions: 'Действия',
      btnRestore: 'Восстановить',
      btnDelete: 'Удалить',
      restoring: 'Восстановление...',
      restoreSuccess: 'Оригинальные параметры успешно восстановлены',
      confirmTitle: 'Подтверждение восстановления',
      confirmText: 'Вы уверены, что хотите восстановить параметры из этого резервного файла?',
      btnCancel: 'Отмена',
      btnConfirm: 'Восстановить',
    },
    // Settings
    settings: {
      title: 'Настройки приложения',
      desc: 'Параметры внешнего вида, сетевые шлюзы и калибровка монитора.',
      secDisplay: 'АППАРАТНАЯ КАЛИБРОВКА МОНИТОРА',
      secDisplayDesc: 'Прямой опрос Win32 API для определения физических характеристик матрицы',
      resLabel: 'Текущее разрешение:',
      refreshLabel: 'Частота обновления:',
      budgetLabel: 'Бюджет времени кадра:',
      secTheme: 'ЦВЕТОВОЙ АКЦЕНТ ИНТЕРФЕЙСА',
      secThemeDesc: 'Выбор цветовой схемы оформления приложения',
      secDns: 'СЕТЕВОЙ ШЛЮЗ И DNS',
      secDnsDesc: 'Переключение системных DNS-серверов для снижения сетевого отклика',
      dnsCurrent: 'Текущий DNS:',
      btnSetDns: 'Применить DNS',
      secProfile: 'ПРОФИЛЬ ОПЕРАТОРА',
      callsignLabel: 'Позывной (Callsign):',
      savePrefs: 'Сохранить настройки',
      prefsSaved: 'Настройки сохранены',
      secLang: 'ЯЗЫК ИНТЕРФЕЙСА (LANGUAGE)',
      secLangDesc: 'Переключение языка приложения между русским и английским',
    },
    // License Modal
    licenseModal: {
      title: 'СВЕДЕНИЯ О ЛИЦЕНЗИИ',
      plan: 'Издание:',
      hwid: 'Аппаратный HWID:',
      activated: 'Дата активации:',
      expires: 'Действительна до:',
      operator: 'Владелец:',
      btnClose: 'Закрыть',
      btnLogout: 'Сменить ключ / Выйти',
    },
  },

  en: {
    // Language Selection Screen
    langSelect: {
      title: 'SELECT LANGUAGE',
      subtitle: 'ВЫБЕРИТЕ ПРЕДПОЧИТАЕМЫЙ ЯЗЫК',
      hint: 'You can change the language anytime in Settings',
      confirm: 'Continue',
      ruCardTitle: 'Русский',
      ruCardDesc: 'Full Russian localization, esports profiles, and documentation',
      enCardTitle: 'English',
      enCardDesc: 'English interface, gaming profiles, and technical documentation',
    },
    // TitleBar
    titlebar: {
      title: 'GhostTweak',
      subtitle: 'Windows Gaming Optimizer & FPS Cleaner',
      ready: 'READY',
      minimize: 'Minimize',
      maximize: 'Maximize',
      restore: 'Restore',
      close: 'Hide to Tray',
      langToggle: 'EN',
    },
    // Sidebar
    sidebar: {
      dashboard: 'Dashboard',
      gameOptimizer: 'Game Optimizer',
      cleaner: 'Disk Cleaner',
      tweaks: 'Registry Tweaks',
      profiles: 'Gaming Profiles',
      backups: 'Backups',
      settings: 'Settings',
      license: 'License',
      statusVerified: 'ACTIVATED',
      statusTrial: '3-DAY TRIAL',
      statusGuest: 'GUEST',
      operator: 'Operator',
    },
    // AuthScreen
    auth: {
      title: 'GhostTweak',
      version: 'v1.0.0',
      subtitle: 'Windows Optimization & Cache Cleaner',
      ready: 'READY',
      keyInputTitle: 'LICENSE KEY',
      keyPlaceholder: 'GHOST-XXXX-XXXX-XXXX',
      formatHint: 'Format: GHOST-XXXX-XXXX-XXXX',
      formatValid: 'Key format is valid',
      btnActivate: 'Activate License',
      btnTrial: '3-Day Free Trial',
      localValidation: 'Offline Local Key Validation',
      verifyingTitle: 'KEY VERIFICATION',
      verifyingSubtitle: 'Verifying digital signature in local store...',
      activatedSuccess: 'ACCESS GRANTED',
      stepHwid: 'Verifying hardware identifier...',
      stepSignature: 'Checking key cryptographic signature...',
      stepApproved: 'License confirmed.',
      stepTrial: 'Activating 3-day trial period...',
      errEmptyKey: 'Please enter a valid license key.',
      errInvalidKey: 'Invalid key. Please check the entered characters.',
      errTrial: 'Failed to activate trial period',
      agreePrefix: 'I have read and agree to the',
      privacyLink: 'Privacy Policy',
      agreeAnd: 'and',
      termsLink: 'Terms of Service',
      errMustAgree: 'You must agree to the Privacy Policy and Terms of Service to continue',
    },
    // Dashboard
    dashboard: {
      welcome: 'SYSTEM READY FOR OPTIMIZATION',
      welcomeSub: 'Kernel latency profile is active. Memory cleanup is recommended.',
      btnOptimize: '🚀 Optimize Everything',
      optimizing: 'Optimizing...',
      optimizedDone: 'System Optimized',
      btnFastCs2: '🎮 Game Optimizer',
      bannerTitle: 'Game Optimization & Kernel Interrupts',
      bannerDesc: 'IFEO High Priority, Core Unparking 100%, and RAM Standby List flush for Counter-Strike 2, Valorant, and Apex.',
      statJunk: 'Junk & Cache',
      statJunkScanning: 'Scanning...',
      statJunkSub: 'Ready to Clean',
      statTweaks: 'Active Tweaks',
      statTweaksSub: 'Registry & Services',
      statScore: 'Readiness Score',
      statScoreSub: 'System Tuning',
      statRam: 'Physical RAM',
      statRamFlush: 'Flush Memory',
      statRamFlushed: 'Memory Flushed',
      statRamUsed: 'Used',
      statRamTotal: 'Total',
      quickProfiles: 'QUICK PROFILE:',
      hwTitle: 'HARDWARE SPECIFICATIONS',
      hwOs: 'OS',
      hwCpu: 'Processor',
      hwGpu: 'Graphics Card',
      hwRam: 'Memory',
    },
    // Game Optimizer
    gameOpt: {
      badge: 'ESPORTS KERNEL',
      title: 'Game & Latency Optimizer',
      desc: 'Low-level Windows tuning, IFEO process prioritization, and RAM Standby List purging to eliminate micro-stutters.',
      disciplines: 'SELECT DISCIPLINE',
      matrixTitle: 'KERNEL TWEAKS & PRIORITY MATRIX',
      matrixDesc: 'Settings applied directly into Windows Registry and thread scheduler',
      btnApplyAll: 'Apply Esports Calibration',
      btnApplying: 'Applying...',
      btnApplied: 'Esports Calibration Active',
      ramStandbyTitle: 'EMERGENCY STANDBY LIST RAM PURGE',
      ramStandbyDesc: 'Flushes standby file cache before matches, preventing hitching when Windows accesses disk.',
      btnFlushRam: 'Purge Standby List RAM',
      btnFlushing: 'Purging...',
      launchOptionsTitle: 'LAUNCH OPTIONS GENERATOR',
      launchOptionsDesc: 'Calibrated to your exact CPU thread count',
      threadsLabel: 'CPU Threads:',
      copyBtn: 'Copy',
      copiedBtn: 'Copied',
      autoexecTitle: 'COMPETITIVE AUTOEXEC.CFG (CS2)',
      autoexecDesc: 'Tuned network interpolation, renderer buffer, and audio sub-system',
      saveAutoexec: 'Save autoexec.cfg',
      autoexecHint: 'Place in game directory: game/csgo/cfg/',
      tweakIfeo: 'IFEO High Priority',
      tweakIfeoDesc: 'Windows automatically allocates maximum CPU execution time to the game process',
      tweakResp: 'SystemResponsiveness 0%',
      tweakRespDesc: 'Disables the default 20% CPU throttle Windows reserves for background multimedia',
      tweakGpu: 'GPU Priority 8',
      tweakGpuDesc: 'Assigns highest priority in Windows multimedia GPU scheduling table',
      tweakUnpark: 'CPU Core Unparking (100%)',
      tweakUnparkDesc: 'Keeps all CPU cores active, preventing micro-stutters from waking parked cores on laptops',
      tweakPower: 'Disable Power Throttling',
      tweakPowerDesc: 'Prevents Windows from downclocking CPU frequency under gaming loads',
      tweakDynamicTick: 'Disable Dynamic Tick',
      tweakDynamicTickDesc: 'Hardware timer locked to 0.5 ms for lowest possible mouse input latency',
    },
    // Cleaner
    cleaner: {
      title: 'System & Cache Cleaner',
      desc: 'Clean temporary files, outdated shader caches, and update residue safely without touching personal files.',
      btnRescan: 'Rescan Drives',
      scanning: 'Scanning drives...',
      btnClean: 'Clean Selected',
      cleaning: 'Cleaning...',
      cleanDone: 'Cleaning Complete',
      selectedSize: 'Selected for cleaning:',
      noFiles: 'No temporary files found',
      catTempUser: 'User Temp Files',
      catTempUserDesc: 'Temporary application files in %TEMP%',
      catTempSys: 'System Temp Files',
      catTempSysDesc: 'Windows logs and temporary cache in C:\\Windows\\Temp',
      catNvShader: 'NVIDIA Shader Cache',
      catNvShaderDesc: 'Outdated compiled OpenGL and DirectX shaders',
      catAmdShader: 'AMD Shader Cache',
      catAmdShaderDesc: 'Compiled shaders from Radeon D3D and Vulkan drivers',
      catDxShader: 'DirectX Shader Cache',
      catDxShaderDesc: 'System-wide DirectX D3D shader cache in user profile',
      catWinUpdate: 'Windows Update Cache',
      catWinUpdateDesc: 'Downloaded temporary Windows update installation packages',
      catThumb: 'Explorer Thumbnail Cache',
      catThumbDesc: 'Explorer icon and thumbnail cache files (thumbcache_*.db)',
    },
    // Tweaks
    tweaks: {
      title: 'Registry & Services Tweaks',
      desc: 'Fine-tune Windows components for lower latency, maximum responsiveness, and privacy.',
      btnApplyRecommended: 'Apply All Recommended',
      tabAll: 'All',
      tabGaming: 'Gaming',
      tabPerformance: 'Performance',
      tabNetwork: 'Network',
      tabPrivacy: 'Privacy',
      badgeRisky: 'CAUTION',
      searchPlaceholder: 'Search tweak by name or description...',
      toastApplied: 'Tweak applied',
      toastReverted: 'Tweak reverted to default',
    },
    // Profiles
    profiles: {
      title: 'Scenario Profiles',
      desc: 'Pre-calibrated system profiles tailored for specific gaming and workload scenarios.',
      btnActive: 'Active',
      btnActivate: 'Activate Profile',
      badgeEsports: 'ESPORTS',
      badgeAaa: 'AAA GAMES',
      badgeStream: 'STREAMING',
      badgeQuiet: 'QUIET',
      esportsTitle: 'Esports Competitive',
      esportsDesc: 'Sub-millisecond timer resolution (0.45 ms), Nagle algorithm disabled, high DPC interrupt priority.',
      aaaTitle: 'AAA Cinematic',
      aaaDesc: 'Frametime pacing stabilization, GPU scheduling priority, and dynamic texture memory management.',
      streamTitle: 'Streamer & Creator',
      streamDesc: 'Network DSCP packet prioritization for OBS, audio sub-system isolation, and NVENC/AV1 priority.',
      quietTitle: 'Quiet & Work Balance',
      quietDesc: 'Standard Windows power plan, desktop animations enabled, and battery preservation for laptops.',
    },
    // Backups
    backups: {
      title: 'Registry Backups',
      desc: 'Automatic restore points of modified registry branches created prior to applying changes.',
      emptyTitle: 'No Backups Found',
      emptyDesc: 'GhostTweak automatically exports .reg backups to your disk before modifying registry keys.',
      colDate: 'Created Date',
      colDesc: 'Description',
      colSize: 'Size',
      colActions: 'Actions',
      btnRestore: 'Restore',
      btnDelete: 'Delete',
      restoring: 'Restoring...',
      restoreSuccess: 'Original settings successfully restored',
      confirmTitle: 'Confirm Restore',
      confirmText: 'Are you sure you want to restore registry values from this backup file?',
      btnCancel: 'Cancel',
      btnConfirm: 'Restore',
    },
    // Settings
    settings: {
      title: 'Application Settings',
      desc: 'Visual themes, network DNS resolvers, and hardware display calibration.',
      secDisplay: 'HARDWARE DISPLAY CALIBRATION',
      secDisplayDesc: 'Direct Win32 API probe querying physical monitor modes',
      resLabel: 'Current Resolution:',
      refreshLabel: 'Refresh Rate:',
      budgetLabel: 'Frame-Time Budget:',
      secTheme: 'CHASSIS THEME ACCENT',
      secThemeDesc: 'Select custom color accent for application styling',
      secDns: 'GAMING DNS RESOLVER',
      secDnsDesc: 'Switch system DNS resolver to lower packet route hops',
      dnsCurrent: 'Current DNS:',
      btnSetDns: 'Apply DNS',
      secProfile: 'OPERATOR PROFILE',
      callsignLabel: 'Tactical Callsign:',
      savePrefs: 'Save Preferences',
      prefsSaved: 'Preferences Saved',
      secLang: 'INTERFACE LANGUAGE',
      secLangDesc: 'Switch application language between English and Russian',
    },
    // License Modal
    licenseModal: {
      title: 'LICENSE DETAILS',
      plan: 'Edition:',
      hwid: 'Hardware HWID:',
      activated: 'Activation Date:',
      expires: 'Valid Until:',
      operator: 'Licensee:',
      btnClose: 'Close',
      btnLogout: 'Change Key / Exit',
    },
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations['ru'];
}

const I18nContext = createContext<I18nContextType>({
  lang: 'ru',
  setLang: () => {},
  t: translations.ru,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = getStoredLanguage();
    return stored || 'ru';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  };

  useEffect(() => {
    const handleLangEvent = (e: Event) => {
      const custom = e as CustomEvent<Language>;
      if (custom.detail && (custom.detail === 'ru' || custom.detail === 'en')) {
        setLangState(custom.detail);
      }
    };
    window.addEventListener('ghosttweak:lang-changed', handleLangEvent);
    return () => window.removeEventListener('ghosttweak:lang-changed', handleLangEvent);
  }, []);

  const t = translations[lang] || translations.ru;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  return useContext(I18nContext);
}
