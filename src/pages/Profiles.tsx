import React, { useState } from 'react';
import { 
  Crosshair, Film, Radio, Coffee, Check, ShieldCheck, 
  Zap, Globe, Sparkles, CheckCircle2, ArrowRight, Lock
} from 'lucide-react';
import { invoke } from '../lib/tauri';
import { getPreferences, savePreferences } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { getStoredLicense, isProLicense, LicenseData } from '../lib/license';
import UpgradeModal from '../components/UpgradeModal';

interface ProfileDef {
  id: 'esports' | 'cinematic' | 'streamer' | 'quiet';
  name: string;
  badge: string;
  tagline: string;
  icon: typeof Crosshair;
  latencyScore: string;
  fpsBoost: string;
  targetGames: string[];
  dns: string;
  features: string[];
}

interface ProfilesProps {
  license?: LicenseData | null;
}

export default function Profiles({ license: propLicense }: ProfilesProps = {}) {
  const { t, lang } = useI18n();
  const [prefs, setPrefs] = useState(getPreferences());
  const [applying, setApplying] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const isPro = isProLicense(propLicense || getStoredLicense());

  const PROFILES: ProfileDef[] = [
    {
      id: 'esports',
      name: t.profiles.esportsTitle,
      badge: t.profiles.badgeEsports,
      tagline: t.profiles.esportsDesc,
      icon: Crosshair,
      latencyScore: '0.45 ms',
      fpsBoost: '+15–28%',
      targetGames: ['CS2', 'Valorant', 'Apex Legends', 'Fortnite', 'PUBG'],
      dns: 'Cloudflare 1.1.1.1',
      features: lang === 'ru' ? [
        'Отключение Game DVR и фонового буфера записи',
        'Приоритет прерываний драйвера ввода (DPC Latency)',
        'Отключение алгоритма Nagle (TCP NoDelay = 1)',
        'Схема питания Ultimate Performance',
        'Очистка standby-кэша памяти перед сессией'
      ] : [
        'Disable Game DVR & background recording buffer',
        'Prioritize input driver interrupts (DPC Latency)',
        'Disable Nagle algorithm (TCP NoDelay = 1)',
        'Ultimate Performance power scheme active',
        'Standby RAM cache purged before match launch'
      ],
    },
    {
      id: 'cinematic',
      name: t.profiles.aaaTitle,
      badge: t.profiles.badgeAaa,
      tagline: t.profiles.aaaDesc,
      icon: Film,
      latencyScore: '1.20 ms',
      fpsBoost: '+10–18%',
      targetGames: ['Cyberpunk 2077', 'GTA V', 'Alan Wake 2', 'Witcher 3'],
      dns: 'Google 8.8.8.8',
      features: lang === 'ru' ? [
        'Оптимальный размер кэша шейдеров NVIDIA / AMD',
        'Фокус системных ресурсов на видеокарте (GPU Priority)',
        'Стабилизация минимального 1% и 0.1% FPS (lows)',
        'Увеличение пула подкачки текстур DirectX 12',
        'Сбалансированное фоновое энергопотребление'
      ] : [
        'Optimal NVIDIA / AMD shader cache allocation',
        'Direct system GPU priority for 3D tasks',
        'Stabilize 1% and 0.1% low frame rates',
        'Enhanced DirectX 12 texture streaming pool',
        'Balanced background power consumption'
      ],
    },
    {
      id: 'streamer',
      name: t.profiles.streamTitle,
      badge: t.profiles.badgeStream,
      tagline: t.profiles.streamDesc,
      icon: Radio,
      latencyScore: '0.85 ms',
      fpsBoost: '+8–15%',
      targetGames: ['Twitch', 'OBS Studio', 'Discord', 'YouTube', 'TikTok Live'],
      dns: 'Cloudflare 1.1.1.1',
      features: lang === 'ru' ? [
        'Высокий приоритет сетевого пакета OBS (QoS DSCP)',
        'Изоляция системных аудиодрайверов от задержек',
        'Аппаратный энкодер NVENC/AV1 в режиме High Performance',
        'Запрет троттлинга окон при сворачивании',
        'Отключение сбора телеметрии Windows'
      ] : [
        'High priority OBS network packets (QoS DSCP)',
        'Audio subsystem isolated from driver jitter',
        'NVENC / AV1 hardware encoder in high-perf mode',
        'Prevent window throttling on background minimize',
        'Disable Windows background telemetry collection'
      ],
    },
    {
      id: 'quiet',
      name: t.profiles.quietTitle,
      badge: t.profiles.badgeQuiet,
      tagline: t.profiles.quietDesc,
      icon: Coffee,
      latencyScore: '2.50 ms',
      fpsBoost: lang === 'ru' ? 'Стандарт' : 'Standard',
      targetGames: lang === 'ru' ? ['Браузер', 'Разработка', 'Офис', 'Кино', 'Монтаж'] : ['Browser', 'Dev', 'Office', 'Media', 'Editing'],
      dns: 'DHCP Default',
      features: lang === 'ru' ? [
        'Сбалансированный план питания Windows',
        'Включение визуальных эффектов и прозрачности',
        'Штатная работа игровых служб и оверлеев',
        'Минимальная нагрузка на процессор в простое',
        'Бесшумный акустический режим охлаждения'
      ] : [
        'Balanced Windows default power plan',
        'Re-enable UI animations & acrylic blur',
        'Standard operation of background services',
        'Minimal idle CPU footprint & thermals',
        'Acoustic silent fan profile compatibility'
      ],
    },
  ];

  const handleApplyProfile = async (profile: ProfileDef) => {
    const isProProfile = profile.id === 'cinematic' || profile.id === 'streamer';
    if (isProProfile && !isPro) {
      setUpgradeFeature(lang === 'ru' ? `Профиль оптимизации «${profile.name}»` : `${profile.name} Optimization Profile`);
      setShowUpgradeModal(true);
      return;
    }

    try {
      setApplying(profile.id);

      if (profile.id === 'esports') {
        await invoke('apply_all_tweaks').catch(() => {});
        await invoke('apply_cs2_boost').catch(() => {});
        await invoke('set_dns', { preset: 'cloudflare' }).catch(() => {});
        await invoke('flush_memory').catch(() => {});
      } else if (profile.id === 'cinematic') {
        await invoke('apply_tweak', { tweakId: 'disable_game_bar', enable: true }).catch(() => {});
        await invoke('apply_tweak', { tweakId: 'high_perf_power', enable: true }).catch(() => {});
        await invoke('set_dns', { preset: 'google' }).catch(() => {});
      } else if (profile.id === 'streamer') {
        await invoke('apply_tweak', { tweakId: 'optimize_network', enable: true }).catch(() => {});
        await invoke('apply_tweak', { tweakId: 'disable_telemetry', enable: true }).catch(() => {});
        await invoke('set_dns', { preset: 'cloudflare' }).catch(() => {});
      } else {
        await invoke('set_dns', { preset: 'dhcp' }).catch(() => {});
      }

      const updated = { ...prefs, activeProfile: profile.id };
      setPrefs(updated);
      savePreferences(updated);

      setNotice(lang === 'ru' ? `Профиль «${profile.name}» успешно активирован.` : `Profile "${profile.name}" successfully activated.`);
      setTimeout(() => setNotice(null), 3500);
    } catch {
      setNotice(lang === 'ru' ? 'Не удалось применить профиль.' : 'Failed to apply profile.');
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 page-enter pb-10 w-full max-w-6xl mx-auto">
      
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-zinc-400">{lang === 'ru' ? 'Профили оптимизации' : 'Profiles'}</span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {lang === 'ru' ? 'Активен:' : 'Active:'} {PROFILES.find(p => p.id === prefs.activeProfile)?.name}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.profiles.title}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t.profiles.desc}
          </p>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-500/[0.08] border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-mono animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROFILES.map((profile) => {
          const Icon = profile.icon;
          const isActive = prefs.activeProfile === profile.id;
          const isApplyingThis = applying === profile.id;
          const isProProfile = profile.id === 'cinematic' || profile.id === 'streamer';

          return (
            <div
              key={profile.id}
              className={`glass-card p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isActive 
                  ? 'border-white/[0.22] bg-titanium-850 shadow-satin' 
                  : 'border-white/[0.06] hover:border-white/[0.14]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl border ${
                      isActive 
                        ? 'bg-ghost-cyan/15 border-ghost-cyan/40 text-ghost-cyan shadow-[0_0_12px_rgba(0,240,255,0.2)]' 
                        : 'bg-white/[0.04] border-white/[0.08] text-zinc-400'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                        {profile.name}
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                        )}
                        {profile.id === 'esports' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
                            {lang === 'ru' ? 'БЕСПЛАТНО' : 'FREE'}
                          </span>
                        )}
                        {isProProfile && !isPro && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1 shrink-0">
                            <Lock size={10} /> PRO
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">
                        {profile.badge}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold flex items-center gap-1">
                      <Check size={11} /> {lang === 'ru' ? 'Активен' : 'Active'}
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  {profile.tagline}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="hardware-well p-2.5 rounded-xl flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">{lang === 'ru' ? 'Задержка ввода' : 'Input Latency'}</span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5">{profile.latencyScore}</span>
                  </div>
                  <div className="hardware-well p-2.5 rounded-xl flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">{lang === 'ru' ? 'Прирост FPS' : 'Est. FPS Boost'}</span>
                    <span className="text-xs font-mono font-bold text-ghost-cyan mt-0.5">{profile.fpsBoost}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1.5">{lang === 'ru' ? 'Рекомендовано для:' : 'Recommended for:'}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.targetGames.map(game => (
                      <span key={game} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-300 font-mono">
                        {game}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 mb-5">
                  {profile.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleApplyProfile(profile)}
                disabled={isActive || isApplyingThis}
                className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-white/[0.04] border border-white/[0.08] text-zinc-500 cursor-default'
                    : 'btn-cyan'
                }`}
              >
                {isApplyingThis ? (
                  <span>{lang === 'ru' ? 'Калибровка системы...' : 'Calibrating system...'}</span>
                ) : isActive ? (
                  <span>{t.profiles.btnActive}</span>
                ) : (
                  <>
                    {isProProfile && !isPro ? <Lock size={14} className="text-amber-300" /> : <Zap size={14} />}
                    <span>{t.profiles.btnActivate}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={upgradeFeature}
      />
    </div>
  );
}
