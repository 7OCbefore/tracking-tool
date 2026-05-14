import { db } from './db';
import type { Package } from '@/types/package';

export async function getArchivedPackages(
  page = 1,
  pageSize = 20,
): Promise<{ packages: Package[]; total: number }> {
  const collection = db.packages.where('isArchived').equals(1);
  const total = await collection.count();
  const packages = await collection
    .reverse()
    .sortBy('archivedAt')
    .then((all) => all.slice((page - 1) * pageSize, page * pageSize));

  return { packages, total };
}

export async function archivePackage(id: string): Promise<void> {
  await db.packages.update(id, {
    isArchived: 1,
    archivedAt: Date.now(),
  });
}

export async function restorePackage(id: string): Promise<void> {
  await db.packages.update(id, {
    isArchived: 0,
    archivedAt: undefined,
  });
}

export function getLastArchiveDate(): string | null {
  try {
    return localStorage.getItem('tracking_last_archive_date');
  } catch {
    return null;
  }
}

export function setLastArchiveDate(date: string): void {
  try {
    localStorage.setItem('tracking_last_archive_date', date);
  } catch {}
}

export async function archiveAllPackages(packages: Package[]): Promise<void> {
  // Export to CSV
  const { exportToCSV } = await import('./csv');
  const csv = exportToCSV(packages);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `快递记录_归档_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  // Clear all data
  const { db } = await import('./db');
  await db.packages.clear();

  // Record archive date
  setLastArchiveDate(dateStr);
}
