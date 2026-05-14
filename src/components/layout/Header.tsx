import { usePackageStore } from '@/stores/packageStore';

export default function Header() {
  const packages = usePackageStore((s) => s.packages);
  const totalCount = usePackageStore((s) => s.totalCount);
  const activeTab = usePackageStore((s) => s.activeTab);
  const pendingCount = activeTab === 'pending' ? totalCount : packages.filter((p) => p.status === 'pending').length;
  const receivedCount = activeTab === 'received' ? totalCount : packages.filter((p) => p.status === 'received').length;

  return (
    <header className="bg-brand text-white px-4 pt-12 pb-4 safe-top">
      <h1 className="text-lg font-bold">快递单号管理</h1>
      <p className="text-sm text-blue-100 mt-1">
        待收件 <span className="font-bold text-white">{pendingCount}</span> 件 · 已收到{' '}
        <span className="font-bold text-white">{receivedCount}</span> 件
      </p>
    </header>
  );
}
