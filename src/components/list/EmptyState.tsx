import { usePackageStore } from '@/stores/packageStore';
import { useUIStore } from '@/stores/uiStore';

export default function EmptyState() {
  const activeTab = usePackageStore((s) => s.activeTab);
  const searchQuery = usePackageStore((s) => s.searchQuery);
  const navigate = useUIStore((s) => s.navigate);
  const setSearchToAdd = useUIStore((s) => s.setSearchToAdd);

  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-sm">没有匹配的记录</p>
        <p className="text-xs mt-1 text-gray-300">关键词：{searchQuery}</p>
        <button
          onClick={() => { setSearchToAdd(searchQuery); navigate('add'); }}
          className="mt-4 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-medium
                     active:bg-blue-700 transition-colors"
        >
          添加此单号？
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-sm">
        {activeTab === 'pending' ? '暂无待收件快递' : '暂无已收件快递'}
      </p>
      <p className="text-xs mt-1 text-gray-300">点击右下角 + 添加</p>
    </div>
  );
}
