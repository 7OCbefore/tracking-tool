import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';

export default function Toast() {
  const toastMessage = useUIStore((s) => s.toastMessage);
  const toastType = useUIStore((s) => s.toastType);
  const toastUndoAction = useUIStore((s) => s.toastUndoAction);
  const hideToast = useUIStore((s) => s.hideToast);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (toastMessage) {
      clearTimeout(timerRef.current);
      if (toastType !== 'undo') {
        timerRef.current = setTimeout(hideToast, 2500);
      }
    }
  }, [toastMessage, toastType, hideToast]);

  if (!toastMessage) return null;

  const bgColor =
    toastType === 'success' ? 'bg-green-600' :
    toastType === 'error' ? 'bg-red-500' : 'bg-gray-800';

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center">
      <div className={`${bgColor} text-white text-sm px-4 py-3 rounded-xl shadow-lg
                       flex items-center gap-3 animate-slide-up max-w-sm`}>
        <span className="flex-1">{toastMessage}</span>
        {toastType === 'undo' && toastUndoAction && (
          <button
            onClick={() => { toastUndoAction(); hideToast(); }}
            className="font-bold text-yellow-300 whitespace-nowrap"
          >
            撤销
          </button>
        )}
      </div>
    </div>
  );
}
