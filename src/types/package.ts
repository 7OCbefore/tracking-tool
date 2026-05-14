export type PackageStatus = 'pending' | 'received';

export interface Package {
  id: string;
  trackingNumber: string;
  company: string;
  remark: string;
  status: PackageStatus;
  isArchived: boolean;
  createdAt: number;
  receivedAt?: number;
  archivedAt?: number;
}

export type PackageInput = Omit<Package, 'id' | 'createdAt' | 'status' | 'isArchived'>;

export type TabType = 'pending' | 'received';

export type Screen = 'list' | 'add' | 'detail' | 'scan';

export type ToastType = 'success' | 'error' | 'undo';
