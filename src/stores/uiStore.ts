import { create } from 'zustand';
import type { Screen, ToastType } from '@/types/package';

interface UIState {
  currentScreen: Screen;
  batchMode: boolean;
  selectedIds: Set<string>;
  detailId: string | null;
  toastMessage: string | null;
  toastType: ToastType;
  toastUndoAction: (() => void) | null;
  searchToAdd: string | null;
  scanMode: 'match' | 'add';

  navigate: (screen: Screen, params?: { id?: string }) => void;
  goBack: () => void;
  toggleBatchMode: () => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  showToast: (message: string, type: ToastType, undoAction?: () => void) => void;
  hideToast: () => void;
  setSearchToAdd: (query: string | null) => void;
  setScanMode: (mode: 'match' | 'add') => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'list',
  batchMode: false,
  selectedIds: new Set(),
  detailId: null,
  toastMessage: null,
  toastType: 'success',
  toastUndoAction: null,
  searchToAdd: null,

  scanMode: 'match',

  navigate: (screen, params) => {
    set((state) => ({
      currentScreen: screen,
      detailId: params?.id ?? null,
      batchMode: false,
      selectedIds: new Set(),
      scanMode: screen === 'scan' ? state.scanMode : 'match',
    }));
  },

  goBack: () => {
    set({
      currentScreen: 'list',
      detailId: null,
      batchMode: false,
      selectedIds: new Set(),
      scanMode: 'match',
    });
  },

  toggleBatchMode: () => {
    set((state) => ({
      batchMode: !state.batchMode,
      selectedIds: new Set(),
    }));
  },

  toggleSelect: (id) => {
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    });
  },

  selectAll: (ids) => {
    set({ selectedIds: new Set(ids) });
  },

  clearSelection: () => {
    set({ selectedIds: new Set() });
  },

  showToast: (message, type, undoAction) => {
    set({ toastMessage: message, toastType: type, toastUndoAction: undoAction ?? null });
  },

  hideToast: () => {
    set({ toastMessage: null, toastUndoAction: null });
  },

  setSearchToAdd: (query) => set({ searchToAdd: query }),
  setScanMode: (mode) => set({ scanMode: mode }),
}));
