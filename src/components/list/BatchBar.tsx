import { useUIStore } from '@/stores/uiStore';
import { usePackageStore } from '@/stores/packageStore';

export default function BatchBar() {
  const batchMode = useUIStore((s) => s.batchMode);
  const selectedIds = useUIStore((s) => s.selectedIds);
  const toggleBatchMode = useUIStore((s) => s.toggleBatchMode);
  const batchMarkReceived = usePackageStore((s) => s.batchMarkReceived);
  const showToast = useUIStore((s) => s.showToast);

  if (!batchMode) return null;

  const count = selectedIds.size;

  const handleMarkReceived = async () => {
    if (count === 0) return;
    const ids = [...selectedIds];
    await batchMarkReceived(ids);
    toggleBatchMode();
    showToast(`已标记 ${count} 件为已收到`, 'success');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3
                    flex items-center justify-between safe-bottom z-30">
      <span className="text-sm text-gray-600">
        已选 <span className="font-bold text-brand">{count}</span> 项
      </span>
      <div className="flex gap-2">
        <button
          onClick={toggleBatchMode}
          className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
        >
          取消
        </button>
        <button
          onClick={handleMarkReceived}
          disabled={count === 0}
          className="px-4 py-2 text-sm bg-brand text-white rounded-lg font-medium
                     disabled:opacity-40 active:bg-blue-700 transition-colors"
        >
          标记已收
        </button>
      </div>
    </div>
  );
}
