# 快递单号管理工具 React + TypeScript 重构设计文档

## 目标

将当前单文件 HTML（1,652 行，57KB）渐进迁移到 React 18 + TypeScript 工程化架构，解决可维护性瓶颈，支持后续功能扩展。

核心原则：**渐进式提取** — 每个 Phase 独立可部署，不搞 Big Bang 重写。

## 当前状态（V3）

- 单文件 `docs/index.html`：HTML 结构 ~200 行 + CSS ~270 行 + JS ~1,180 行
- 零依赖：无框架、无 npm、无构建工具、无 CDN
- 存储：IndexedDB（主数据）+ localStorage（元数据）
- PWA：Service Worker（`sw.js`）+ Web App Manifest
- 部署：GitHub Pages，`docs/` 目录直接推送
- 功能：列表（Tab 切换/搜索/批量操作/无限滚动）、添加表单（含条码扫描）、详情页、CSV 导入导出、归档
- 代码风格：ES5 + Promise，无 `const`/`let`，无 ES modules，全局变量散落

## 分支策略

- 主分支 `master`：保持当前 V3 可运行版本，不动
- 重构分支 `refactor/react-ts-migration`：所有重构工作在此进行，完成后合并

## 技术选型

| 层面 | 选型 | 理由 |
|------|------|------|
| 框架 | React 18 + TypeScript (strict) | 生态最大，IndexedDB/Dexie.js 支持好 |
| 构建 | Vite 5 | 极速冷启动，React+TS 一等支持 |
| 状态管理 | Zustand | 极简 API，无 boilerplate，TS 友好 |
| 数据层 | Dexie.js | IndexedDB 的 Promise 风格封装，TS schema 原生支持 |
| 样式 | Tailwind CSS 3 | 编译时零运行时，样式随组件走 |
| PWA | vite-plugin-pwa | 自动生成 SW + manifest 注入 |
| 测试 | Vitest + React Testing Library | Vite 原生测试框架 |
| 部署 | GitHub Actions → GitHub Pages | 自动构建部署，推送即上线 |

## 目录结构

```
tracking-tool/
├── src/
│   ├── main.tsx                    # React 入口
│   ├── App.tsx                     # 顶层路由/屏幕切换
│   ├── index.css                   # 全局样式 + Tailwind 指令
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # 顶部统计栏
│   │   │   ├── TabBar.tsx          # 待收件/已收到 切换
│   │   │   ├── SearchBar.tsx       # 搜索框
│   │   │   └── FabMenu.tsx         # 浮动操作按钮组
│   │   ├── list/
│   │   │   ├── PackageCard.tsx     # 单个快递卡片
│   │   │   ├── PackageList.tsx     # 卡片列表 + 无限滚动
│   │   │   ├── BatchBar.tsx        # 批量模式工具栏
│   │   │   └── EmptyState.tsx      # 空状态
│   │   ├── add/
│   │   │   ├── AddForm.tsx         # 添加快递表单
│   │   │   └── BarcodeScanner.tsx  # 条码扫描 overlay
│   │   ├── detail/
│   │   │   └── PackageDetail.tsx   # 快递详情页
│   │   └── ui/
│   │       ├── Toast.tsx           # Toast 通知
│   │       └── Modal.tsx           # 通用弹窗
│   │
│   ├── hooks/
│   │   ├── useInfiniteScroll.ts    # 无限滚动逻辑
│   │   └── useBarcodeDetector.ts   # BarcodeDetector API 封装
│   │
│   ├── stores/
│   │   ├── packageStore.ts         # 快递数据 CRUD
│   │   └── uiStore.ts              # UI 状态（屏幕/tab/batchMode）
│   │
│   ├── services/
│   │   ├── db.ts                   # Dexie.js 数据库定义
│   │   ├── csv.ts                  # CSV 导入/导出
│   │   └── archive.ts             # 归档逻辑
│   │
│   ├── types/
│   │   └── package.ts             # Package 接口、枚举
│   │
│   └── utils/
│       ├── format.ts              # 日期/快递公司格式化
│       └── highlight.ts           # 搜索关键词高亮
│
├── public/
│   ├── manifest.json              # PWA manifest（从旧项目迁移）
│   └── icons/                     # PWA 图标
│
├── index.html                     # Vite 入口 HTML（极简）
├── package.json                   # 依赖声明
├── tsconfig.json                  # TypeScript 配置
├── vite.config.ts                 # Vite + PWA 插件配置
├── tailwind.config.ts             # Tailwind CSS 配置
└── .github/
    └── workflows/
        └── deploy.yml             # GitHub Actions 自动部署
```

## 组件树

```
<App>
├── <Header />               ← 统计信息
├── <TabBar />               ← 标签切换
├── <SearchBar />            ← 搜索过滤
├── <BatchBar />             ← 批量模式（条件渲染）
│
├── [Screen: List]
│   ├── <PackageList>
│   │   └── <PackageCard /> × N
│   ├── <EmptyState />
│   └── <FabMenu />
│
├── [Screen: Add]
│   └── <AddForm />
│
├── [Screen: Detail]
│   └── <PackageDetail />
│
├── [Screen: Scan]
│   └── <BarcodeScanner />
│
└── <Toast />                ← 全局通知
```

## 数据流

**单向数据流：Component → Store Action → Service → IndexedDB → Store 更新 → Component re-render**

- 组件绝不直接调用 Dexie.js，必须通过 store action
- Store 是唯一状态源（Single Source of Truth）
- 所有异步操作通过 store action 处理 loading/error 状态
- 原 10+ 个全局变量收拢到 2 个 Zustand store

## 数据模型

