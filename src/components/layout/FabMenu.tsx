import { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';

export default function FabMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useUIStore((s) => s.navigate);
  const toggleBatchMode = useUIStore((s) => s.toggleBatchMode);

  const handleItemClick = (screen: 'add' | 'scan') => {
    setOpen(false);
    navigate(screen);
  };

  return (
    <div className="fixed bottom-6 right-4 flex flex-col items-end gap-3 z-20 safe-bottom">
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
