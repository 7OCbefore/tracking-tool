import { usePackageStore } from '@/stores/packageStore';
import { getLastArchiveDate } from '@/services/archive';

function hasActiveFilters(f: { datePreset: unknown; customer: string; region: string }): boolean {
  return !!(f.datePreset || f.customer || f.region);
}

export default function Header() {
  const packages = usePackageStore((s) => s.packages);
  const totalCount = usePackageStore((s) => s.totalCount);
  const activeTab = usePackageStore((s) => s.activeTab);
  const filters = usePackageStore((s) => s.filters);
  const filtering = hasActiveFilters(filters);

  const pendingCount = filtering
    ? packages.filter((p) => p.status === 'pending').length
    : activeTab === 'pending'
      ? totalCount
      : packages.filter((p) => p.status === 'pending').length;
  const receivedCount = filtering
    ? packages.filter((p) => p.status === 'received').length
    : activeTab === 'received'
      ? totalCount
      : packages.filter((p) => p.status === 'received').length;
  const lastArchiveDate = getLastArchiveDate();

  return (
    <header className="bg-brand text-white px-4 pt-12 pb-4 safe-top">
      <h1 className="text-lg font-bold">快递单号管理</h1>
      <p className="text-sm text-blue-100 mt-1">
        待收件 <span className="font-bold text-white">{pendingCount}</span> 件 · 已收到{' '}
        <span className="font-bold text-white">{receivedCount}</span> 件
        {filtering && totalCount > 0 && (
          <span className="text-blue-100 ml-1 text-xs">
            （共 {totalCount} 条结果）
          </span>
        )}
        {lastArchiveDate && (
          <span className="text-blue-100 ml-2 text-xs">
            · 归档: {lastArchiveDate}
          </span>
        )}
      </p>
    </header>
  );
}