```typescript
// types/package.ts
interface Package {
  id: string;               // crypto.randomUUID()
  trackingNumber: string;   // 快递单号
  company: string;          // 快递公司
  remark: string;           // 备注
  status: 'pending' | 'received';
  isArchived: boolean;
  createdAt: number;        // 录入时间戳
  receivedAt?: number;      // 签收时间戳
  archivedAt?: number;      // 归档时间戳
}
```

**Zustand Store 设计：**

```typescript
// stores/packageStore.ts
interface PackageStore {
  packages: Package[];
  totalCount: number;
  activeTab: 'pending' | 'received';
  searchQuery: string;
  isLoading: boolean;

  loadPage: (page: number) => Promise<void>;
  add: (data: Omit<Package, 'id' | 'createdAt' | 'isArchived'>) => Promise<void>;
  update: (id: string, data: Partial<Package>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  archive: (id: string) => Promise<void>;
  importCSV: (records: Package[]) => Promise<void>;
  exportCSV: () => Package[];
}

// stores/uiStore.ts
interface UIStore {
  currentScreen: 'list' | 'add' | 'detail' | 'scan';
  batchMode: boolean;
  selectedIds: Set<string>;
  detailId: string | null;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'undo';

  navigate: (screen: UIStore['currentScreen'], params?: any) => void;
  toggleBatchMode: () => void;
  showToast: (msg: string, type: UIStore['toastType'], onUndo?: () => void) => void;
}
```

**Dexie.js Schema：**

```typescript
// services/db.ts
class TrackingDB extends Dexie {
  packages!: EntityTable<Package, 'id'>;
  meta!: EntityTable<{ key: string; value: any }, 'key'>;

  constructor() {
    super('TrackingDB');
    this.version(1).stores({
      packages: 'id, status, isArchived, createdAt, trackingNumber',
      meta: 'key',
    });
  }
}
```

## 渐进迁移路线图

### Phase 1：搭骨架（1-2 天）

交付物：
- npm create vite → React + TS 模板，安装全部依赖
- `services/db.ts`：Dexie.js schema，对标原 IndexedDB
- `types/package.ts`：Package 类型定义
- 验证脚本：读写现有 IndexedDB 数据

不写任何 UI，纯底层验证。

### Phase 2：列表页（2-3 天）

迁移内容：
- `stores/packageStore.ts`：loadPage / toggleStatus / search
- `stores/uiStore.ts`：currentScreen / batchMode / selectedIds
- `components/layout/Header.tsx`、`TabBar.tsx`、`SearchBar.tsx`
- `components/list/PackageList.tsx`、`PackageCard.tsx`、`EmptyState.tsx`
- `components/list/BatchBar.tsx`
- `components/layout/FabMenu.tsx`
- `hooks/useInfiniteScroll.ts`

验证：80% 日常操作在此屏幕可完成。

### Phase 3：添加 & 扫码（1-2 天）

迁移内容：
- `components/add/AddForm.tsx`：表单校验、提交
- `components/add/BarcodeScanner.tsx`：BarcodeDetector API
- `hooks/useBarcodeDetector.ts`
- `packageStore.add()`

### Phase 4：详情页 & Toast（1 天）

迁移内容：
- `components/detail/PackageDetail.tsx`
- `components/ui/Toast.tsx`：undo delete
- `packageStore.remove()` / `update()`

### Phase 5：导入导出 & 归档（1-2 天）

迁移内容：
- `services/csv.ts`：CSV 导入导出
- `services/archive.ts`：归档逻辑
- `packageStore.importCSV()` / `exportCSV()` / `archive()`

### Phase 6：PWA 打磨 & 切换（1 天）

交付物：
- vite-plugin-pwa 配置（替代手写 sw.js）
- manifest.json 迁移
- 移动端真机测试 + 条码扫描
- 删除旧 `docs/index.html`，更新部署配置
- `npm run build` → GitHub Actions 自动部署

**总预估：8-11 天**

## 组件编码规范

- 每个组件一个 `.tsx` 文件，Props 必须有明确 interface
- 业务逻辑通过 store action 触发，组件不做数据操作
- 移动端点击态必须加 `active:` 交互反馈（Apple HIG 要求）
- 避免硬编码中文，使用 Props/children 传递

## 构建与部署

```typescript
// vite.config.ts 关键配置
base: '/tracking-tool/'     // GitHub Pages 子路径
VitePWA({ registerType: 'autoUpdate' })  // 自动更新 SW
```

```yaml
# .github/workflows/deploy.yml
# 每次 push main → npm ci → npm run build → 推送 dist/ 到 gh-pages 分支
```

## 文件变更

| Phase | 新增/变更 |
|-------|----------|
| Phase 1 | 新增：`package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`, `src/types/`, `src/services/db.ts`, `index.html`, `.github/workflows/deploy.yml` |
| Phase 2 | 新增：`src/stores/`, `src/components/layout/`, `src/components/list/`, `src/hooks/useInfiniteScroll.ts`, `src/App.tsx`, `src/main.tsx`, `src/index.css` |
| Phase 3-5 | 新增：`src/components/add/`, `src/components/detail/`, `src/components/ui/`, `src/services/csv.ts`, `src/services/archive.ts`, `src/hooks/useBarcodeDetector.ts` |
| Phase 6 | 删除：`docs/index.html`, `docs/sw.js`；更新：`docs/manifest.json`；新增：`public/manifest.json`, `public/icons/` |

## 自审

- [x] 无 TBD/TODO 占位符 — 所有节完整
- [x] 接口一致：Dexie.js schema 与旧 IndexedDB 结构兼容，旧数据可读取
- [x] 范围可控：6 个 Phase，每个有明确交付物和验证标准
- [x] 无歧义：组件树、数据流、状态管理均有明确设计
- [x] 分支隔离：重构在 `refactor/react-ts-migration` 分支，master 不受影响
