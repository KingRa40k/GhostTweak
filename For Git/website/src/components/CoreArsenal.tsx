'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crosshair, 
  Trash2, 
  ShieldCheck, 
  Monitor, 
  RotateCcw, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Check
} from 'lucide-react';

interface FeatureCard {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  specs: { label: string; value: string; delta?: string }[];
  visualType: 'timer' | 'cleaner' | 'registry' | 'display' | 'rollback';
}

const FEATURES_RU: FeatureCard[] = [
  {
    id: 'esports-engine',
    badge: 'ТАЙМЕР ЯДРА',
    title: 'Настройка системного таймера (0.5 мс)',
    tagline: 'Переключение таймера Windows на 0.5 мс и приоритизация потоков MMCSS',
    description: 'Стандартный интервал системного таймера Windows составляет 15.6 мс. GhostTweak переключает мультимедийный таймер на 0.5 мс (timeBeginPeriod) и настраивает приоритет планировщика MMCSS для рендеринга.',
    icon: Crosshair,
    specs: [
      { label: 'Интервал таймера', value: '0.500 мс', delta: '-96.8%' },
      { label: 'DPC Latency', value: '< 24 µs', delta: 'Стабильно' },
      { label: 'MMCSS Games', value: 'Приоритет 8', delta: 'Realtime' },
    ],
    visualType: 'timer',
  },
  {
    id: 'shader-cleaner',
    badge: 'ОЧИСТКА КЭША',
    title: 'Очистка кэша шейдеров DirectX и видеокарт',
    tagline: 'Удаление устаревших файлов кэша NVIDIA, AMD и DirectX',
    description: 'После обновлений графических драйверов старый кэш шейдеров может накапливать битые файлы и вызывать просадки 1% Low FPS. Программа очищает папки GLCache, DxCache и D3DSCache.',
    icon: Trash2,
    specs: [
      { label: 'Поддержка', value: 'NVIDIA / AMD / Intel', delta: 'DirectX 11/12' },
      { label: 'Освобождение диска', value: 'До 12.4 ГБ', delta: 'Кэш и Temp' },
      { label: '1% Low FPS', value: '+10–14%', delta: 'Без рывков' },
    ],
    visualType: 'cleaner',
  },
  {
    id: 'registry-hardening',
    badge: 'РЕЕСТР И СЛУЖБЫ',
    title: 'Отключение телеметрии и фоновых служб',
    tagline: 'Снижение нагрузки на процессор без повреждения системных компонентов',
    description: 'Отключение только подтвержденных потребителей ресурсов: телеметрии DiagTrack, фонового захвата видео GameDVR и лишних опросов CEIP. Microsoft Store и компоненты Xbox остаются полностью работоспособными.',
    icon: ShieldCheck,
    specs: [
      { label: 'Фоновые службы', value: '-18 служб', delta: 'Отключено' },
      { label: 'Фоновая запись', value: 'GameDVR Off', delta: '0% CPU' },
      { label: 'Магазин и Xbox', value: '100% Работоспособны', delta: 'Safe' },
    ],
    visualType: 'registry',
  },
  {
    id: 'display-sync',
    badge: 'ПАРАМЕТРЫ ДИСПЛЕЯ',
    title: 'Синхронизация с частотой экрана (EDID)',
    tagline: 'Считывание реальной частоты монитора и расчет длительности кадра',
    description: 'GhostTweak считывает поддерживаемые частоты развертки экрана из драйвера видеокарты, рассчитывает предельный бюджет кадра (1000 / Hz) и помогает настроить параметры отображения.',
    icon: Monitor,
    specs: [
      { label: 'Бюджет кадра', value: '5.56 мс @ 180Hz', delta: 'Точный расчет' },
      { label: 'Разрешение EDID', value: 'Native Display', delta: 'Без интерполяции' },
      { label: 'Режимы DWM', value: 'Flip Model', delta: 'Низкая задержка' },
    ],
    visualType: 'display',
  },
  {
    id: 'atomic-rollback',
    badge: 'РЕЗЕРВНЫЕ КОПИИ',
    title: 'Резервное копирование и откат изменений',
    tagline: 'Автоматический экспорт веток реестра в файлы .reg перед оптимизацией',
    description: 'Перед внесением любого изменения создается резервная копия соответствующей ветки реестра в формате .reg. Восстановить исходное состояние можно в один клик.',
    icon: RotateCcw,
    specs: [
      { label: 'Формат бэкапа', value: '.REG (Win32)', delta: 'Стандартный' },
      { label: 'Время отката', value: '< 100 мс', delta: 'Без перезагрузки' },
      { label: 'Хранение', value: '%APPDATA%\\GhostTweak', delta: 'Локально' },
    ],
    visualType: 'rollback',
  },
];

