export type PackageStatus = 'pending' | 'received';

export interface Package {
  id: string;
  number: string;
  customer: string;
  region: string;
  notes: string;
  status: PackageStatus;
  isArchived: number;     // 0 = active, 1 = archived (number for IndexedDB index compatibility)
  createdAt: number;
  receivedAt?: number;
  archivedAt?: number;
}

export type PackageInput = Omit<Package, 'id' | 'createdAt' | 'status' | 'isArchived' | 'receivedAt' | 'archivedAt'>;

export type TabType = 'pending' | 'received';

export type Screen = 'list' | 'add' | 'detail' | 'scan';

export type ToastType = 'success' | 'error' | 'undo';

export type DatePreset = 'today' | 'week' | 'month' | 'custom';

export interface FilterState {
  datePreset: DatePreset | null;
  dateFrom: string | null;  // 'YYYY-MM-DD'
  dateTo: string | null;    // 'YYYY-MM-DD'
  customer: string;
  region: string;
}
