import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { usePackageStore } from '@/stores/packageStore';
import { downloadCSV, parseCSV, readCSVFile } from '@/services/csv';

export default function FabMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useUIStore((s) => s.navigate);
  const toggleBatchMode = useUIStore((s) => s.toggleBatchMode);
  const showToast = useUIStore((s) => s.showToast);
  const importCSV = usePackageStore((s) => s.importCSV);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleItemClick = (screen: 'add' | 'scan') => {
    setOpen(false);
    navigate(screen);
  };

  const handleExport = () => {
    setOpen(false);
    const all = usePackageStore.getState().packages;
    if (all.length === 0) {
      showToast('暂无数据可导出', 'error');
      return;
    }
    downloadCSV(all);
    showToast(`已导出 ${all.length} 条记录`, 'success');
  };

  const handleImportClick = () => {
    setOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readCSVFile(file);
      const records = parseCSV(text);
      if (records.length === 0) {
        showToast('CSV 文件无有效数据', 'error');
        return;
      }
      const imported = await importCSV(records);
      showToast(`成功导入 ${imported} 条，跳过 ${records.length - imported} 条重复`, 'success');
    } catch {
      showToast('导入失败，请检查文件格式', 'error');
    } finally {
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-4 flex flex-col items-end gap-3 z-20 safe-bottom">
      {open && (
        <div className="flex flex-col items-end gap-2 mb-2">
          <button
            onClick={() => handleItemClick('add')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg
                       text-sm text-gray-700 active:bg-gray-50 transition-colors"
          >
            <span>手动添加</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => handleItemClick('scan')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg
                       text-sm text-gray-700 active:bg-gray-50 transition-colors"
          >
            <span>扫码录入</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m4 0v-2m0 2v2m-4-6h2m-2-2v4m-8-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => { setOpen(false); toggleBatchMode(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg
                       text-sm text-gray-700 active:bg-gray-50 transition-colors"
          >
            <span>批量操作</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg
                       text-sm text-gray-700 active:bg-gray-50 transition-colors"
          >
            <span>导出 CSV</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg
                       text-sm text-gray-700 active:bg-gray-50 transition-colors"
          >
            <span>导入 CSV</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 bg-brand text-white rounded-2xl shadow-lg flex items-center justify-center
                    active:scale-95 transition-all duration-200
                    ${open ? 'rotate-45' : 'rotate-0'}`}
        aria-label="操作菜单"
      >
        <svg className="w-6 h-6 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
