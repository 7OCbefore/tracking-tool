import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { usePackageStore } from '@/stores/packageStore';
import { db } from '@/services/db';
import { formatDateTime } from '@/utils/format';
import Modal from '@/components/ui/Modal';
import type { Package } from '@/types/package';

export default function PackageDetail() {
  const detailId = useUIStore((s) => s.detailId);
  const goBack = useUIStore((s) => s.goBack);
  const showToast = useUIStore((s) => s.showToast);
  const remove = usePackageStore((s) => s.remove);
  const toggleStatus = usePackageStore((s) => s.toggleStatus);

  const [pkg, setPkg] = useState<Package | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (detailId) {
      db.packages.get(detailId).then((p) => setPkg(p ?? null));
    }
  }, [detailId]);

  if (!pkg) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  const handleDelete = async () => {
    const [removed] = await remove(pkg.id);
    setShowDeleteModal(false);
    showToast(`已删除 ${removed.number}`, 'undo', async () => {
      await db.packages.add(removed);
      showToast('已撤销删除', 'success');
    });
    goBack();
  };

  const handleToggleStatus = async () => {
    await toggleStatus(pkg.id);
    const updated = await db.packages.get(pkg.id);
    if (updated) setPkg(updated);
  };

  const isPending = pkg.status === 'pending';

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 safe-top border-b border-gray-100">
        <button onClick={goBack} className="p-1 -ml-1 text-gray-600" aria-label="返回">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">快递详情</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">快递单号</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${isPending ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
              {isPending ? '待收件' : '已收到'}
            </span>
          </div>
          <p className="font-mono text-xl tracking-wider text-gray-900 break-all">
            {pkg.number}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <DetailRow label="客户名称" value={pkg.customer || '未填写'} />
          <DetailRow label="地区" value={pkg.region || '未填写'} />
          <DetailRow label="备注" value={pkg.notes || '无'} />
          <DetailRow label="录入时间" value={formatDateTime(pkg.createdAt)} />
          {pkg.receivedAt && (
            <DetailRow label="签收时间" value={formatDateTime(pkg.receivedAt)} />
          )}
        </div>

        <div className="flex gap-3">
          {isPending && (
            <button
              onClick={handleToggleStatus}
              className="flex-1 py-3 bg-success text-white rounded-xl font-medium text-sm
                         active:bg-green-600 transition-colors"
            >
              标记已收到
            </button>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className={`${isPending ? '' : 'flex-1'} py-3 bg-white text-danger rounded-xl
                       font-medium text-sm border border-gray-200 active:bg-red-50 transition-colors
                       ${isPending ? 'px-6' : ''}`}
          >
            删除
          </button>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        title="确认删除"
        message={`确定要删除快递单号「${pkg.number}」吗？可在 5 秒内撤销。`}
        confirmLabel="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
