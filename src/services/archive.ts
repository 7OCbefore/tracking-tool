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
    isArchived: true,
    archivedAt: Date.now(),
  });
}

export async function restorePackage(id: string): Promise<void> {
  await db.packages.update(id, {
    isArchived: false,
    archivedAt: undefined,
  });
}
