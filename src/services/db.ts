import Dexie, { type EntityTable } from 'dexie';
import type { Package } from '@/types/package';

interface MetaEntry {
  key: string;
  value: unknown;
}

export class TrackingDB extends Dexie {
  packages!: EntityTable<Package, 'id'>;
  meta!: EntityTable<MetaEntry, 'key'>;

  constructor() {
    super('TrackingDB');
    this.version(1).stores({
      packages: 'id, status, isArchived, createdAt, trackingNumber',
      meta: 'key',
    });
  }
}

export const db = new TrackingDB();
