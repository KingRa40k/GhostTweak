import React, { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GameOptimizer from './pages/GameOptimizer';
import Cleaner from './pages/Cleaner';
import Tweaks from './pages/Tweaks';
import Profiles from './pages/Profiles';
import Backups from './pages/Backups';
import Settings from './pages/Settings';
import AuthScreen from './pages/AuthScreen';
import LicenseModal from './components/LicenseModal';
import LanguageSelectModal from './components/LanguageSelectModal';
import { getStoredLicense, syncStoredLicenseWithNative, removeLicense, LicenseData } from './lib/license';
import { getPreferences, applyThemeToCss } from './lib/theme';
import { invoke } from './lib/tauri';
import { SecurityStatus } from './lib/types';
import { getStoredLanguage } from './lib/i18n';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [showLangModal, setShowLangModal] = useState<boolean>(() => getStoredLanguage() === null);
  const [isReady, setIsReady] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [isTermsAgreed, setIsTermsAgreed] = useState<boolean>(() => {
    return localStorage.getItem('ghosttweak_agreement_accepted') === 'true';
  });

  useEffect(() => {
    // 1. Anti-Tamper & Anti-DevTools Enforcement
    const handleContextMenu = (e: MouseEvent) => {
      // Prevent browser inspect context menu in production
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        return;
      }
      // Prevent Ctrl+U (view source) and Ctrl+S (save web page)
      if (e.ctrlKey && ['u', 'U', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // 2. Hardware Security & Debugger Status Probe
    invoke<SecurityStatus>('check_security_status')
      .then((status) => {
        setSecurityStatus(status);
      })
      .catch(() => {});

    // 3. Initialize Theme variables
    const prefs = getPreferences();
    applyThemeToCss(prefs.themeId);

    const handleThemeEvent = () => {
      setThemeVersion((v) => v + 1);
    };

    window.addEventListener('ghosttweak:theme-changed', handleThemeEvent);
    window.addEventListener('ghosttweak:prefs-changed', handleThemeEvent);

    // 4. Check native encrypted license store on disk
    syncStoredLicenseWithNative().then((lic) => {
      if (lic) {
        setLicense(lic);
      }
      setIsReady(true);
    }).catch(() => {
      const existing = getStoredLicense();
      if (existing) setLicense(existing);
      setIsReady(true);
    });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ghosttweak:theme-changed', handleThemeEvent);
      window.removeEventListener('ghosttweak:prefs-changed', handleThemeEvent);
    };
  }, []);

  const handleLogout = () => {
    removeLicense();
    setLicense(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'game-optimizer':
      case 'cs2boost': return <GameOptimizer />;
      case 'cleaner': return <Cleaner />;
      case 'tweaks': return <Tweaks />;
      case 'profiles': return <Profiles />;
      case 'backups': return <Backups />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-titanium-950 text-ghost-cyan">
        <div className="w-8 h-8 rounded-full border-2 border-ghost-cyan border-t-transparent animate-spin" />
      </div>
    );
  }

  // If not authorized yet or terms not agreed, show futuristic activation / key input screen
  if (!license || !isTermsAgreed) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-titanium-950 text-ghost-text font-sans">
        <TitleBar />
        <div className="flex-1 overflow-hidden" style={{ marginTop: '42px' }}>
          <AuthScreen onAuthorized={(data) => {
            setIsTermsAgreed(true);
            setLicense(data);
          }} />
        </div>
        {showLangModal && (
          <LanguageSelectModal onSelect={() => setShowLangModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-titanium-950 text-ghost-text font-sans">
      <TitleBar 
        key={`titlebar-${themeVersion}`}
        license={license} 
        onOpenLicense={() => setIsLicenseModalOpen(true)} 
      />

      <div className="flex flex-1 overflow-hidden" style={{ marginTop: '42px' }}>
        <Sidebar 
          key={`sidebar-${themeVersion}`}
          activePage={activePage} 
          onNavigate={setActivePage} 
          license={license}
          onManageLicense={() => setIsLicenseModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
          {securityStatus && (!securityStatus.is_genuine) && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-center gap-3 text-xs font-mono">
              <ShieldAlert size={18} className="shrink-0 animate-pulse text-rose-400" />
              <div>
                <span className="font-bold uppercase tracking-wider block">ПРЕДУПРЕЖДЕНИЕ БЕЗОПАСНОСТИ: ОБНАРУЖЕН ОТЛАДЧИК</span>
                <span>{securityStatus.detected_threat || 'Обнаружен активный отладчик или инструмент реверс-инжиниринга.'}</span>
              </div>
            </div>
          )}
          {renderPage()}
        </main>
      </div>

      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        license={license}
        onUpdateLicense={(updated: LicenseData) => setLicense(updated)}
        onLogout={handleLogout}
      />

      {showLangModal && (
        <LanguageSelectModal onSelect={() => setShowLangModal(false)} />
      )}
    </div>
  );
}