const FEATURES_EN: FeatureCard[] = [
  {
    id: 'esports-engine',
    badge: 'KERNEL TIMER',
    title: 'Precision Multimedia Timer (0.5 ms)',
    tagline: 'Windows kernel multimedia timer scaling down to 0.5ms with MMCSS scheduling',
    description: 'Standard Windows timer resolution defaults to a sluggish 15.6 ms. GhostTweak locks the multimedia timer to 0.5 ms (timeBeginPeriod) and prioritizes MMCSS gaming scheduler threads.',
    icon: Crosshair,
    specs: [
      { label: 'Timer Interval', value: '0.500 ms', delta: '-96.8%' },
      { label: 'DPC Latency', value: '< 24 µs', delta: 'Rock Solid' },
      { label: 'MMCSS Games', value: 'Priority 8', delta: 'Realtime' },
    ],
    visualType: 'timer',
  },
  {
    id: 'shader-cleaner',
    badge: 'CACHE PURGE',
    title: 'DirectX & GPU Shader Cache Cleaner',
    tagline: 'Purges stale, corrupted shader caches across NVIDIA, AMD, and DirectX pipelines',
    description: 'After GPU driver updates, legacy compiled shader blobs become corrupted, causing 1% Low frame rate stuttering. GhostTweak cleans GLCache, DxCache, and D3DSCache safely.',
    icon: Trash2,
    specs: [
      { label: 'Compatibility', value: 'NVIDIA / AMD / Intel', delta: 'DirectX 11/12' },
      { label: 'Reclaimed Space', value: 'Up to 12.4 GB', delta: 'Cache & Temp' },
      { label: '1% Low FPS', value: '+10–14%', delta: 'Zero Stutter' },
    ],
    visualType: 'cleaner',
  },
  {
    id: 'registry-hardening',
    badge: 'REGISTRY & SERVICES',
    title: 'Telemetry & Background Bloat Disabling',
    tagline: 'Minimizes CPU interrupts without breaking core Windows or store components',
    description: 'Eliminates verified resource drains: DiagTrack telemetry, GameDVR background screen capture, and CEIP feedback. Microsoft Store and Xbox app components remain 100% operational.',
    icon: ShieldCheck,
    specs: [
      { label: 'Services Tweaked', value: '-18 Services', delta: 'Disabled' },
      { label: 'DVR Capture', value: 'GameDVR Off', delta: '0% CPU' },
      { label: 'Store & Xbox', value: '100% Operational', delta: 'Safe' },
    ],
    visualType: 'registry',
  },
  {
    id: 'display-sync',
    badge: 'DISPLAY SYNC',
    title: 'Monitor EDID Refresh Rate Synchronization',
    tagline: 'Reads exact hardware refresh rate and calculates strict millisecond frame budget',
    description: 'GhostTweak queries supported display modes from GPU drivers via Win32 API, calculates frame pacing budget (1000 / Hz), and optimizes Windows DWM flip presentation.',
    icon: Monitor,
    specs: [
      { label: 'Frame Budget', value: '5.56 ms @ 180Hz', delta: 'Precise Target' },
      { label: 'EDID Resolution', value: 'Native Display', delta: 'Zero Scaling' },
      { label: 'DWM Model', value: 'Hardware Flip', delta: 'Low Latency' },
    ],
    visualType: 'display',
  },
  {
    id: 'atomic-rollback',
    badge: 'SAFE ROLLBACK',
    title: 'Automated Registry Snapshots & Undo',
    tagline: 'Exports affected registry keys into standard .reg files before executing changes',
    description: 'Prior to modifying any registry key, an exact timestamped snapshot is saved to disk. Revert any or all tweaks back to Windows default state in a single click.',
    icon: RotateCcw,
    specs: [
      { label: 'Backup Format', value: '.REG (Win32)', delta: 'Standard' },
      { label: 'Rollback Speed', value: '< 100 ms', delta: 'No Reboot' },
      { label: 'Storage', value: '%APPDATA%\\GhostTweak', delta: 'Local Disk' },
    ],
    visualType: 'rollback',
  },
];

