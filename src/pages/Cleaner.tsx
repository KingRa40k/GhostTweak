import React, { useEffect, useState } from 'react';
import { 
  Loader2, RefreshCw, Trash2, CheckSquare, Square, 
  CheckCircle2, Sparkles, Filter, AlertCircle, HardDrive, Zap
} from 'lucide-react';
import { invoke } from '../lib/tauri';
import { ScanResult, CleanResult, FlushResult } from '../lib/types';
import { useI18n } from '../lib/i18n';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function Cleaner() {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [flushingRam, setFlushingRam] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cleanResult, setCleanResult] = useState<CleanResult | null>(null);
  const [ramResult, setRamResult] = useState<FlushResult | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryInfo = (id: string, defaultName: string, defaultDesc: string) => {
    switch (id) {
      case 'temp_user': return { name: t.cleaner.catTempUser, desc: t.cleaner.catTempUserDesc };
      case 'temp_system': return { name: t.cleaner.catTempSys, desc: t.cleaner.catTempSysDesc };
      case 'nvidia_shader': return { name: t.cleaner.catNvShader, desc: t.cleaner.catNvShaderDesc };
      case 'amd_shader': return { name: t.cleaner.catAmdShader, desc: t.cleaner.catAmdShaderDesc };
      case 'dx_shader': return { name: t.cleaner.catDxShader, desc: t.cleaner.catDxShaderDesc };
      case 'windows_update': return { name: t.cleaner.catWinUpdate, desc: t.cleaner.catWinUpdateDesc };
      case 'thumbnails': return { name: t.cleaner.catThumb, desc: t.cleaner.catThumbDesc };
      default: return { name: defaultName, desc: defaultDesc };
    }
  };

  const fetchScan = async () => {
    try {
      setLoading(true);
      setError('');
      setCleanResult(null);
      const res = await invoke<ScanResult>('scan_junk');
      setScanResult(res);
      setSelectedIds(new Set(res.categories.map(c => c.id)));
    } catch {
      setError(lang === 'ru' ? 'Не удалось просканировать системные накопители.' : 'Failed to scan system drives.');
      setScanResult({ categories: [], total_size_bytes: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const toggleCategory = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (!scanResult) return;
    if (selectedIds.size === scanResult.categories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(scanResult.categories.map(c => c.id)));
    }
  };

  const handleClean = async () => {
    if (selectedIds.size === 0) return;
    try {
      setCleaning(true);
      setError('');
      const categoryIds = Array.from(selectedIds);
      const res = await invoke<CleanResult>('clean_junk', { categoryIds });
      setCleanResult(res);
      await fetchScan();
    } catch {
      setError('Ошибка в процессе очистки файлов.');
    } finally {
      setCleaning(false);
    }
  };

  const handleFlushRam = async () => {
    try {
      setFlushingRam(true);
      const res = await invoke<FlushResult>('flush_memory');
      setRamResult(res);
      setTimeout(() => setRamResult(null), 4000);
    } catch {
      // ignore
    } finally {
      setFlushingRam(false);
    }
  };

  const selectedSize = scanResult?.categories
    .filter(c => selectedIds.has(c.id))
    .reduce((acc, c) => acc + c.size_bytes, 0) || 0;

  const filteredCategories = scanResult?.categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-5 page-enter pb-24 w-full max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tech-badge text-zinc-400">{lang === 'ru' ? 'АНАЛИЗАТОР НАКОПИТЕЛЕЙ' : 'STORAGE ANALYZER'}</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-ghost-cyan">
              {lang === 'ru' ? 'Кэши драйверов & шейдеров' : 'Driver & Shader Caches'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.cleaner.title}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t.cleaner.desc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFlushRam}
            disabled={flushingRam}
            className="px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] hover:border-ghost-cyan/40 hover:bg-white/[0.06] rounded-xl transition-all text-xs font-mono text-zinc-300 flex items-center gap-1.5"
          >
            <Zap size={14} className={flushingRam ? "animate-spin text-ghost-cyan" : "text-ghost-cyan"} />
            <span>{flushingRam ? (lang === 'ru' ? "Сброс..." : "Flushing...") : t.dashboard.statRamFlush}</span>
          </button>

          <button 
            onClick={fetchScan}
            disabled={loading || cleaning}
            className="px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.06] rounded-xl transition-all text-xs font-mono text-zinc-300 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{t.cleaner.btnRescan}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/[0.08] border border-rose-500/20 p-3 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {ramResult && (
        <div className="bg-ghost-cyan/[0.08] border border-ghost-cyan/20 p-3.5 rounded-xl flex items-center gap-2.5 text-ghost-cyan text-xs font-mono animate-fade-in">
          <Zap size={16} />
          <span>{lang === 'ru' ? `Оперативная память оптимизирована: освобождено ${ramResult.freed_mb} МБ working set.` : `RAM cache optimized: freed ${ramResult.freed_mb} MB working set.`}</span>
        </div>
      )}

      {cleanResult && (
        <div className="bg-emerald-500/[0.08] border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400 animate-fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <div className="text-xs font-mono">
            <span className="font-bold">{t.cleaner.cleanDone}:</span> {lang === 'ru' ? `Освобождено ${formatBytes(cleanResult.cleaned_bytes)} в ${cleanResult.cleaned_files} файлах.` : `Freed ${formatBytes(cleanResult.cleaned_bytes)} across ${cleanResult.cleaned_files} files.`}
          </div>
        </div>
      )}

      {/* Filter and Select Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            {scanResult && selectedIds.size === scanResult.categories.length ? (lang === 'ru' ? 'Снять выделение' : 'Deselect All') : (lang === 'ru' ? 'Выбрать все' : 'Select All')}
          </button>
          <span className="text-xs text-zinc-500 font-mono">
            {lang === 'ru' ? `Выбрано: ${selectedIds.size} из ${scanResult?.categories.length || 0}` : `Selected: ${selectedIds.size} of ${scanResult?.categories.length || 0}`}
          </span>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ru' ? "Поиск категорий..." : "Search categories..."}
            className="w-full bg-titanium-950 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="flex flex-col gap-2.5">
        {filteredCategories.map(category => {
          const isSelected = selectedIds.has(category.id);
          const catInfo = getCategoryInfo(category.id, category.name, category.description);
          return (
            <div 
              key={category.id} 
              onClick={() => toggleCategory(category.id)}
              className={`glass-card p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected 
                  ? 'border-white/[0.2] bg-titanium-850 shadow-sm' 
                  : 'border-white/[0.04] bg-white/[0.01] hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`transition-colors ${isSelected ? 'text-ghost-cyan' : 'text-zinc-600'}`}>
                  {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs tracking-wide">{catInfo.name}</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{catInfo.desc}</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="font-mono font-bold text-xs text-white">{formatBytes(category.size_bytes)}</span>
                <span className="text-[10px] font-mono text-zinc-500 mt-0.5">{category.file_count} {lang === 'ru' ? 'файлов' : 'files'}</span>
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && !loading && (
          <div className="text-center p-10 text-zinc-500 border border-dashed border-white/[0.06] rounded-2xl font-mono text-xs">
            {t.cleaner.noFiles}
          </div>
        )}
      </div>

      {/* Fixed Sticky Footer Bottom Bar */}
      <div className="fixed bottom-0 left-[230px] right-0 bg-titanium-950/95 backdrop-blur-xl border-t border-white/[0.08] p-4 flex justify-between items-center z-30 px-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <HardDrive size={18} className="text-zinc-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-zinc-500">{t.cleaner.selectedSize}</span>
            <span className="font-mono font-extrabold text-sm text-white">{formatBytes(selectedSize)}</span>
          </div>
        </div>

        <button
          onClick={handleClean}
          disabled={selectedIds.size === 0 || cleaning}
          className="btn-cyan px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-cyan-glow disabled:opacity-30"
        >
          {cleaning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{t.cleaner.cleaning}</span>
            </>
          ) : (
            <>
              <Trash2 size={15} />
              <span>{t.cleaner.btnClean}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
