import { useState, useEffect, useRef } from 'react';
import { usePackageStore } from '@/stores/packageStore';

export default function SearchBar() {
  const setSearch = usePackageStore((s) => s.setSearch);
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSearch(v), 300);
  };

  const handleClear = () => {
    setValue('');
    setSearch('');
  };

  return (
    <div className="px-4 py-2 bg-white">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={handleChange}
          placeholder="搜索单号、快递公司、备注..."
          className="w-full pl-10 pr-8 py-2.5 bg-gray-100 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white
                     placeholder:text-gray-400"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="清除搜索"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
