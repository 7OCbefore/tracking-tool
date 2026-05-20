# Feature Gap Porting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port 6 P0 features from master (V3 vanilla JS) to the refactor/react-ts-migration branch (V4 React+TS)

**Architecture:** Each feature is a self-contained change touching 1-3 files. No new stores or type definitions needed. All UI additions follow existing Tailwind CSS + React patterns. Changes are incremental — each task produces a working app.

**Tech Stack:** React 18, TypeScript 5, Zustand 4, Dexie.js 4, Tailwind CSS 3, Vite 5

**Branch:** `refactor/react-ts-migration` (source code branch — current branch `gh-pages-temp` has only built artifacts)

---

### Task 0: Switch to refactor branch and install dependencies

**Files:** (no code changes — environment setup)

- [ ] **Step 1: Stash current changes and switch to refactor branch**

Run: `git stash` (the design doc commit on gh-pages-temp)
Run: `git checkout refactor/react-ts-migration`
Run: `npm install`

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev -- --host 2>&1` in background, wait for "Local:" URL
Expected: Vite dev server starts on localhost
Stop the dev server with Ctrl+C.

---

### Task 1: FAB 菜单 — 点击外部关闭

**Files:**
- Modify: `src/components/layout/FabMenu.tsx`

This is the smallest and most isolated change — a good warm-up task.

- [ ] **Step 1: Add click-outside handler to FabMenu**

Edit `src/components/layout/FabMenu.tsx`:
- Import `useEffect`, `useRef` from 'react' (useRef already used for fileInputRef, useState already imported)
- Add `menuRef = useRef<HTMLDivElement>(null)` 
- Add `useEffect` that listens for `mousedown` on document and closes menu if click is outside `menuRef.current`

Add these imports at top:
```typescript
import { useState, useRef, useEffect } from 'react';
```

After the `showToast` line and before `const fileInputRef`, add:
```typescript
const menuRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [open]);
```

Then add `ref={menuRef}` to the outer `<div className="fixed bottom-6...">`.

- [ ] **Step 2: Verify it builds**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 2: 搜索高亮

**Files:**
- Modify: `src/components/list/PackageCard.tsx`
- Modify: `src/components/add/AddForm.tsx` (add search prefill — part of Task 4, but the highlight utility is needed now)

**Note:** `src/utils/highlight.ts` already exists with `highlightText()` and `escapeHtml()`. The current PackageCard displays text fields using standard JSX text rendering, which doesn't support HTML. We need to use `dangerouslySetInnerHTML` for the four searchable fields.

- [ ] **Step 1: Add search query reading and highlight in PackageCard**

Edit `src/components/list/PackageCard.tsx`:

Add import for highlightText and search query:
```typescript
import { usePackageStore } from '@/stores/packageStore';
import { highlightText } from '@/utils/highlight';
```

Add inside the component, before return:
```typescript
const searchQuery = usePackageStore((s) => s.searchQuery);
```

Change the number display (currently `<span className="font-mono ...">{pkg.number}</span>`) to:
```tsx
<span
  className="font-mono text-base tracking-wider text-gray-900"
  dangerouslySetInnerHTML={{ __html: highlightText(pkg.number, searchQuery) }}
/>
```

Change the customer display (currently `👤 {pkg.customer}`) — wrap the text part. Edit the customer `<span>`:
```tsx
<span className="text-xs text-brand bg-brand-light px-2 py-0.5 rounded">
  👤 <span dangerouslySetInnerHTML={{ __html: highlightText(pkg.customer, searchQuery) }} />
</span>
```

Change the region display — wrap the text part. Edit the region `<span>`:
```tsx
<span className="text-xs text-gray-400">
  📍 <span dangerouslySetInnerHTML={{ __html: highlightText(pkg.region, searchQuery) }} />
</span>
```

Change the notes display:
```tsx
<p
  className="text-sm text-gray-500 mt-1.5 truncate"
  dangerouslySetInnerHTML={{ __html: highlightText(pkg.notes, searchQuery) }}
