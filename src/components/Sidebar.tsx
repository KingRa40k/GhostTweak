import React from 'react';
import { 
  LayoutDashboard, Trash2, Sliders, History, Key, 
  LogOut, ShieldCheck, Crosshair, Settings as SettingsIcon, 
  Ghost, Flame, Zap, Crown, Gamepad2
} from 'lucide-react';
import { LicenseData } from '../lib/license';
import { getPreferences, AvatarId } from '../lib/theme';
import { useI18n } from '../lib/i18n';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  license: LicenseData | null;
  onManageLicense: () => void;
  onLogout: () => void;
}

export default function Sidebar({ activePage, onNavigate, license, onManageLicense, onLogout }: SidebarProps) {
  const prefs = getPreferences();
  const { t, lang } = useI18n();

  const navItems = [
    { id: 'dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard },
    { id: 'game-optimizer', label: t.sidebar.gameOptimizer, icon: Gamepad2 },
    { id: 'cleaner', label: t.sidebar.cleaner, icon: Trash2 },
    { id: 'tweaks', label: t.sidebar.tweaks, icon: Sliders },
    { id: 'profiles', label: t.sidebar.profiles, icon: Crosshair },
    { id: 'backups', label: t.sidebar.backups, icon: History },
    { id: 'settings', label: t.sidebar.settings, icon: SettingsIcon },
  ];

  const renderAvatar = (avatarId: AvatarId) => {
    switch (avatarId) {
      case 'falcon': return <Flame size={14} className="text-amber-400" />;
      case 'vortex': return <Zap size={14} className="text-ghost-cyan" />;
      case 'crosshair': return <Crosshair size={14} className="text-emerald-400" />;
      case 'crown': return <Crown size={14} className="text-purple-400" />;
      default: return <Ghost size={14} className="text-ghost-cyan" />;
    }
  };

  return (
    <div className="w-[230px] bg-titanium-950 border-r border-white/[0.08] flex flex-col justify-between h-full select-none shrink-0 font-sans">
      
      <div className="p-3 flex flex-col gap-1 pt-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 mb-2 font-medium">
          {lang === 'ru' ? 'Инструменты' : 'Tools'}
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex items-center justify-between px-3.5 py-2 rounded-xl transition-all duration-150 text-xs font-medium ${
                isActive 
                  ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-sm' 
                  : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} className={`transition-colors ${
                  isActive ? 'text-ghost-cyan' : 'text-zinc-500 group-hover:text-zinc-300'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-ghost-cyan shadow-cyan-glow" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3">
        <div className="glass-card p-3 rounded-xl border border-white/[0.08] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                {renderAvatar(prefs.avatar)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-white leading-none truncate" title={prefs.callsign}>
                  {prefs.callsign}
                </span>
                <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
                  {license?.plan === 'BETA_TESTER'
                    ? (lang === 'ru' ? 'VIP Tester Pass' : 'VIP Tester Pass')
                    : license?.plan === 'VIP_LIFETIME' 
                      ? 'VIP Lifetime' 
                      : license?.plan === 'PRO_MONTHLY'
                        ? (lang === 'ru' ? 'Pro Monthly (30 дн)' : 'Pro Monthly (30d)')
                        : license?.plan === 'DAY_PASS' 
                          ? (lang === 'ru' ? 'PRO (1 день)' : 'PRO 24h Pass') 
                          : license?.plan === 'FREE'
                            ? (lang === 'ru' ? 'Community Free' : 'Community Free')
                            : (lang === 'ru' ? 'Триал 3 дня' : 'Trial Edition')}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title={lang === 'ru' ? 'Сменить ключ / Выйти' : 'Change Key / Exit'}
              className="p-1.5 rounded-lg hover:bg-rose-500/15 text-zinc-500 hover:text-rose-400 transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>

          {license?.plan !== 'VIP_LIFETIME' && license?.plan !== 'BETA_TESTER' && (
            <button
              onClick={onManageLicense}
              className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500/15 to-ghost-cyan/15 hover:from-amber-500/25 hover:to-ghost-cyan/25 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown size={12} className="text-amber-400" />
              <span>{lang === 'ru' ? 'Обновить до VIP' : 'Upgrade to VIP'}</span>
            </button>
          )}

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>{lang === 'ru' ? 'HWID Привязан' : 'HWID Bound'}</span>
            <button 
              onClick={onManageLicense}
              className="text-ghost-cyan hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'ru' ? 'Ключ' : 'Key'}</span>
              <ShieldCheck size={11} className="text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