import { useI18n } from '@/lib/i18n';

export const CoreArsenal: React.FC = () => {
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState<string>('esports-engine');

  const isEn = lang === 'en';
  const features = isEn ? FEATURES_EN : FEATURES_RU;
  const currentFeature = features.find((f) => f.id === activeTab) || features[0];

  return (
    <section id="arsenal" className="relative py-28 border-t border-white/[0.06] overflow-hidden bg-[#090A0E]">
      <div className="absolute inset-0 bg-micro-grid opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/[0.03] backdrop-blur-md mb-4">
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
              {t.arsenal.tag}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            {t.arsenal.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans">
            {t.arsenal.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {features.map((feat) => {
            const isActive = feat.id === activeTab;
            const Icon = feat.icon;

            return (
              <button
                key={feat.id}
                onClick={() => setActiveTab(feat.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'border-white/30 text-white shadow-lg'
                    : 'border-white/[0.06] bg-[#12141C]/60 text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--accent-bg-subtle)' : undefined,
                  borderColor: isActive ? 'var(--accent-border)' : undefined,
                  color: isActive ? 'var(--accent-color)' : undefined,
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-semibold">{feat.badge}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0E1016]/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div 
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
            style={{ backgroundColor: 'var(--accent-color)' }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span 
                      className="px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-widest border"
                      style={{
                        backgroundColor: 'var(--accent-bg-subtle)',
                        color: 'var(--accent-color)',
                        borderColor: 'var(--accent-border)',
                      }}
                    >
                      {currentFeature.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      {isEn ? 'READY TO DEPLOY' : 'ГОТОВО К ПРИМЕНЕНИЮ'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                    {currentFeature.title}
                  </h3>

                  <p className="text-sm sm:text-base font-mono text-slate-300 mb-4" style={{ color: 'var(--accent-color)' }}>
                    {currentFeature.tagline}
                  </p>

                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans mb-8">
                    {currentFeature.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/[0.08]">
                  {currentFeature.specs.map((spec, sIdx) => (
                    <div 
                      key={sIdx}
                      className="p-3 rounded-lg bg-[#141722]/80 border border-white/[0.06] flex flex-col"
                    >
                      <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                        {spec.label}
                      </span>
                      <span className="font-mono text-base font-bold text-slate-100">
                        {spec.value}
                      </span>
                      {spec.delta && (
                        <span className="font-mono text-[11px] text-emerald-400 font-medium mt-0.5">
                          {spec.delta}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-xl border border-white/[0.08] bg-[#141620]/90 p-5 font-mono text-xs shadow-inner relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08] text-slate-400">
                    <div className="flex items-center gap-2">
                      <currentFeature.icon className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                      <span className="font-bold uppercase tracking-wider text-slate-200">
                        {isEn ? 'DIAGNOSTICS' : 'ДИАГНОСТИКА'}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">STATUS: OK</span>
                  </div>

                  {currentFeature.visualType === 'timer' && (
                    <div className="space-y-4 py-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{isEn ? 'NT Timer Interval:' : 'Интервал таймера NT:'}</span>
                        <span className="text-white font-bold">0.500 ms</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-3 p-0.5 border border-white/10">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: '98%', backgroundColor: 'var(--accent-color)' }}
                        />
                      </div>
                      <div className="p-3 rounded bg-black/30 border border-white/5 space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{isEn ? 'Interrupt Rate:' : 'Разрешение прерываний:'}</span>
                          <span className="text-slate-300">1000 Hz</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{isEn ? 'Context Switch:' : 'Переключение контекста:'}</span>
                          <span className="text-emerald-400 font-bold">0.8 µs</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentFeature.visualType === 'cleaner' && (
                    <div className="space-y-3 py-2">
                      {[
                        { name: 'NVIDIA GLCache', size: isEn ? '1,420 MB' : '1 420 МБ', status: isEn ? 'Ready' : 'Готов' },
                        { name: 'DirectX D3DSCache', size: isEn ? '2,890 MB' : '2 890 МБ', status: isEn ? 'Ready' : 'Готов' },
                        { name: 'Windows Update Temp', size: isEn ? '4,100 MB' : '4 100 МБ', status: isEn ? 'Ready' : 'Готов' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-black/30 border border-white/5">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-300">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">{item.size}</span>
                            <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentFeature.visualType === 'registry' && (
                    <div className="space-y-2 py-2 text-[11px]">
                      <div className="p-2.5 rounded bg-black/40 border border-white/5 text-slate-300">
                        <span className="text-slate-500">HKCU\System\GameConfigStore</span>
                        <div className="flex justify-between mt-1">
                          <span className="text-slate-400">GameDVR_Enabled</span>
                          <span className="font-bold text-emerald-400">DWORD: 0x00000000</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-black/40 border border-white/5 text-slate-300">
                        <span className="text-slate-500">HKLM\SOFTWARE\Policies\DataCollection</span>
                        <div className="flex justify-between mt-1">
                          <span className="text-slate-400">AllowTelemetry</span>
                          <span className="font-bold text-emerald-400">DWORD: 0x00000000</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-black/40 border border-white/5 text-slate-300">
                        <span className="text-slate-500">Service: DiagTrack</span>
                        <div className="flex justify-between mt-1">
                          <span className="text-slate-400">StartupType</span>
                          <span className="font-bold text-amber-400">DISABLED (4)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentFeature.visualType === 'display' && (
                    <div className="space-y-3 py-2">
                      <div className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5">
                        <span className="text-slate-400">{isEn ? 'Display Refresh Rate:' : 'Частота экрана:'}</span>
                        <span className="text-lg font-bold" style={{ color: 'var(--accent-color)' }}>180.00 Hz</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5">
                        <span className="text-slate-400">{isEn ? 'Frame Budget:' : 'Длительность кадра (Frame Budget):'}</span>
                        <span className="text-emerald-400 font-bold">5.555 ms</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        {isEn ? 'Pacing calculation without triple buffering penalty' : 'Расчет интервала без тройной буферизации'}
                      </div>
                    </div>
                  )}

                  {currentFeature.visualType === 'rollback' && (
                    <div className="space-y-3 py-2">
                      <div className="p-3 rounded bg-black/40 border border-white/5">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">auto_backup_pre_tweak.reg</span>
                          <span className="text-emerald-400">{isEn ? 'SAVED' : 'СОХРАНЕНО'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isEn ? 'Exported 42 registry keys' : 'Экспортировано 42 ключа реестра'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-white/[0.03] border border-white/5 text-[11px] text-slate-300">
                        {isEn 
                          ? 'Rollback instantly restores original registry values without requiring Windows reinstallation.' 
                          : 'Откат восстанавливает исходные значения веток реестра без полной переустановки системы.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
