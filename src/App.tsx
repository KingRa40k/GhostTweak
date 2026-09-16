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
import TrialLockoutModal from './components/TrialLockoutModal';
import { getStoredLicense, removeLicense, resetLicense, syncStoredLicenseWithNative, LicenseData } from './lib/license';
import { getPreferences, applyThemeToCss } from './lib/theme';
import { invoke } from './lib/tauri';
import { SecurityStatus, TrialStatus } from './lib/types';
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
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isTermsAgreed, setIsTermsAgreed] = useState<boolean>(() => {
    return localStorage.getItem('ghosttweak_agreement_accepted') === 'true';
  });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && ['u', 'U', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    invoke<SecurityStatus>('check_security_status')
      .then((status) => {
        setSecurityStatus(status);
      })
      .catch(() => {});

    const prefs = getPreferences();
    applyThemeToCss(prefs.themeId);

    const handleThemeEvent = () => {
      setThemeVersion((v) => v + 1);
    };

    window.addEventListener('ghosttweak:theme-changed', handleThemeEvent);
    window.addEventListener('ghosttweak:prefs-changed', handleThemeEvent);

    const handleOpenLicModal = () => {
      setIsLicenseModalOpen(true);
    };
    window.addEventListener('ghosttweak:open-license-modal', handleOpenLicModal);

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

    const pollTrial = () => {
      invoke<TrialStatus>('get_trial_status')
        .then((ts) => {
          setTrialStatus(ts);
          if (ts.is_trial && !ts.is_expired) {
            setLicense((prev) => prev || {
              key: '24H-EVALUATION-TRIAL',
              plan: 'TRIAL',
              hwid: 'EVAL-DEVICE',
              activatedAt: ts.started_at_human,
              expiresAt: ts.formatted_time_remaining,
              userName: 'Evaluation Buyer',
            });
            setIsTermsAgreed(true);
          }
        })
        .catch(() => {});
    };

    pollTrial();
    const trialInterval = setInterval(pollTrial, 15000);

    return () => {
      clearInterval(trialInterval);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ghosttweak:theme-changed', handleThemeEvent);
      window.removeEventListener('ghosttweak:prefs-changed', handleThemeEvent);
      window.removeEventListener('ghosttweak:open-license-modal', handleOpenLicModal);
    };
  }, []);

  const handleLogout = () => {
    resetLicense();
    setLicense(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'game-optimizer':
      case 'cs2boost': return <GameOptimizer license={license} />;
      case 'cleaner': return <Cleaner license={license} />;
      case 'tweaks': return <Tweaks license={license} />;
      case 'profiles': return <Profiles license={license} />;
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
        trialStatus={trialStatus}
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
                <span className="font-bold tracking-wider block">Предупреждение: обнаружен отладчик</span>
                <span>{securityStatus.detected_threat || 'Обнаружен активный отладчик или инструмент анализа.'}</span>
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

      {trialStatus?.is_expired && (
        <TrialLockoutModal trialStatus={trialStatus} />
      )}

      {showLangModal && (
        <LanguageSelectModal onSelect={() => setShowLangModal(false)} />
      )}
    </div>
  );
}