/>
```

- [ ] **Step 2: Verify it builds**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 3: 搜索空状态「添加此单号」按钮

**Files:**
- Modify: `src/stores/uiStore.ts`
- Modify: `src/components/list/EmptyState.tsx`
- Modify: `src/components/add/AddForm.tsx` (read prefill value)

- [ ] **Step 1: Add searchToAdd state to uiStore**

Edit `src/stores/uiStore.ts`:

After `toastUndoAction: (() => void) | null`, add:
```typescript
searchToAdd: string | null;
```

After the `hideToast` in the interface, add:
```typescript
setSearchToAdd: (query: string | null) => void;
```

In the initial state (after `toastUndoAction: null`), add:
```typescript
searchToAdd: null,
```

After `hideToast` implementation, add:
```typescript
setSearchToAdd: (query) => set({ searchToAdd: query }),
```

- [ ] **Step 2: Add "添加此单号" button to EmptyState**

Edit `src/components/list/EmptyState.tsx`:

Add imports:
```typescript
import { useUIStore } from '@/stores/uiStore';
```

Add at the top of the component, after the existing hooks:
```typescript
const navigate = useUIStore((s) => s.navigate);
const setSearchToAdd = useUIStore((s) => s.setSearchToAdd);
```

In the search-empty section (inside `if (searchQuery)` block), after the `<p className="text-xs mt-1 text-gray-300">` line, add:
```tsx
<button
  onClick={() => { setSearchToAdd(searchQuery); navigate('add'); }}
  className="mt-4 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-medium
             active:bg-blue-700 transition-colors"
>
  添加此单号？
