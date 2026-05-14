import { useEffect, useCallback } from 'react';
import { usePackageStore } from '@/stores/packageStore';
import { useUIStore } from '@/stores/uiStore';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PackageCard from './PackageCard';
import EmptyState from './EmptyState';

const PAGE_SIZE = 20;

export default function PackageList() {
  const packages = usePackageStore((s) => s.packages);
  const totalCount = usePackageStore((s) => s.totalCount);
  const isLoading = usePackageStore((s) => s.isLoading);
  const currentPage = usePackageStore((s) => s.currentPage);
  const loadPage = usePackageStore((s) => s.loadPage);
  const batchMode = useUIStore((s) => s.batchMode);
  const selectedIds = useUIStore((s) => s.selectedIds);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const hasMore = packages.length < totalCount;

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPage(currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage, loadPage]);

  const lastRef = useInfiniteScroll(handleLoadMore, hasMore, isLoading);

  if (!isLoading && packages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {packages.map((pkg, i) => {
        const isLast = i === packages.length - 1;
        return (
          <div key={pkg.id} ref={isLast ? lastRef : null}>
            <PackageCard
              pkg={pkg}
              isBatchMode={batchMode}
              isSelected={selectedIds.has(pkg.id)}
            />
          </div>
        );
      })}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
