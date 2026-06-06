import { create } from 'zustand';
import { db } from '@/services/db';
import type { Package, PackageInput, TabType, FilterState, DatePreset } from '@/types/package';

const PAGE_SIZE = 20;

function datePresetToRange(preset: DatePreset): { from: number; to: number } {
  const now = new Date();
  const to = now.getTime();
  let from: number;
  switch (preset) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      from = start.getTime();
      break;
    }
    case 'week': {
      const day = now.getDay();
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1));
      from = monday.getTime();
      break;
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      from = first.getTime();
      break;
    }
    case 'custom':
      return { from: 0, to: Infinity };
  }
  return { from, to };
}

function hasActiveFilters(f: FilterState): boolean {
  return !!(f.datePreset || f.customer || f.region);
}

interface PackageState {
  packages: Package[];
  totalCount: number;
  activeTab: TabType;
  searchQuery: string;
  isLoading: boolean;
  currentPage: number;
  filters: FilterState;

  loadPage: (page?: number) => Promise<void>;
  setTab: (tab: TabType) => Promise<void>;
  setSearch: (query: string) => Promise<void>;
  setFilter: (partial: Partial<FilterState>) => void;
  clearFilters: () => void;
  add: (input: PackageInput) => Promise<string>;
  update: (id: string, data: Partial<Package>) => Promise<void>;
  remove: (id: string | string[]) => Promise<Package[]>;
  toggleStatus: (id: string) => Promise<void>;
  batchMarkReceived: (ids: string[]) => Promise<void>;
  importCSV: (records: PackageInput[]) => Promise<number>;
  exportCSV: () => void;
  archive: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

function createPackage(input: PackageInput): Package {
  return {
    ...input,
    id: crypto.randomUUID(),
    status: 'pending',
    isArchived: 0,
    createdAt: Date.now(),
    notes: input.notes || '',
    customer: input.customer || '',
    region: input.region || '',
  };
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  totalCount: 0,
  activeTab: 'pending',
  searchQuery: '',
  isLoading: false,
  currentPage: 1,
  filters: {
    datePreset: null,
    dateFrom: null,
    dateTo: null,
    customer: '',
    region: '',
  },

  loadPage: async (page = 1) => {
    const { activeTab, searchQuery, filters } = get();
    set({ isLoading: true });

    const filtering = hasActiveFilters(filters);

    let collection = db.packages.where('isArchived').equals(0);

    // When filters are active, show both pending + received (ignore tab)
    if (!filtering) {
      collection = collection.filter((p) => p.status === activeTab);
    }

    // Apply date filter
    if (filters.datePreset && filters.datePreset !== 'custom') {
      const { from, to } = datePresetToRange(filters.datePreset);
      collection = collection.filter((p) => p.createdAt >= from && p.createdAt <= to);
    } else if (filters.datePreset === 'custom') {
      if (filters.dateFrom) {
        const fromTs = new Date(filters.dateFrom + 'T00:00:00').getTime();
        collection = collection.filter((p) => p.createdAt >= fromTs);
      }
      if (filters.dateTo) {
        const toTs = new Date(filters.dateTo + 'T23:59:59.999').getTime();
        collection = collection.filter((p) => p.createdAt <= toTs);
      }
    }

    // Apply customer filter
    if (filters.customer) {
      const cq = filters.customer.toLowerCase();
      collection = collection.filter((p) => (p.customer || '').toLowerCase().includes(cq));
    }

    // Apply region filter
    if (filters.region) {
      const rq = filters.region.toLowerCase();
      collection = collection.filter((p) => (p.region || '').toLowerCase().includes(rq));
    }

    // Apply text search (on top of filters)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      collection = collection.filter(
        (p) =>
          (p.number || '').toLowerCase().includes(q) ||
          (p.customer || '').toLowerCase().includes(q) ||
          (p.region || '').toLowerCase().includes(q) ||
          (p.notes || '').toLowerCase().includes(q),
      );
    }

    const totalCount = await collection.count();
    const packages = await collection
      .reverse()
      .sortBy('createdAt')
      .then((all) => all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

    set({ packages, totalCount, isLoading: false, currentPage: page });
  },

  setTab: async (tab) => {
    set({ activeTab: tab, currentPage: 1 });
    await get().loadPage(1);
  },

  setSearch: async (query) => {
    set({ searchQuery: query, currentPage: 1 });
    await get().loadPage(1);
  },

  setFilter: (partial) => {
    set((state) => ({
      filters: { ...state.filters, ...partial },
      currentPage: 1,
    }));
    // Auto-apply filters (debounced at component level for text inputs)
    setTimeout(() => get().loadPage(1), 0);
  },

  clearFilters: () => {
    set({
      filters: { datePreset: null, dateFrom: null, dateTo: null, customer: '', region: '' },
      currentPage: 1,
    });
    get().loadPage(1);
  },

  add: async (input) => {
    const pkg = createPackage(input);
    await db.packages.add(pkg);
    await get().loadPage();
    return pkg.id;
  },

  update: async (id, data) => {
    await db.packages.update(id, { ...data });
    set((state) => ({
      packages: state.packages.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  remove: async (id) => {
    const ids = Array.isArray(id) ? id : [id];
    const removed = await db.packages.bulkGet(ids);
    const valid = removed.filter(Boolean) as Package[];
    await db.packages.bulkDelete(ids);
    await get().loadPage();
    return valid;
  },

  toggleStatus: async (id) => {
    const pkg = await db.packages.get(id);
    if (!pkg) return;
    const newStatus: Package['status'] = pkg.status === 'pending' ? 'received' : 'pending';
    await db.packages.update(id, {
      status: newStatus,
      receivedAt: newStatus === 'received' ? Date.now() : undefined,
    });
    await get().loadPage();
  },

  batchMarkReceived: async (ids) => {
    await db.packages.bulkUpdate(
      ids.map((id) => ({
        key: id,
        changes: { status: 'received' as const, receivedAt: Date.now() },
      })),
    );
    await get().loadPage();
  },

  importCSV: async (records) => {
    let imported = 0;
    for (const record of records) {
      const pkg = createPackage(record);
      const existing = await db.packages
        .where('number')
        .equals(record.number)
        .first();
      if (!existing) {
        await db.packages.add(pkg);
        imported++;
      }
    }
    await get().loadPage();
    return imported;
  },

  exportCSV: () => {
    const { packages } = get();
    if (packages.length === 0) return;
    import('@/services/csv').then(({ downloadCSV }) => downloadCSV(packages));
  },

  archive: async (id) => {
    await db.packages.update(id, { isArchived: 1, archivedAt: Date.now() });
    await get().loadPage();
  },

  clearAll: async () => {
    await db.packages.clear();
    set({
      packages: [],
      totalCount: 0,
      currentPage: 1,
      filters: { datePreset: null, dateFrom: null, dateTo: null, customer: '', region: '' },
    });
  },
}));
