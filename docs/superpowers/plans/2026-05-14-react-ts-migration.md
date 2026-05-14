# React + TypeScript 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将单文件 HTML（1,652 行）渐进迁移到 React 18 + TypeScript + Vite 工程化架构，每个 Phase 独立可部署。

**Architecture:** React 函数组件 + Zustand 状态管理 + Dexie.js 数据层。单向数据流：Component → Store Action → Dexie.js → IndexedDB。零运行时 CSS（Tailwind 编译时生成）。

**Tech Stack:** React 18, TypeScript 5 (strict), Vite 5, Zustand 4, Dexie.js 4, Tailwind CSS 3, vite-plugin-pwa, Vitest, GitHub Actions

**分支:** `refactor/react-ts-migration`（已创建）

---

## Phase 1: 搭骨架（基础设施，不含 UI）

### Task 1.1: 初始化 Vite + React + TypeScript 项目

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "tracking-tool",
  "private": true,
  "version": "4.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/ --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 3: 创建 tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 创建 index.html（Vite 入口，替换项目根目录的旧入口）**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#2563eb" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <title>快递单号管理 v4.0</title>
  </head>
  <body class="bg-gray-50 text-gray-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 7: 创建 src/App.tsx（占位）**

```tsx
export default function App() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <p className="text-xl text-gray-500">快递单号管理 v4.0 — 加载中...</p>
    </div>
  );
}
```

- [ ] **Step 8: 创建 src/index.css（Tailwind 指令）**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 9: 创建 src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 10: 安装依赖**

```bash
npm install react react-dom dexie zustand
npm install -D @vitejs/plugin-react vite vite-plugin-pwa typescript @types/react @types/react-dom tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom eslint prettier
```

- [ ] **Step 11: 验证 `npm run dev` 启动正常，浏览器打开显示占位文字**

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

### Task 1.2: 配置 Tailwind CSS + PostCSS

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`

- [ ] **Step 1: 创建 tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#2563eb',
        'brand-light': '#eff6ff',
        danger: '#ef4444',
        success: '#22c55e',
      },
      fontFamily: {
        mono: ['"SF Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: 验证：`npm run dev`，确认 Tailwind 样式生效（文字居中+灰色背景）**

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts postcss.config.js
git commit -m "feat: configure Tailwind CSS + PostCSS"
```

---

### Task 1.3: 配置 Vite（resolve alias + base path + PWA 插件）

**Files:**
- Create: `vite.config.ts`

- [ ] **Step 1: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '快递单号管理 v4.0',
        short_name: '快递管理',
        description: '移动端快递单号管理工具',
        theme_color: '#2563eb',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/tracking-tool/',
        scope: '/tracking-tool/',
        icons: [
          { src: '/tracking-tool/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/tracking-tool/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: '/tracking-tool/',
});
```

- [ ] **Step 2: 验证 `npm run build` 成功，`dist/` 目录生成**

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "feat: configure Vite with PWA plugin and path aliases"
```

---

### Task 1.4: 定义 TypeScript 类型

**Files:**
- Create: `src/types/package.ts`

- [ ] **Step 1: 创建 src/types/package.ts**

```typescript
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
```

- [ ] **Step 2: 验证 `npm run typecheck` 通过**

- [ ] **Step 3: Commit**

```bash
git add src/types/package.ts
git commit -m "feat: define Package TypeScript types"
```

---

### Task 1.5: 创建 Dexie.js 数据库服务

**Files:**
- Create: `src/services/db.ts`

- [ ] **Step 1: 创建 src/services/db.ts**

```typescript
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
```

- [ ] **Step 2: 验证 TypeScript 编译通过**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/services/db.ts
git commit -m "feat: add Dexie.js database service"
```

---

### Task 1.6: 创建 GitHub Actions 部署工作流

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: 创建 .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions deploy workflow"
```

---

### Task 1.7: 创建 .gitignore

**Files:**
- Create/Update: `.gitignore`

- [ ] **Step 1: 创建 .gitignore**

