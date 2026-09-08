'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  Video, 
  Moon, 
  Check, 
  Zap, 
  Sliders, 
  Activity
} from 'lucide-react';

interface PresetProfile {
  id: string;
  name: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  recommendedFor: string[];
  metrics: { label: string; value: string; positive: boolean }[];
  tweaksApplied: string[];
  systemLoad: { cpu: string; ram: string; latency: string };
}

const PRESETS: PresetProfile[] = [
  {
    id: 'esports',
    name: 'Esports Competitive',
    badge: 'НИЗКАЯ ЗАДЕРЖКА',
    icon: Trophy,
    description: 'Настройки для соревновательных шутеров. Мультимедийный таймер 0.5 мс, отключение фонового оверлея GameDVR и алгоритма Nagle в сетевом стеке.',
    recommendedFor: ['CS2', 'Valorant', 'Apex Legends', 'Overwatch 2', 'Dota 2'],
    metrics: [
      { label: 'Задержка ввода', value: '-3.8 мс', positive: true },
      { label: '0.1% Low FPS', value: '+20–28%', positive: true },
      { label: 'Стабильность кадра', value: '< 0.5 мс', positive: true },
    ],
    tweaksApplied: [
      'Системный таймер переключен на 0.500 мс',
      'Приоритет игрового трафика MMCSS',
      'Сетевые параметры: TCPNoDelay & TcpAckFrequency = 1',
      'Отключение фоновой записи GameDVR',
      'Схема питания высокой производительности',
    ],
    systemLoad: {
      cpu: 'High Performance',
      ram: 'Минимум в фоне',
      latency: '18 µs DPC',
    },
  },
  {
    id: 'aaa',
    name: 'AAA Cinematic',
    badge: 'ГРАФИКА И СТАБИЛЬНОСТЬ',
    icon: Gamepad2,
    description: 'Оптимально для требовательных одиночных игр с DirectX 12 и трассировкой лучей. Очистка кэша шейдеров и приоритизация видеокарты.',
    recommendedFor: ['Cyberpunk 2077', 'Black Myth: Wukong', 'Alan Wake 2', 'Stalker 2', 'Forza Horizon 5'],
    metrics: [
      { label: 'Загрузка текстур', value: 'Без фризов', positive: true },
      { label: '1% Low FPS', value: '+12–18%', positive: true },
      { label: 'VRAM кэш', value: 'Очищен', positive: true },
    ],
    tweaksApplied: [
      'Очистка устаревших файлов кэша DirectX 12 и GLCache',
      'Приоритет GPU Scheduling для фонового рендеринга',
      'Снижение дисковых задержек фоновой индексации',
      'Оптимизация буфера подкачки текстур',
    ],
    systemLoad: {
      cpu: 'Balanced',
      ram: 'VRAM Clean',
      latency: 'Stable',
    },
  },
  {
    id: 'streamer',
    name: 'Streamer & Content',
    badge: 'СТРИМИНГ И ЗАПИСЬ',
    icon: Video,
    description: 'Баланс ресурсов между игрой и кодированием потока. Защита процессов OBS Studio и аудиопотоков от просадок при нагрузке.',
    recommendedFor: ['OBS Studio', 'Discord', 'Twitch / YouTube', 'DaVinci Resolve'],
    metrics: [
      { label: 'Дроп кадров в OBS', value: '0.00%', positive: true },
      { label: 'Задержка микрофона', value: '< 2.5 мс', positive: true },
      { label: 'Синхронизация мониторов', value: 'Стабильно', positive: true },
    ],
    tweaksApplied: [
      'Повышенный приоритет для процесса OBS Studio',
      'MMCSS Pro Audio планирование аудиопотоков',
      'Оптимизация работы DWM на мониторах с разной частотой',
      'Отключение фоновой телеметрии Windows',
    ],
    systemLoad: {
      cpu: 'Multi-Core Balanced',
      ram: 'Encoder Priority',
      latency: '24 µs Audio',
    },
  },
  {
    id: 'quiet',
    name: 'Quiet Work & Battery',
    badge: 'ТИХИЙ РЕЖИМ',
    icon: Moon,
    description: 'Для работы, учебы и ноутбуков. Снижение фоновой активности процессора, уменьшение нагрева и уровня шума охлаждения.',
    recommendedFor: ['VS Code / IDE', 'Браузер и офис', 'Работа от батареи', 'Просмотр видео'],
    metrics: [
      { label: 'Температура в простое', value: '-5...-8°C', positive: true },
      { label: 'Время от батареи', value: '+30–45 мин', positive: true },
      { label: 'Шум вентиляторов', value: 'Минимальный', positive: true },
    ],
    tweaksApplied: [
      'Сбалансированная схема питания Windows',
      'Приостановка фонового поиска и телеметрии',
      'Снижение частоты опроса свернутых окон',
      'Энергосбережение неактивных USB-портов',
    ],
    systemLoad: {
      cpu: 'Eco Balanced',
      ram: 'RAM Cleaned',
      latency: 'Eco Mode',
    },
  },
];