</button>
```

- [ ] **Step 3: Read searchToAdd in AddForm and prefill**

Edit `src/components/add/AddForm.tsx`:

Add to the existing `useUIStore` destructuring:
```typescript
const searchToAdd = useUIStore((s) => s.searchToAdd);
const setSearchToAdd = useUIStore((s) => s.setSearchToAdd);
```

In the `useEffect`, after setting customer/region from localStorage and reading scan_result, add:
```typescript
if (searchToAdd) {
  setNumber(searchToAdd);
  setSearchToAdd(null);
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 4: 最近输入快捷填充 (Recent Picks)

**Files:**
- Modify: `src/components/add/AddForm.tsx`

- [ ] **Step 1: Compute recent picks**

Edit `src/components/add/AddForm.tsx`:

Add import at top (packages already imported from usePackageStore):
(no new imports needed — `usePackageStore` already imported)

Add after `useEffect` and before `handleSubmit`:
```typescript
const allPackages = usePackageStore((s) => s.packages);

const recentPicks = (() => {
  const seen = new Set<string>();
  const result: { customer: string; region: string }[] = [];
  for (const p of allPackages) {
    const key = `${p.customer}||${p.region}`;
    if (key !== '||' && !seen.has(key)) {
      seen.add(key);
      result.push({ customer: p.customer, region: p.region });
      if (result.length >= 3) break;
    }
  }
  return result;
})();
```

- [ ] **Step 2: Render recent picks chip UI**

In the JSX, after the region input's `</div>` and before the notes `<div>`, add:
```tsx
{recentPicks.length > 0 && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">最近使用</label>
    <div className="flex flex-wrap gap-2">
      {recentPicks.map((pick, i) => (
        <button
          key={i}
          type="button"
          onClick={() => { setCustomer(pick.customer); setRegion(pick.region); }}
          className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600
                     active:bg-gray-200 transition-colors"
        >
          {pick.customer || '未知'} / {pick.region || '未知'}
        </button>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 5: 保存并继续添加按钮 (Save & Continue)

**Files:**
- Modify: `src/components/add/AddForm.tsx`

- [ ] **Step 1: Extract submit logic into reusable function, add save-and-continue button**

Edit `src/components/add/AddForm.tsx`:

Rename the existing `handleSubmit` to `handleSubmitAndBack` (the one that saves and calls `goBack()`):

Actually, the cleaner approach is to make `handleSubmit` accept a `stay` parameter, or create a separate handler.

Create a shared `saveRecord` async function that both buttons use:
```typescript
const saveRecord = async () => {
  if (!number.trim()) {
    showToast('请填写快递单号', 'error');
    return false;
  }
  if (!customer.trim() && !region.trim()) {
    showToast('客户名称和地区至少填写一个', 'error');
    return false;
  }
  setSaving(true);
  try {
    await add({
      number: number.trim(),
      customer: customer.trim(),
      region: region.trim(),
      notes: notes.trim(),
    });
    localStorage.setItem('tracking_last_customer', customer.trim());
    localStorage.setItem('tracking_last_region', region.trim());
    return true;
  } catch {
    showToast('添加失败，请重试', 'error');
    return false;
  } finally {
    setSaving(false);
  }
};
```

Replace the existing `handleSubmit` to delegate:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const ok = await saveRecord();
  if (ok) {
    showToast('添加成功', 'success');
    goBack();
  }
};

const handleSaveAndContinue = async () => {
  const ok = await saveRecord();
  if (ok) {
    showToast('添加成功', 'success');
    setNumber('');
    setNotes('');
    // Refocus number input for next entry
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('#add-form input[type="text"]');
      input?.focus();
    }, 100);
  }
};
```

In the JSX, after the submit button's `</button>`, add:
```tsx
<button
  type="button"
  onClick={handleSaveAndContinue}
  disabled={saving}
  className="w-full py-3.5 bg-white text-brand rounded-xl font-medium text-base
             border-2 border-brand disabled:opacity-50 active:bg-blue-50 transition-colors"
>
  {saving ? '保存中...' : '保存并继续添加'}
</button>
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 6: 归档功能 (Archive)

**Files:**
- Modify: `src/services/archive.ts`
- Modify: `src/stores/packageStore.ts`
- Modify: `src/components/layout/FabMenu.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Add archiveAll function to archive.ts**

Edit `src/services/archive.ts`:

Add a new function:
```typescript
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
```

- [ ] **Step 2: Add clearAll action to packageStore**

Edit `src/stores/packageStore.ts`:

Add to the PackageState interface:
```typescript
clearAll: () => Promise<void>;
```

Add after the `archive` implementation:
```typescript
clearAll: async () => {
  await db.packages.clear();
  set({ packages: [], totalCount: 0, currentPage: 1 });
},
```

- [ ] **Step 3: Add archive button to FabMenu**

Edit `src/components/layout/FabMenu.tsx`:

Add imports:
```typescript
import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { usePackageStore } from '@/stores/packageStore';
import { downloadCSV, parseCSV, readCSVFile } from '@/services/csv';
```

Add state for archive confirmation:
```typescript
const [showArchiveModal, setShowArchiveModal] = useState(false);
```

Add to the imports if not already:
```typescript
import Modal from '@/components/ui/Modal';
```

Actually, looking at the existing FabMenu, it already imports the necessary items. I need to add:
- archive-related function import
- Modal import
- archive button in the menu
- archive confirmation handler

Add import:
```typescript
import { archiveAllPackages } from '@/services/archive';
import Modal from '@/components/ui/Modal';
```

Add handler:
```typescript
const handleArchive = async () => {
  setOpen(false);
  setShowArchiveModal(true);
};

const confirmArchive = async () => {
  const all = usePackageStore.getState().packages;
  if (all.length === 0) {
    showToast('暂无数据需要归档', 'error');
    setShowArchiveModal(false);
    return;
  }
  await archiveAllPackages(all);
  setShowArchiveModal(false);
  showToast(`归档完成，已导出 ${all.length} 条记录`, 'success');
  // Reload page list
  usePackageStore.getState().loadPage(1);
};
```

Add archive button in the menu, after the import button and before `</div>`:
```tsx
<button
  onClick={handleArchive}
  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg
             text-sm text-gray-700 active:bg-gray-50 transition-colors"
>
  <span>归档</span>
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
</button>
```

Add Modal component at the end of the JSX, before the final `</div>`:
```tsx
<Modal
  open={showArchiveModal}
  title="确认归档"
  message={
    `将导出全部 ${usePackageStore.getState().packages.length} 条记录为 CSV 文件，` +
    `然后清空数据库开始新的周期。确定继续吗？`
  }
  confirmLabel="导出并归档"
  danger
  onConfirm={confirmArchive}
  onCancel={() => setShowArchiveModal(false)}
/>
```

- [ ] **Step 4: Show archive date in Header**

Edit `src/components/layout/Header.tsx`:

Add import:
```typescript
import { getLastArchiveDate } from '@/services/archive';
```

In the component, add after `const receivedCount = ...`:
```typescript
const lastArchiveDate = getLastArchiveDate();
```

In the JSX, after the "待收件 X 件 · 已收到 X 件" text, add:
```tsx
{lastArchiveDate && (
  <span className="text-blue-100 ml-2 text-xs">
    · 归档: {lastArchiveDate}
  </span>
)}
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 7: Run dev server and manual verify

**Files:** (verification only)

- [ ] **Step 1: Start dev server and check all features**

Run: `npm run dev -- --host`
Open in browser and verify:
1. FAB menu: opens, closes, click-outside closes it
2. Search: text highlight in results, empty state shows "添加此单号？"
3. Add form: recent picks visible (if data exists), save & continue works, search prefill works
4. Archive: button visible in FAB menu, confirmation modal appears, CSV download works

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

---

## Self-Review Checklist

1. **Spec coverage**: All 6 P0 features covered — FAB click-outside (Task 1), search highlight (Task 2), search-to-add (Task 3), recent picks (Task 4), save & continue (Task 5), archive (Task 6).
2. **Placeholder check**: No TBD, TODOs, or placeholder patterns. Every step has actual code.
3. **Type consistency**: All method signatures and property names are consistent with existing code. No new types introduced beyond what's needed.