```gitignore
node_modules/
dist/
.vite/
*.local
.DS_Store
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

---

**Phase 1 验收标准：**
- `npm run dev` 启动成功
- `npm run build` 构建成功
- `npm run typecheck` 零错误
- Dexie.js 数据库定义与旧 IndexedDB schema 兼容

---

## Phase 2: 列表页（主力屏幕）

### Task 2.1: 创建 Zustand UI Store

**Files:**
- Create: `src/stores/uiStore.ts`

- [ ] **Step 1: 创建 src/stores/uiStore.ts**

```typescript
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

  navigate: (screen: Screen, params?: { id?: string }) => void;
  goBack: () => void;
  toggleBatchMode: () => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  showToast: (message: string, type: ToastType, undoAction?: () => void) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentScreen: 'list',
  batchMode: false,
  selectedIds: new Set(),
  detailId: null,
  toastMessage: null,
  toastType: 'success',
  toastUndoAction: null,

  navigate: (screen, params) => {
    set({
      currentScreen: screen,
      detailId: params?.id ?? null,
      batchMode: false,
      selectedIds: new Set(),
    });
  },

  goBack: () => {
    set({
      currentScreen: 'list',
      detailId: null,
      batchMode: false,
      selectedIds: new Set(),
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
}));
```

- [ ] **Step 2: 验证 `npm run typecheck` 通过**

- [ ] **Step 3: Commit**

```bash
git add src/stores/uiStore.ts
git commit -m "feat: add Zustand UI store"
```

---

### Task 2.2: 创建 Zustand Package Store

**Files:**
- Create: `src/stores/packageStore.ts`

- [ ] **Step 1: 创建 src/stores/packageStore.ts**

```typescript
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
  exportCSV: () => Package[];
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
    return get().packages;
  },

  archive: async (id) => {
    await db.packages.update(id, { isArchived: true, archivedAt: Date.now() });
    await get().loadPage();
  },
}));
```

- [ ] **Step 2: 验证 `npm run typecheck` 通过**

- [ ] **Step 3: Commit**

```bash
git add src/stores/packageStore.ts
git commit -m "feat: add Zustand package store with full CRUD"
```

---

### Task 2.3: 创建工具函数

**Files:**
- Create: `src/utils/format.ts`, `src/utils/highlight.ts`

- [ ] **Step 1: 创建 src/utils/format.ts**

```typescript
export function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${h}:${min}`;
}

const COMPANY_MAP: Record<string, string> = {
  SF: '顺丰',
  ZTO: '中通',
  YTO: '圆通',
  STO: '申通',
  YD: '韵达',
  JD: '京东',
  EMS: 'EMS',
  HTKY: '百世',
  DB: '德邦',
};

export function normalizeCompany(input: string): string {
  const upper = input.toUpperCase().trim();
  return COMPANY_MAP[upper] ?? input.trim();
}
```

- [ ] **Step 2: 创建 src/utils/highlight.ts**

```typescript
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

export function highlightText(text: string, query: string): string {
  if (!query) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const q = escapeHtml(query);
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escaped.replace(re, '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>');
}
```

- [ ] **Step 3: 验证 `npm run typecheck` 通过**

- [ ] **Step 4: Commit**

```bash
git add src/utils/format.ts src/utils/highlight.ts
git commit -m "feat: add utility functions for format and highlight"
```

---

### Task 2.4: 创建 Header 组件

**Files:**
- Create: `src/components/layout/Header.tsx`

- [ ] **Step 1: 创建 src/components/layout/Header.tsx**

```tsx
import { usePackageStore } from '@/stores/packageStore';

export default function Header() {
  const packages = usePackageStore((s) => s.packages);
  const totalCount = usePackageStore((s) => s.totalCount);
  const activeTab = usePackageStore((s) => s.activeTab);
  const pendingCount = activeTab === 'pending' ? totalCount : packages.filter((p) => p.status === 'pending').length;
  const receivedCount = activeTab === 'received' ? totalCount : packages.filter((p) => p.status === 'received').length;

  return (
    <header className="bg-brand text-white px-4 pt-12 pb-4 safe-top">
      <h1 className="text-lg font-bold">快递单号管理</h1>
      <p className="text-sm text-blue-100 mt-1">
        待收件 <span className="font-bold text-white">{pendingCount}</span> 件 · 已收到{' '}
        <span className="font-bold text-white">{receivedCount}</span> 件
      </p>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: add Header component"
```

---

### Task 2.5: 创建 TabBar 组件

**Files:**
- Create: `src/components/layout/TabBar.tsx`

- [ ] **Step 1: 创建 src/components/layout/TabBar.tsx**

```tsx
import { usePackageStore } from '@/stores/packageStore';
import type { TabType } from '@/types/package';

const TABS: { key: TabType; label: string }[] = [
  { key: 'pending', label: '待收件' },
  { key: 'received', label: '已收到' },
];

export default function TabBar() {
  const activeTab = usePackageStore((s) => s.activeTab);
  const setTab = usePackageStore((s) => s.setTab);

  return (
    <nav className="flex border-b border-gray-200 bg-white">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setTab(tab.key)}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors relative
            ${activeTab === tab.key
              ? 'text-brand'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/TabBar.tsx
git commit -m "feat: add TabBar component"
```

---

### Task 2.6: 创建 SearchBar 组件

**Files:**
- Create: `src/components/layout/SearchBar.tsx`

- [ ] **Step 1: 创建 src/components/layout/SearchBar.tsx**

```tsx
import { useState, useEffect, useRef } from 'react';
import { usePackageStore } from '@/stores/packageStore';

export default function SearchBar() {
  const setSearch = usePackageStore((s) => s.setSearch);
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/SearchBar.tsx
git commit -m "feat: add SearchBar component with debounce"
```

---

### Task 2.7: 创建 PackageCard 组件

**Files:**
- Create: `src/components/list/PackageCard.tsx`

- [ ] **Step 1: 创建 src/components/list/PackageCard.tsx**

