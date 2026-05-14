import { create } from 'zustand';
import { db } from '@/services/db';
import type { Package, PackageInput, TabType } from '@/types/package';

const PAGE_SIZE = 20;

interface PackageState {
  packages: Package[];
  totalCount: number;
  activeTab: TabType;
  searchQuery: string;
  isLoading: boolean;
  currentPage: number;

  loadPage: (page?: number) => Promise<void>;
  setTab: (tab: TabType) => Promise<void>;
  setSearch: (query: string) => Promise<void>;
  add: (input: PackageInput) => Promise<string>;
  update: (id: string, data: Partial<Package>) => Promise<void>;
  remove: (id: string | string[]) => Promise<Package[]>;
  toggleStatus: (id: string) => Promise<void>;
  batchMarkReceived: (ids: string[]) => Promise<void>;
  importCSV: (records: PackageInput[]) => Promise<number>;
  exportCSV: () => void;
  archive: (id: string) => Promise<void>;
}

function createPackage(input: PackageInput): Package {
  return {
    ...input,
    id: crypto.randomUUID(),
    status: 'pending',
    isArchived: false,
    createdAt: Date.now(),
  };
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  totalCount: 0,
  activeTab: 'pending',
  searchQuery: '',
  isLoading: false,
  currentPage: 1,

  loadPage: async (page = 1) => {
    const { activeTab, searchQuery } = get();
    set({ isLoading: true });

    let collection = db.packages
      .where('isArchived').equals(0)
      .filter((p) => p.status === activeTab);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      collection = collection.filter(
        (p) =>
          p.trackingNumber.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.remark.toLowerCase().includes(q),
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
        .where('trackingNumber')
        .equals(record.trackingNumber)
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
    // CSV download handled in service layer - will be wired in Phase 5
    const { packages } = get();
    if (typeof window !== 'undefined') {
      import('@/services/csv').then(({ downloadCSV }) => downloadCSV(packages));
    }
  },

  archive: async (id) => {
    await db.packages.update(id, { isArchived: true, archivedAt: Date.now() });
    await get().loadPage();
  },
}));
