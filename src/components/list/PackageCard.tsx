import type { Package } from '@/types/package';
import { useUIStore } from '@/stores/uiStore';
import { usePackageStore } from '@/stores/packageStore';
import { formatDate } from '@/utils/format';
import { highlightText } from '@/utils/highlight';

interface PackageCardProps {
  pkg: Package;
  isBatchMode: boolean;
  isSelected: boolean;
}

export default function PackageCard({ pkg, isBatchMode, isSelected }: PackageCardProps) {
  const navigate = useUIStore((s) => s.navigate);
  const toggleSelect = useUIStore((s) => s.toggleSelect);
  const toggleStatus = usePackageStore((s) => s.toggleStatus);
  const searchQuery = usePackageStore((s) => s.searchQuery);

  const isPending = pkg.status === 'pending';
  const statusColor = isPending ? 'border-l-orange-400' : 'border-l-green-400';
  const statusBadge = isPending
    ? 'bg-orange-100 text-orange-700'
    : 'bg-green-100 text-green-700';
  const statusText = isPending ? '待' : '收';

  const handleClick = () => {
    if (isBatchMode) {
      toggleSelect(pkg.id);
    } else {
      navigate('detail', { id: pkg.id });
    }
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) {
      toggleStatus(pkg.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative bg-white rounded-xl p-4 border-l-4 ${statusColor} shadow-sm
                  active:scale-[0.98] transition-transform cursor-pointer`}
    >
      {isBatchMode && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
            ${isSelected ? 'bg-brand border-brand' : 'border-gray-300'}`}>
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className={isBatchMode ? 'ml-8' : ''}>
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-base tracking-wider text-gray-900"
            dangerouslySetInnerHTML={{ __html: highlightText(pkg.number, searchQuery) }}
          />
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge}`}>
            {statusText}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          {pkg.customer && (
            <span className="text-xs text-brand bg-brand-light px-2 py-0.5 rounded">
              👤 <span dangerouslySetInnerHTML={{ __html: highlightText(pkg.customer, searchQuery) }} />
            </span>
          )}
          {pkg.region && (
            <span className="text-xs text-gray-400">
              📍 <span dangerouslySetInnerHTML={{ __html: highlightText(pkg.region, searchQuery) }} />
            </span>
          )}
          <span className="text-xs text-gray-400">{formatDate(pkg.createdAt)}</span>
        </div>

        {pkg.notes && (
          <p
            className="text-sm text-gray-500 mt-1.5 truncate"
            dangerouslySetInnerHTML={{ __html: highlightText(pkg.notes, searchQuery) }}
          />
        )}
      </div>

      {isPending && !isBatchMode && (
        <button
          onClick={handleToggleStatus}
          className="absolute top-3 right-3 w-7 h-7 rounded-full border-2 border-gray-300
                     flex items-center justify-center text-gray-300 hover:border-green-400
                     hover:text-green-400 active:bg-green-50 transition-colors"
          aria-label="标记已收到"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {pkg.receivedAt && (
        <p className="text-xs text-gray-400 mt-2">
          签收于 {formatDate(pkg.receivedAt)}
        </p>
      )}
    </div>
  );
}
