import React, { useState, useEffect } from 'react';
import { Minus, X, Square, Copy, ShieldCheck, Sparkles, Globe } from 'lucide-react';
import { 
  minimizeWindow, toggleMaximizeWindow, closeWindow, 
  startDraggingWindow, isWindowMaximized, invoke 
} from '../lib/tauri';
import { LicenseData } from '../lib/license';
import { useI18n } from '../lib/i18n';

interface TitleBarProps {
  license?: LicenseData | null;
  onOpenLicense?: () => void;
}

export default function TitleBar({ license, onOpenLicense }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    isWindowMaximized().then(setIsMaximized).catch(() => {});
    invoke<boolean>('is_admin_elevated').then(setIsAdmin).catch(() => setIsAdmin(true));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !(e.target as HTMLElement).closest('button, input, a, [data-no-drag]')) {
      startDraggingWindow();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('button, input, a, [data-no-drag]')) {
      handleToggleMaximize();
    }
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    minimizeWindow();
  };

  const handleToggleMaximize = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const max = await toggleMaximizeWindow();
    setIsMaximized(max);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeWindow();
  };

  return (
    <div 
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className="fixed top-0 left-0 right-0 h-[42px] bg-ghost-bg/95 backdrop-blur-md border-b border-ghost-border flex justify-between items-center z-50 select-none px-2 cursor-default"
    >
      <div data-tauri-drag-region className="flex items-center gap-3 pl-2 h-full">
        <div data-tauri-drag-region className="flex items-center font-extrabold tracking-tight text-xs text-white pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-ghost-cyan shadow-cyan-glow mr-2" />
          <span>GhostTweak</span>
        </div>

        {license && (
          <div data-no-drag className="flex items-center gap-2">
            <button
              type="button"
              data-no-drag
              onMouseDown={(e) => e.stopPropagation()}
              onClick={onOpenLicense}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase border transition-all hover:border-white/30 bg-white/[0.04] border-white/[0.08] text-zinc-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {license.plan === 'BETA_TESTER' ? (
                <>
                  <Sparkles size={11} className="text-ghost-neon" />
                  <span className="text-ghost-neon font-semibold">BETA TESTER</span>
                </>
              ) : license.plan === 'VIP_LIFETIME' ? (
                <>
                  <ShieldCheck size={11} className="text-amber-400" />
                  <span className="text-amber-400 font-semibold">VIP LIFETIME</span>
                </>
              ) : license.plan === 'PRO_MONTHLY' ? (
                <>
                  <ShieldCheck size={11} className="text-ghost-neon" />
                  <span className="text-ghost-neon font-semibold">PRO 30D</span>
                </>
              ) : license.plan === 'DAY_PASS' ? (
                <>
                  <ShieldCheck size={11} className="text-ghost-cyan" />
                  <span className="text-ghost-cyan font-semibold">PRO 24H</span>
                </>
              ) : license.plan === 'FREE' ? (
                <>
                  <Sparkles size={11} className="text-zinc-400" />
                  <span className="text-zinc-400 font-semibold">COMMUNITY FREE</span>
                </>
              ) : (
                <>
                  <Sparkles size={11} className="text-ghost-cyan" />
                  <span className="text-ghost-cyan">TRIAL</span>
                </>
              )}
            </button>
          </div>
        )}

        {isAdmin !== null && (
          <button
            type="button"
            data-no-drag
            onClick={!isAdmin ? () => invoke('restart_as_admin') : undefined}
            title={isAdmin ? (lang === 'ru' ? "Запущено с правами Администратора" : "Running as Administrator") : (lang === 'ru' ? "Нажмите для перезапуска с правами Администратора" : "Click to relaunch as Administrator")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border transition-all ${
              isAdmin
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 cursor-pointer'
            }`}
          >
            {isAdmin ? 'ADMIN' : 'NO ADMIN'}
          </button>
        )}
      </div>

      <div 
        data-tauri-drag-region 
        className="flex-1 h-full cursor-default" 
      />

      <div 
        data-no-drag
        className="flex h-full items-center"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          data-no-drag
          onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
          title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          className="h-full px-2.5 hover:bg-white/[0.08] transition-colors flex items-center gap-1 font-mono text-[11px] font-bold text-zinc-400 hover:text-white mr-1 border-r border-white/[0.06]"
        >
          <Globe size={12} className="text-ghost-cyan" />
          <span>{lang.toUpperCase()}</span>
        </button>

        <button 
          type="button"
          data-no-drag
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleMinimize}
          title={t.titlebar.minimize}
          className="h-full px-3.5 hover:bg-white/[0.06] transition-colors flex items-center justify-center text-ghost-muted hover:text-white"
        >
          <Minus size={14} />
        </button>
        <button 
          type="button"
          data-no-drag
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleToggleMaximize}
          title={isMaximized ? t.titlebar.restore : t.titlebar.maximize}
          className="h-full px-3.5 hover:bg-white/[0.06] transition-colors flex items-center justify-center text-ghost-muted hover:text-white"
        >
          {isMaximized ? (
            <Copy size={12} className="rotate-90" />
          ) : (
            <Square size={12} />
          )}
        </button>
        <button 
          type="button"
          data-no-drag
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleClose}
          title={t.titlebar.close}
          className="h-full px-4 hover:bg-red-600 transition-colors flex items-center justify-center text-ghost-muted hover:text-white"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
