import { usePackageStore } from '@/stores/packageStore';
import type { TabType } from '@/types/package';

const TABS: { key: TabType; label: string }[] = [
  { key: 'pending', label: '待收件' },
  { key: 'received', label: '已收到' },
];

export default function TabBar() {
  const activeTab = usePackageStore((s) => s.activeTab);
  const setTab = usePackageStore((s) => s.setTab);

  return (
    <nav className="flex border-b border-gray-200 bg-white">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setTab(tab.key)}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors relative
            ${activeTab === tab.key
              ? 'text-brand'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
}
