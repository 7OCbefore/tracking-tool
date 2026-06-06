import { useState, useRef, useCallback, useEffect } from 'react';
import { usePackageStore } from '@/stores/packageStore';
import type { DatePreset } from '@/types/package';

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'custom', label: '自定义' },
];

export default function FilterBar() {
  const filters = usePackageStore((s) => s.filters);
  const setFilter = usePackageStore((s) => s.setFilter);
  const clearFilters = usePackageStore((s) => s.clearFilters);

  const [expanded, setExpanded] = useState(false);
  const [customer, setCustomer] = useState(filters.customer);
  const [region, setRegion] = useState(filters.region);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
  const [dateTo, setDateTo] = useState(filters.dateTo || '');

  const customerTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const regionTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync local state when filters are cleared externally
  useEffect(() => {
    if (!filters.datePreset && !filters.customer && !filters.region) {
      setCustomer('');
      setRegion('');
      setDateFrom('');
      setDateTo('');
    }
  }, [filters]);

  const activeCount = [
    filters.datePreset,
    filters.customer,
    filters.region,
  ].filter(Boolean).length;

  const handleDatePreset = (preset: DatePreset) => {
    if (filters.datePreset === preset) {
      // Toggle off
      setFilter({ datePreset: null, dateFrom: null, dateTo: null });
      setDateFrom('');
      setDateTo('');
    } else {
      setFilter({ datePreset: preset, dateFrom: null, dateTo: null });
      if (preset !== 'custom') {
        setDateFrom('');
        setDateTo('');
      }
    }
  };

  const handleDateFromChange = useCallback((v: string) => {
    setDateFrom(v);
    setFilter({ dateFrom: v || null });
  }, [setFilter]);

  const handleDateToChange = useCallback((v: string) => {
    setDateTo(v);
    setFilter({ dateTo: v || null });
  }, [setFilter]);

  const handleCustomerChange = useCallback((v: string) => {
    setCustomer(v);
    clearTimeout(customerTimer.current);
    customerTimer.current = setTimeout(() => setFilter({ customer: v }), 400);
  }, [setFilter]);

  const handleRegionChange = useCallback((v: string) => {
    setRegion(v);
    clearTimeout(regionTimer.current);
    regionTimer.current = setTimeout(() => setFilter({ region: v }), 400);
  }, [setFilter]);

  const handleClear = () => {
    setCustomer('');
    setRegion('');
    setDateFrom('');
    setDateTo('');
    clearFilters();
    setExpanded(false);
  };

  return (
    <div className="px-4 py-2 bg-white border-b border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 text-sm font-medium transition-colors w-full
          ${activeCount > 0 ? 'text-brand' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        筛选
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold
                           text-white bg-brand rounded-full">
            {activeCount}
          </span>
        )}
        <svg
          className={`w-4 h-4 ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-slide-up">
          {/* Date Presets */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">日期范围</label>
            <div className="flex gap-2">
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleDatePreset(p.key)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${filters.datePreset === p.key
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.datePreset === 'custom' && (
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white"
              />
              <span className="text-gray-400 text-sm">至</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white"
              />
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">客户</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => handleCustomerChange(e.target.value)}
              placeholder="输入客户名称..."
              className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white
                         placeholder:text-gray-400"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">地区</label>
            <input
              type="text"
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              placeholder="输入地区..."
              className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white
                         placeholder:text-gray-400"
            />
          </div>

          {/* Clear */}
          {activeCount > 0 && (
            <button
              onClick={handleClear}
              className="w-full py-2 text-sm text-gray-500 bg-gray-100 rounded-lg
                         active:bg-gray-200 transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>
      )}
    </div>
  );
}