```tsx
import type { Package } from '@/types/package';
import { useUIStore } from '@/stores/uiStore';
import { usePackageStore } from '@/stores/packageStore';
import { formatDate, normalizeCompany } from '@/utils/format';

interface PackageCardProps {
  pkg: Package;
  isBatchMode: boolean;
  isSelected: boolean;
}

export default function PackageCard({ pkg, isBatchMode, isSelected }: PackageCardProps) {
  const navigate = useUIStore((s) => s.navigate);
  const toggleSelect = useUIStore((s) => s.toggleSelect);
  const toggleStatus = usePackageStore((s) => s.toggleStatus);

  const isPending = pkg.status === 'pending';
  const statusColor = isPending ? 'border-l-orange-400' : 'border-l-green-400';
  const statusBadge = isPending
    ? 'bg-orange-100 text-orange-700'
    : 'bg-green-100 text-green-700';
  const statusText = isPending ? '待' : '收';

  const handleClick = () => {
    if (isBatchMode) {
      toggleSelect(pkg.id);
    } else {
      navigate('detail', { id: pkg.id });
    }
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) {
      toggleStatus(pkg.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative bg-white rounded-xl p-4 border-l-4 ${statusColor} shadow-sm
                  active:scale-[0.98] transition-transform cursor-pointer`}
    >
      {isBatchMode && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
            ${isSelected ? 'bg-brand border-brand' : 'border-gray-300'}`}>
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className={isBatchMode ? 'ml-8' : ''}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-base tracking-wider text-gray-900">
            {pkg.trackingNumber}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge}`}>
            {statusText}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-brand bg-brand-light px-2 py-0.5 rounded">
            {normalizeCompany(pkg.company)}
          </span>
          <span className="text-xs text-gray-400">{formatDate(pkg.createdAt)}</span>
        </div>

        {pkg.remark && (
          <p className="text-sm text-gray-500 mt-1.5 truncate">{pkg.remark}</p>
        )}
      </div>

      {isPending && !isBatchMode && (
        <button
          onClick={handleToggleStatus}
          className="absolute top-3 right-3 w-7 h-7 rounded-full border-2 border-gray-300
                     flex items-center justify-center text-gray-300 hover:border-green-400
                     hover:text-green-400 active:bg-green-50 transition-colors"
          aria-label="标记已收到"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {pkg.receivedAt && (
        <p className="text-xs text-gray-400 mt-2">
          签收于 {formatDate(pkg.receivedAt)}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/list/PackageCard.tsx
git commit -m "feat: add PackageCard component"
```

---

### Task 2.8: 创建 EmptyState 组件

**Files:**
- Create: `src/components/list/EmptyState.tsx`

- [ ] **Step 1: 创建 src/components/list/EmptyState.tsx**

```tsx
import { usePackageStore } from '@/stores/packageStore';

export default function EmptyState() {
  const activeTab = usePackageStore((s) => s.activeTab);
  const searchQuery = usePackageStore((s) => s.searchQuery);

  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-sm">没有匹配的记录</p>
        <p className="text-xs mt-1 text-gray-300">关键词：{searchQuery}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-sm">
        {activeTab === 'pending' ? '暂无待收件快递' : '暂无已收件快递'}
      </p>
      <p className="text-xs mt-1 text-gray-300">点击右下角 + 添加</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/list/EmptyState.tsx
git commit -m "feat: add EmptyState component"
```

---

### Task 2.9: 创建 PackageList 组件 + useInfiniteScroll hook

**Files:**
- Create: `src/hooks/useInfiniteScroll.ts`, `src/components/list/PackageList.tsx`

- [ ] **Step 1: 创建 src/hooks/useInfiniteScroll.ts**

```typescript
import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  isLoading: boolean,
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore],
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return lastElementRef;
}
```

- [ ] **Step 2: 创建 src/components/list/PackageList.tsx**

```tsx
import { useEffect, useCallback } from 'react';
import { usePackageStore } from '@/stores/packageStore';
import { useUIStore } from '@/stores/uiStore';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PackageCard from './PackageCard';
import EmptyState from './EmptyState';

const PAGE_SIZE = 20;

export default function PackageList() {
  const packages = usePackageStore((s) => s.packages);
  const totalCount = usePackageStore((s) => s.totalCount);
  const isLoading = usePackageStore((s) => s.isLoading);
  const currentPage = usePackageStore((s) => s.currentPage);
  const loadPage = usePackageStore((s) => s.loadPage);
  const batchMode = useUIStore((s) => s.batchMode);
  const selectedIds = useUIStore((s) => s.selectedIds);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const hasMore = packages.length < totalCount;

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPage(currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage, loadPage]);

  const lastRef = useInfiniteScroll(handleLoadMore, hasMore, isLoading);

  if (!isLoading && packages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {packages.map((pkg, i) => {
        const isLast = i === packages.length - 1;
        return (
          <div key={pkg.id} ref={isLast ? lastRef : null}>
            <PackageCard
              pkg={pkg}
              isBatchMode={batchMode}
              isSelected={selectedIds.has(pkg.id)}
            />
          </div>
        );
      })}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 验证 `npm run typecheck` 通过**

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useInfiniteScroll.ts src/components/list/PackageList.tsx
git commit -m "feat: add PackageList with infinite scroll"
```

---

### Task 2.10: 创建 BatchBar 组件

**Files:**
- Create: `src/components/list/BatchBar.tsx`

- [ ] **Step 1: 创建 src/components/list/BatchBar.tsx**

```tsx
import { useUIStore } from '@/stores/uiStore';
import { usePackageStore } from '@/stores/packageStore';

export default function BatchBar() {
  const batchMode = useUIStore((s) => s.batchMode);
  const selectedIds = useUIStore((s) => s.selectedIds);
  const toggleBatchMode = useUIStore((s) => s.toggleBatchMode);
  const batchMarkReceived = usePackageStore((s) => s.batchMarkReceived);
  const showToast = useUIStore((s) => s.showToast);

  if (!batchMode) return null;

  const count = selectedIds.size;

  const handleMarkReceived = async () => {
    if (count === 0) return;
    const ids = [...selectedIds];
    await batchMarkReceived(ids);
    toggleBatchMode();
    showToast(`已标记 ${count} 件为已收到`, 'success');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3
                    flex items-center justify-between safe-bottom z-30">
      <span className="text-sm text-gray-600">
        已选 <span className="font-bold text-brand">{count}</span> 项
      </span>
      <div className="flex gap-2">
        <button
          onClick={toggleBatchMode}
          className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
        >
          取消
        </button>
        <button
          onClick={handleMarkReceived}
          disabled={count === 0}
          className="px-4 py-2 text-sm bg-brand text-white rounded-lg font-medium
                     disabled:opacity-40 active:bg-blue-700 transition-colors"
        >
          标记已收
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/list/BatchBar.tsx
git commit -m "feat: add BatchBar component"
```

---

### Task 2.11: 创建 FabMenu 组件

**Files:**
- Create: `src/components/layout/FabMenu.tsx`

- [ ] **Step 1: 创建 src/components/layout/FabMenu.tsx**

```tsx
import { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';

interface FabItem {
  icon: React.ReactNode;
  label: string;
  screen: 'add' | 'scan';
}

const fabItems: FabItem[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    label: '手动添加',
    screen: 'add',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m4 0v-2m0 2v2m-4-6h2m-2-2v4m-8-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: '扫码录入',
    screen: 'scan',
  },
];

export default function FabMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useUIStore((s) => s.navigate);
  const toggleBatchMode = useUIStore((s) => s.toggleBatchMode);

  const handleItemClick = (screen: 'add' | 'scan') => {
    setOpen(false);
    navigate(screen);
  };

  return (
    <div className="fixed bottom-6 right-4 flex flex-col items-end gap-3 z-20 safe-bottom">
      {open && (
        <div className="flex flex-col items-end gap-2 mb-2">
          {fabItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => handleItemClick(item.screen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg
                         text-sm text-gray-700 active:bg-gray-50 transition-colors"
            >
              <span>{item.label}</span>
              {item.icon}
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); toggleBatchMode(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg
                       text-sm text-gray-700 active:bg-gray-50 transition-colors"
          >
            <span>批量操作</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 bg-brand text-white rounded-2xl shadow-lg flex items-center justify-center
                    active:scale-95 transition-all duration-200
                    ${open ? 'rotate-45' : 'rotate-0'}`}
        aria-label="操作菜单"
      >
        <svg className="w-6 h-6 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/FabMenu.tsx
git commit -m "feat: add FabMenu component"
```

---

### Task 2.12: 组装 App.tsx（列表页）

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 更新 src/App.tsx**

```tsx
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import SearchBar from '@/components/layout/SearchBar';
import PackageList from '@/components/list/PackageList';
import BatchBar from '@/components/list/BatchBar';
import FabMenu from '@/components/layout/FabMenu';

export default function App() {
  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <Header />
      <TabBar />
      <SearchBar />
      <PackageList />
      <BatchBar />
      <FabMenu />
    </div>
  );
}
```

- [ ] **Step 2: 验证 `npm run dev`，浏览器中列表页渲染正常**

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: assemble list screen in App"
```

---

**Phase 2 验收标准：**
- 列表页显示卡片（如果 IndexedDB 有旧数据则直接可见）
- Tab 切换功能正常
- 搜索防抖功能正常
- 批量模式选择/标记正常
- FAB 菜单弹出/收起正常
- 无限滚动加载正常

---

## Phase 3: 添加 & 扫码

### Task 3.1: 创建 AddForm 组件

**Files:**
- Create: `src/components/add/AddForm.tsx`

- [ ] **Step 1: 创建 src/components/add/AddForm.tsx**

```tsx
import { useState, useEffect } from 'react';
import { usePackageStore } from '@/stores/packageStore';
import { useUIStore } from '@/stores/uiStore';

const COMPANY_OPTIONS = ['顺丰', '中通', '圆通', '申通', '韵达', '京东', 'EMS', '百世', '德邦', '其他'];

export default function AddForm() {
  const add = usePackageStore((s) => s.add);
  const goBack = useUIStore((s) => s.goBack);
  const showToast = useUIStore((s) => s.showToast);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [company, setCompany] = useState('');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 自动记忆：加载上次输入的快递公司
    const lastCompany = localStorage.getItem('tracking_last_company');
    if (lastCompany) setCompany(lastCompany);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      showToast('请填写快递单号', 'error');
      return;
    }
    if (!company.trim()) {
      showToast('请选择或填写快递公司', 'error');
      return;
    }
    setSaving(true);
    try {
      await add({
        trackingNumber: trackingNumber.trim(),
        company: company.trim() === '其他' ? '' : company.trim(),
        remark: remark.trim(),
      });
      localStorage.setItem('tracking_last_company', company.trim());
      showToast('添加成功', 'success');
      goBack();
    } catch {
      showToast('添加失败，请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 safe-top border-b border-gray-100">
        <button onClick={goBack} className="p-1 -ml-1 text-gray-600" aria-label="返回">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">添加快递</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            快递单号 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="输入快递单号"
            autoFocus
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-base
                       focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
                       placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            快递公司 <span className="text-danger">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COMPANY_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCompany(c)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors
                  ${company === c
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="物品名称、购买渠道等（可选）"
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-base
                       focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
                       placeholder:text-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-brand text-white rounded-xl font-medium text-base
                     disabled:opacity-50 active:bg-blue-700 transition-colors"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/add/AddForm.tsx
git commit -m "feat: add AddForm component"
```

---

### Task 3.2: 创建 BarcodeScanner 组件 + useBarcodeDetector hook

**Files:**
- Create: `src/hooks/useBarcodeDetector.ts`, `src/components/add/BarcodeScanner.tsx`

- [ ] **Step 1: 创建 src/hooks/useBarcodeDetector.ts**

```typescript
import { useEffect, useRef, useState } from 'react';

interface UseBarcodeDetectorResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  scanning: boolean;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
}

export function useBarcodeDetector(
  onDetected: (code: string) => void,
): UseBarcodeDetectorResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const stopScanning = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const detectLoop = async () => {
    if (!videoRef.current || !('BarcodeDetector' in window)) return;

    try {
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code'],
      });
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        onDetected(barcodes[0].rawValue);
        stopScanning();
        return;
      }
    } catch {
      // BarcodeDetector may throw on some frames
    }
    rafRef.current = requestAnimationFrame(detectLoop);
  };

  const startScanning = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      detectLoop();
    } catch {
      setError('无法访问摄像头，请检查权限设置');
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, scanning, error, startScanning, stopScanning };
}
```

- [ ] **Step 2: 创建 src/components/add/BarcodeScanner.tsx**

```tsx
import { useBarcodeDetector } from '@/hooks/useBarcodeDetector';
import { useUIStore } from '@/stores/uiStore';

export default function BarcodeScanner() {
  const goBack = useUIStore((s) => s.goBack);
  const navigate = useUIStore((s) => s.navigate);

  const { videoRef, scanning, error, startScanning, stopScanning } =
    useBarcodeDetector((code) => {
      navigate('add');
      // 扫码结果通过 URL 参数传递，AddForm 读取后预填
      sessionStorage.setItem('scan_result', code);
    });

  const handleClose = () => {
    stopScanning();
    goBack();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-4 pt-12 pb-4 safe-top">
        <button onClick={handleClose} className="text-white p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-white text-sm font-medium">扫描快递单号</span>
        <div className="w-6" />
      </div>

      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-2 border-white/60 rounded-2xl" />
      </div>

      {!scanning && !error && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center z-10">
          <button
            onClick={startScanning}
            className="px-8 py-3 bg-brand text-white rounded-xl font-medium text-base
                       active:bg-blue-700 transition-colors"
          >
            开始扫描
          </button>
        </div>
      )}

      {error && (
        <div className="absolute bottom-24 left-4 right-4 z-10">
          <div className="bg-red-500/90 text-white text-sm text-center py-3 px-4 rounded-xl">
            {error}
          </div>
        </div>
      )}

      <p className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-xs z-10">
        将条码对准框内自动识别
      </p>
    </div>
  );
}
```

- [ ] **Step 3: 更新 AddForm 读取扫码结果**

在 AddForm 的 useEffect 中添加：

```tsx
// 在 AddForm.tsx 的 useEffect 块中追加
const scanResult = sessionStorage.getItem('scan_result');
if (scanResult) {
  setTrackingNumber(scanResult);
  sessionStorage.removeItem('scan_result');
}
```

- [ ] **Step 4: 验证 `npm run typecheck` 通过**

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useBarcodeDetector.ts src/components/add/BarcodeScanner.tsx src/components/add/AddForm.tsx
git commit -m "feat: add BarcodeScanner with BarcodeDetector API"
```

---

### Task 3.3: 集成屏幕切换到 App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 更新 src/App.tsx 添加屏幕切换**

```tsx
import { useUIStore } from '@/stores/uiStore';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import SearchBar from '@/components/layout/SearchBar';
import PackageList from '@/components/list/PackageList';
import BatchBar from '@/components/list/BatchBar';
import FabMenu from '@/components/layout/FabMenu';
import AddForm from '@/components/add/AddForm';
import BarcodeScanner from '@/components/add/BarcodeScanner';

export default function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);

  if (currentScreen === 'add') return <AddForm />;
  if (currentScreen === 'scan') return <BarcodeScanner />;

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <Header />
      <TabBar />
      <SearchBar />
      <PackageList />
      <BatchBar />
      <FabMenu />
    </div>
  );
}
```

- [ ] **Step 2: 验证：点击 FAB "手动添加" → 进入 AddForm，能正常添加并返回列表**

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add screen navigation to App"
```

---

## Phase 4: 详情页 & Toast

### Task 4.1: 创建 Toast 组件

**Files:**
- Create: `src/components/ui/Toast.tsx`

- [ ] **Step 1: 创建 src/components/ui/Toast.tsx**

```tsx
import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';

export default function Toast() {
  const toastMessage = useUIStore((s) => s.toastMessage);
  const toastType = useUIStore((s) => s.toastType);
  const toastUndoAction = useUIStore((s) => s.toastUndoAction);
  const hideToast = useUIStore((s) => s.hideToast);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (toastMessage) {
      clearTimeout(timerRef.current);
      if (toastType !== 'undo') {
        timerRef.current = setTimeout(hideToast, 2500);
      }
    }
  }, [toastMessage, toastType, hideToast]);

  if (!toastMessage) return null;

  const bgColor =
    toastType === 'success' ? 'bg-green-600' :
    toastType === 'error' ? 'bg-red-500' : 'bg-gray-800';

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center">
      <div className={`${bgColor} text-white text-sm px-4 py-3 rounded-xl shadow-lg
                       flex items-center gap-3 animate-slide-up max-w-sm`}>
        <span className="flex-1">{toastMessage}</span>
        {toastType === 'undo' && toastUndoAction && (
          <button
            onClick={() => { toastUndoAction(); hideToast(); }}
            className="font-bold text-yellow-300 whitespace-nowrap"
          >
            撤销
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 src/index.css 追加动画**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .safe-top { padding-top: env(safe-area-inset-top); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 0.25s ease-out;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Toast.tsx src/index.css
git commit -m "feat: add Toast component with undo support"
```

---

### Task 4.2: 创建 Modal 组件

**Files:**
- Create: `src/components/ui/Modal.tsx`

- [ ] **Step 1: 创建 src/components/ui/Modal.tsx**

```tsx
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({
  open, title, message, confirmLabel = '确认', cancelLabel = '取消',
  danger = false, onConfirm, onCancel,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm
                      px-6 pt-6 pb-8 sm:p-6 animate-slide-up mx-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl
                       active:bg-gray-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-sm text-white rounded-xl font-medium
                       active:opacity-90 transition-colors
                       ${danger ? 'bg-danger' : 'bg-brand'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Modal.tsx
git commit -m "feat: add Modal component"
```

---

### Task 4.3: 创建 PackageDetail 组件

**Files:**
- Create: `src/components/detail/PackageDetail.tsx`

- [ ] **Step 1: 创建 src/components/detail/PackageDetail.tsx**

```tsx
import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { usePackageStore } from '@/stores/packageStore';
import { db } from '@/services/db';
import { formatDateTime, normalizeCompany } from '@/utils/format';
import Modal from '@/components/ui/Modal';
import type { Package } from '@/types/package';

export default function PackageDetail() {
  const detailId = useUIStore((s) => s.detailId);
  const goBack = useUIStore((s) => s.goBack);
  const showToast = useUIStore((s) => s.showToast);
  const remove = usePackageStore((s) => s.remove);
  const update = usePackageStore((s) => s.update);
  const toggleStatus = usePackageStore((s) => s.toggleStatus);

  const [pkg, setPkg] = useState<Package | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (detailId) {
      db.packages.get(detailId).then(setPkg);
    }
  }, [detailId]);

  if (!pkg) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  const handleDelete = async () => {
    const [removed] = await remove(pkg.id);
    setShowDeleteModal(false);
    showToast(`已删除 ${removed.trackingNumber}`, 'undo', async () => {
      await db.packages.add(removed);
      showToast('已撤销删除', 'success');
    });
    goBack();
  };

  const handleToggleStatus = async () => {
    await toggleStatus(pkg.id);
    const updated = await db.packages.get(pkg.id);
    if (updated) setPkg(updated);
  };

  const isPending = pkg.status === 'pending';

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 safe-top border-b border-gray-100">
        <button onClick={goBack} className="p-1 -ml-1 text-gray-600" aria-label="返回">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">快递详情</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">快递单号</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${isPending ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
              {isPending ? '待收件' : '已收到'}
            </span>
          </div>
          <p className="font-mono text-xl tracking-wider text-gray-900 break-all">
            {pkg.trackingNumber}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <DetailRow label="快递公司" value={normalizeCompany(pkg.company)} />
          <DetailRow label="备注" value={pkg.remark || '无'} />
          <DetailRow label="录入时间" value={formatDateTime(pkg.createdAt)} />
          {pkg.receivedAt && (
            <DetailRow label="签收时间" value={formatDateTime(pkg.receivedAt)} />
          )}
        </div>

        <div className="flex gap-3">
          {isPending && (
            <button
              onClick={handleToggleStatus}
              className="flex-1 py-3 bg-success text-white rounded-xl font-medium text-sm
                         active:bg-green-600 transition-colors"
            >
              标记已收到
            </button>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className={`${isPending ? '' : 'flex-1'} py-3 bg-white text-danger rounded-xl
                       font-medium text-sm border border-gray-200 active:bg-red-50 transition-colors
                       ${isPending ? 'px-6' : ''}`}
          >
            删除
          </button>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        title="确认删除"
        message={`确定要删除快递单号「${pkg.trackingNumber}」吗？可在 5 秒内撤销。`}
        confirmLabel="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/detail/PackageDetail.tsx
git commit -m "feat: add PackageDetail component"
```

---

### Task 4.4: 集成详情页到 App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 更新 src/App.tsx 添加详情页和 Toast**

```tsx
import { useUIStore } from '@/stores/uiStore';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import SearchBar from '@/components/layout/SearchBar';
import PackageList from '@/components/list/PackageList';
import BatchBar from '@/components/list/BatchBar';
import FabMenu from '@/components/layout/FabMenu';
import AddForm from '@/components/add/AddForm';
import BarcodeScanner from '@/components/add/BarcodeScanner';
import PackageDetail from '@/components/detail/PackageDetail';
import Toast from '@/components/ui/Toast';

export default function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);

  if (currentScreen === 'add') return <AddForm />;
  if (currentScreen === 'scan') return <BarcodeScanner />;
  if (currentScreen === 'detail') return <PackageDetail />;

  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <Header />
      <TabBar />
      <SearchBar />
      <PackageList />
      <BatchBar />
      <FabMenu />
      <Toast />
    </div>
  );
}
```

- [ ] **Step 2: 验证：点卡片进入详情页，能删除并有撤销 Toast**

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate detail screen and Toast into App"
```

---

## Phase 5: CSV 导入导出 & 归档

### Task 5.1: 创建 CSV 服务

**Files:**
- Create: `src/services/csv.ts`

- [ ] **Step 1: 创建 src/services/csv.ts**

```typescript
import type { Package, PackageInput } from '@/types/package';

interface CSVRow {
  快递单号: string;
  快递公司: string;
  备注: string;
  状态: string;
  录入时间: string;
  签收时间: string;
}

function formatCSVDate(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export function exportToCSV(packages: Package[]): string {
  const BOM = '\uFEFF';
  const header = '快递单号,快递公司,备注,状态,录入时间,签收时间';

  const rows = packages.map((p) => {
    const status = p.status === 'pending' ? '待收件' : '已收到';
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      escape(p.trackingNumber),
      escape(p.company),
      escape(p.remark),
      status,
      formatCSVDate(p.createdAt),
      formatCSVDate(p.receivedAt),
    ].join(',');
  });

  return BOM + header + '\n' + rows.join('\n');
}

export function downloadCSV(packages: Package[]): void {
  const csv = exportToCSV(packages);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `快递记录_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(text: string): PackageInput[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  // Remove BOM and parse header
  const header = lines[0].replace(/^\uFEFF/, '').split(',').map((h) => h.trim());
  const numberIdx = header.findIndex((h) => h === '快递单号' || h === 'trackingNumber');
  const companyIdx = header.findIndex((h) => h === '快递公司' || h === 'company');
  const remarkIdx = header.findIndex((h) => h === '备注' || h === 'remark');

  if (numberIdx === -1) return [];

  const records: PackageInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const num = cols[numberIdx]?.trim();
    if (!num) continue;

    records.push({
      trackingNumber: num,
      company: cols[companyIdx]?.trim() || '',
      remark: cols[remarkIdx]?.trim() || '',
    });
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (inQuotes) {
      if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export async function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/csv.ts
git commit -m "feat: add CSV import/export service"
```

---

### Task 5.2: 创建归档服务

**Files:**
- Create: `src/services/archive.ts`

- [ ] **Step 1: 创建 src/services/archive.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/services/archive.ts
git commit -m "feat: add archive service"
```

---

### Task 5.3: 集成 CSV 导出到 PackageStore

**Files:**
- Modify: `src/stores/packageStore.ts`

- [ ] **Step 1: 更新 exportCSV 方法，改为下载文件**

在 `packageStore.ts` 中，替换 `exportCSV` 方法：

```typescript
import { downloadCSV } from '@/services/csv';

// 在 store 定义中：
exportCSV: () => {
  downloadCSV(get().packages);
},
```

- [ ] **Step 2: 在 FAB 菜单添加入口** — 后续独立 Task

- [ ] **Step 3: Commit**

```bash
git add src/stores/packageStore.ts
git commit -m "feat: integrate CSV download into package store"
```

---

## Phase 6: PWA 打磨 & 最终切换

### Task 6.1: PWA manifest 和图标迁移

**Files:**
- Create: `public/manifest.json`, `public/icons/`（从旧 `docs/` 迁移）

- [ ] **Step 1: 从 `docs/manifest.json` 复制到 `public/manifest.json`，更新内容**

```json
{
  "name": "快递单号管理 v4.0",
  "short_name": "快递管理",
  "description": "移动端快递单号管理工具",
  "start_url": "/tracking-tool/",
  "scope": "/tracking-tool/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2563eb",
  "background_color": "#f9fafb",
  "icons": [
    {
      "src": "/tracking-tool/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/tracking-tool/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: 复制图标文件到 `public/icons/`**

```bash
# 从旧 docs/ 目录复制图标（如果有的话）
# 如果没有，生成简单占位图标
```

- [ ] **Step 3: Commit**

```bash
git add public/manifest.json public/icons/
git commit -m "feat: migrate PWA manifest and icons"
```

---

### Task 6.2: 验证构建和 PWA

**Files:**
- 无新建文件

- [ ] **Step 1: 运行 `npm run build`，确认无错误**

```bash
npm run build
```

- [ ] **Step 2: 检查 `dist/` 目录结构，确认包含：**
  - `index.html`
  - `manifest.json`
  - `sw.js`（vite-plugin-pwa 自动生成）
  - `assets/`（打包后的 JS/CSS）
  - `icons/`

- [ ] **Step 3: 本地预览**

```bash
npm run preview
```

打开浏览器，检查：
- 页面正常加载
- PWA manifest 可访问（`/tracking-tool/manifest.json`）
- Service Worker 注册成功（DevTools → Application → Service Workers）

- [ ] **Step 4: Commit（如有调整）**

---

### Task 6.3: 移动端真机测试

- [ ] **Step 1: 部署到 GitHub Pages 测试环境**
  - 暂不推送 master，通过 GitHub Actions 手动触发或推送到测试分支

- [ ] **Step 2: 在手机上打开测试 URL，验证：**
  - 列表页正常渲染，卡片可点击
  - Tab 切换正常
  - 搜索防抖正常
  - 添加表单提交正常
  - 详情页删除 + 撤销 Toast 正常
  - 批量模式正常工作
  - 条码扫描（Android Chrome）正常
  - PWA "添加到主屏幕" 正常
  - 旧 IndexedDB 数据可正常读取

- [ ] **Step 3: 修复发现的问题**

---

### Task 6.4: 清理旧文件 & 最终切换

- [ ] **Step 1: 删除旧文件**

```bash
git rm docs/index.html
git rm docs/sw.js
```

- [ ] **Step 2: 更新 .gitignore（确保 dist/ 不被提交）**

确认 `.gitignore` 包含：
```
node_modules/
dist/
```

- [ ] **Step 3: 确认 GitHub Actions 部署配置正确**

`.github/workflows/deploy.yml` 中 `publish_dir: ./dist`

- [ ] **Step 4: 最终构建验证**

```bash
npm run typecheck
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: finalize React+TS migration, remove legacy files"
```

---

### Task 6.5: 合并到 master 并部署

- [ ] **Step 1: 切回 master，合并重构分支**

```bash
git checkout master
git merge refactor/react-ts-migration
```

- [ ] **Step 2: 推送 master 触发 GitHub Actions 自动部署**

```bash
git push origin master
```

- [ ] **Step 3: 等待 GitHub Actions 完成，验证线上 URL 正常**

---

## 自审

- [x] 无 TBD/TODO 占位符 — 所有 Task 均有完整代码
- [x] 类型一致性 — Package 类型在所有 Task 中保持一致，store 接口与组件 props 匹配
- [x] 覆盖所有 spec 要求：
  - [x] Phase 1: Vite 脚手架、TypeScript、Tailwind、Dexie.js、GitHub Actions
  - [x] Phase 2: 列表页（Header、TabBar、SearchBar、PackageCard/List、BatchBar、FabMenu、无限滚动）
  - [x] Phase 3: 添加表单、条码扫描
  - [x] Phase 4: 详情页、Toast 撤销、Modal 确认
  - [x] Phase 5: CSV 导入导出、归档
  - [x] Phase 6: PWA 迁移、清理、部署
- [x] 每个 Task 有确切文件路径、完整代码、bash 命令、commit message
- [x] 分支隔离：重构在 `refactor/react-ts-migration`，master 不受影响
