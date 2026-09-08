import React, { useEffect, useState } from 'react';
import { 
  Loader2, History, RotateCcw, Trash2, ShieldAlert, 
  CheckCircle2, AlertCircle, Shield, ArrowRight, X
} from 'lucide-react';
import { invoke } from '../lib/tauri';
import { BackupInfo } from '../lib/types';
import { useI18n } from '../lib/i18n';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function Backups() {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<BackupInfo | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await invoke<BackupInfo[]>('list_backups');
      setBackups(data);
    } catch {
      setError(lang === 'ru' ? 'Не удалось загрузить историю точек отката.' : 'Failed to load backup restore points.');
      setBackups([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setLoading(true);
      setConfirmRestore(null);
      await invoke('restore_backup', { backupId: id });
      setNotice(t.backups.restoreSuccess);
      setTimeout(() => setNotice(null), 3500);
    } catch {
      setError(lang === 'ru' ? 'Ошибка восстановления резервной копии.' : 'Error restoring registry backup.');
    } finally {
      setLoading(false);
      fetchBackups();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await invoke('delete_backup', { backupId: id });
      setNotice(lang === 'ru' ? 'Точка отката удалена.' : 'Restore point deleted.');
      setTimeout(() => setNotice(null), 2500);
    } catch {
      setError(lang === 'ru' ? 'Не удалось удалить бэкап.' : 'Failed to delete backup.');
    } finally {
      fetchBackups();
    }
  };

  return (
    <div className="flex flex-col gap-5 page-enter pb-16 w-full max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-zinc-400">{lang === 'ru' ? 'БЕЗОПАСНОСТЬ РЕЕСТРА' : 'REGISTRY SAFETY'}</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <Shield size={13} />
              {lang === 'ru' ? `Точек отката: ${backups.length}` : `Restore points: ${backups.length}`}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.backups.title}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t.backups.desc}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/[0.08] border border-rose-500/20 p-3 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="bg-emerald-500/[0.08] border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-mono animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Backups List */}
      {loading && backups.length === 0 ? (
        <div className="flex py-12 items-center justify-center text-ghost-cyan">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : backups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 hardware-well border-dashed border-white/[0.08] rounded-2xl">
          <ShieldAlert size={40} className="mb-3 opacity-40 text-zinc-400" />
          <h3 className="text-sm font-bold text-white mb-1">{t.backups.emptyTitle}</h3>
          <p className="text-xs text-center max-w-sm text-zinc-500">
            {t.backups.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {backups.map(backup => (
            <div 
              key={backup.id} 
              className="glass-card p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] flex justify-between items-center transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-ghost-cyan">
                  <History size={18} />
                </div>
                <div>
                  <div className="font-bold text-white text-xs tracking-wide">{backup.description}</div>
                  <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-1">
                    <span>{backup.created_at}</span>
                    <span>•</span>
                    <span>{formatBytes(backup.size_bytes)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setConfirmRestore(backup)}
                  className="px-3 py-1.5 rounded-lg bg-ghost-cyan/10 border border-ghost-cyan/25 hover:bg-ghost-cyan/20 text-ghost-cyan text-xs font-mono flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw size={13} />
                  <span>{t.backups.btnRestore}</span>
                </button>

                <button 
                  onClick={() => handleDelete(backup.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"
                  title={t.backups.btnDelete}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {confirmRestore && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-scale-in">
          <div className="w-full max-w-md glass-card p-6 border-white/[0.12] rounded-2xl shadow-satin flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert size={18} />
                <h3 className="text-sm font-bold text-white">{t.backups.confirmTitle}</h3>
              </div>
              <button 
                onClick={() => setConfirmRestore(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {lang === 'ru' 
                ? `Вы уверены, что хотите восстановить состояние системы из копии: `
                : `Are you sure you want to restore system state from backup: `}
              <strong className="text-white">{confirmRestore.description}</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmRestore(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.06]"
              >
                {t.backups.btnCancel}
              </button>
              <button
                onClick={() => handleRestore(confirmRestore.id)}
                className="btn-cyan px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-cyan-glow"
              >
                <RotateCcw size={14} />
                <span>{t.backups.btnConfirm}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