import { useI18n } from '@/lib/i18n';

export const ScenarioProfiles: React.FC = () => {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string>('esports');
  const [appliedPreset, setAppliedPreset] = useState<string>('esports');
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const activePreset = PRESETS.find((p) => p.id === selectedId) || PRESETS[0];

  const handleApply = (id: string) => {
    setIsApplying(true);
    setTimeout(() => {
      setAppliedPreset(id);
      setIsApplying(false);
    }, 500);
  };

  return (
    <section id="profiles" className="relative py-28 border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/[0.03] backdrop-blur-md mb-4">
            <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
              {t.profiles.tag}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            {t.profiles.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans">
            {t.profiles.subtitle}
          </p>
        </div>

        {/* 4 Cards Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PRESETS.map((preset) => {
            const isSelected = preset.id === selectedId;
            const isCurrentActive = preset.id === appliedPreset;
            const Icon = preset.icon;

            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedId(preset.id);
                }}
                className={`p-5 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-white/30 shadow-2xl translate-y-[-2px]'
                    : 'border-white/[0.06] bg-[#0F1118]/80 hover:border-white/15'
                }`}
                style={{
                  backgroundColor: isSelected ? 'rgba(20, 24, 34, 0.95)' : undefined,
                  borderColor: isSelected ? 'var(--accent-border)' : undefined,
                }}
              >
                {isCurrentActive && (
                  <div 
                    className="absolute top-0 right-0 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider rounded-bl border-l border-b border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold"
                  >
                    АКТИВЕН
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="p-2.5 rounded-lg border"
                      style={{
                        backgroundColor: isSelected ? 'var(--accent-bg-subtle)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isSelected ? 'var(--accent-border)' : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? 'var(--accent-color)' : '#94A3B8',
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">
                        {preset.badge}
                      </span>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {preset.name}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 font-sans mb-4">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Задержка:</span>
                  <span className="font-bold" style={{ color: isSelected ? 'var(--accent-color)' : '#E2E8F0' }}>
                    {preset.systemLoad.latency}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Preset Specification Panel */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F15]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--accent-bg-subtle)',
                      color: 'var(--accent-color)',
                      borderColor: 'var(--accent-border)',
                    }}
                  >
                    ПРОФИЛЬ {activePreset.name}
                  </span>
                  {appliedPreset === activePreset.id && (
                    <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> ВЫБРАН
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  {activePreset.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400 font-sans leading-relaxed">
                  {activePreset.description}
                </p>
              </div>

              {/* Recommended Apps */}
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  Рекомендовано для:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activePreset.recommendedFor.map((game, gIdx) => (
                    <span 
                      key={gIdx}
                      className="px-2.5 py-1 rounded bg-[#171A24] border border-white/[0.07] text-xs font-mono text-slate-300"
                    >
                      {game}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleApply(activePreset.id)}
                disabled={isApplying || appliedPreset === activePreset.id}
                className={`w-full py-3.5 px-6 rounded-lg font-mono text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 transition-all ${
                  appliedPreset === activePreset.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                    : 'btn-accent'
                }`}
              >
                {isApplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Применение параметров...</span>
                  </>
                ) : appliedPreset === activePreset.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Профиль активен</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Активировать {activePreset.name}</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Technical Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activePreset.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="p-4 rounded-xl bg-[#131620] border border-white/[0.06] text-center">
                    <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                      {m.label}
                    </span>
                    <span className="font-mono text-xl font-black text-emerald-400">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-[#131620] border border-white/[0.06] p-4">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400 block mb-3 font-semibold flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                  Параметры профиля:
                </span>
                <div className="space-y-2">
                  {activePreset.tweaksApplied.map((tweak, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2.5 text-xs text-slate-300 font-sans">
                      <div 
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: 'var(--accent-color)' }} 
                      />
                      <span>{tweak}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
