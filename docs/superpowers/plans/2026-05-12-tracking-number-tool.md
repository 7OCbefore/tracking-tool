# 快递单号管理工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web app that lets the user record tracking numbers from WeChat messages/photos, then quickly search/match physical package labels against the list.

**Architecture:** Two files — `index.html` (app shell with embedded CSS/JS) + `manifest.json` (for "Add to Home Screen" on phone). Hosted via GitHub Pages so the user opens a URL on their phone — no installation, no file transfers. `localStorage` for persistence. Zero runtime dependencies.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6), localStorage API, Web App Manifest.

**UI Design Principles (user is NOT tech-savvy, uses phone only):**
- Cards instead of table — each record is a card, much easier to tap on mobile
- Large touch targets — minimum 44px height for all buttons/inputs
- Big fonts — 16px minimum, 18-20px for important text
- Simple color coding — orange = pending, green = received
- One primary action per screen
- Search is the HERO feature — large, always visible, instant results
- **Search is partial/fuzzy** — searching "7890" finds "SF1234567890". Matches anywhere in the text, not just prefix.
- **扫码 (Scan)** on Android — native BarcodeDetector API scans 1D barcodes (Code 128/39/EAN) from express labels. On iOS, the scan button is hidden and search is used instead.

---

## File Structure

| File | Purpose |
|------|---------|
| `docs/tracking-tool/index.html` | Entire application |
| `docs/tracking-tool/manifest.json` | PWA manifest for "Add to Home Screen" |

Hosted via GitHub Pages so user opens a URL on their phone.

---

### Task 1: Create the mobile-first HTML structure

**Files:**
- Create: `E:\Development\Personal\docs\tracking-tool\index.html`

- [ ] **Step 1: Write the HTML skeleton**

The app has three "screens" that show/hide (no navigation needed — user sees one thing at a time):

1. **主列表 (Main List)** — search bar at top, record cards below, floating add button
2. **添加表单 (Add Form)** — full-screen form for entering tracking info
3. **记录详情 (Record Detail)** — full-screen detail view with mark-received / delete

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>快递单号管理</title>
<link rel="manifest" href="manifest.json">
<style>
/* CSS in Task 2 */
</style>
</head>
<body>

<!-- ====== Screen 1: Main List ====== -->
<div id="screen-list" class="screen active">
  <header>
    <h1>快递单号</h1>
    <div id="stats"></div>
  </header>

  <div id="search-bar">
    <input type="search" id="search-input" placeholder="搜索单号、客户、地区..." autocomplete="off">
    <button id="btn-clear-search" class="hidden">x</button>
  </div>

  <div id="card-list">
    <!-- Cards rendered by JS -->
  </div>

  <div id="empty-state" class="hidden">
    <div class="empty-icon">📦</div>
    <p>还没有快递记录</p>
    <p class="empty-hint">点下方按钮添加第一条</p>
  </div>

  <button id="btn-add" class="fab">+</button>
  <button id="btn-scan" class="fab-scan">📷</button>
</div>

<!-- ====== Camera overlay (scan barcode) ====== -->
<div id="camera-overlay" class="hidden">
  <div id="camera-header">
    <button id="btn-close-camera" class="header-btn">← 关闭</button>
    <span id="camera-status">对准条形码</span>
  </div>
  <video id="camera-view" autoplay playsinline></video>
  <div id="scan-result"></div>
</div>

<!-- ====== Screen 2: Add Record ====== -->
<div id="screen-add" class="screen">
  <header>
    <button id="btn-back-from-add" class="header-btn">← 返回</button>
    <h1>添加快递</h1>
    <div></div>
  </header>

  <form id="add-form">
    <div class="form-group">
      <label for="input-number">快递单号</label>
      <input type="text" id="input-number" required placeholder="输入或粘贴快递单号" autocomplete="off">
    </div>
    <div class="form-group">
      <label for="input-customer">客户名称</label>
      <input type="text" id="input-customer" required placeholder="输入客户名称" autocomplete="off">
    </div>
    <div class="form-group">
      <label for="input-region">地区</label>
      <input type="text" id="input-region" required placeholder="如：上海、北京、广东" autocomplete="off">
    </div>
    <div class="form-group">
      <label for="input-notes">备注（可选）</label>
      <input type="text" id="input-notes" placeholder="如：订单号、商品名称" autocomplete="off">
    </div>

    <div class="form-actions">
      <button type="submit" id="btn-save" class="btn-primary">保存</button>
      <button type="button" id="btn-save-continue" class="btn-secondary">保存并继续添加</button>
    </div>
  </form>
</div>

<!-- ====== Screen 3: Record Detail ====== -->
<div id="screen-detail" class="screen">
  <header>
    <button id="btn-back-from-detail" class="header-btn">← 返回</button>
    <h1>记录详情</h1>
    <div></div>
  </header>

  <div id="detail-content">
    <div class="detail-field">
      <label>快递单号</label>
      <div id="detail-number" class="detail-value large"></div>
    </div>
    <div class="detail-field">
      <label>客户名称</label>
      <div id="detail-customer" class="detail-value"></div>
    </div>
    <div class="detail-field">
      <label>地区</label>
      <div id="detail-region" class="detail-value"></div>
    </div>
    <div class="detail-field">
      <label>录入日期</label>
      <div id="detail-date" class="detail-value"></div>
    </div>
    <div class="detail-field">
      <label>备注</label>
      <div id="detail-notes" class="detail-value"></div>
    </div>
    <div class="detail-field">
      <label>状态</label>
      <div id="detail-status" class="detail-value"></div>
    </div>

    <div class="detail-actions">
      <button id="btn-toggle-receive" class="btn-primary btn-large">标记为已收到</button>
      <button id="btn-delete" class="btn-danger btn-large">删除此记录</button>
    </div>
  </div>
</div>

<script>
// JS in Task 3+
</script>
</body>
</html>
```

Notes on design choices:
- `user-scalable=no` prevents accidental zoom on double-tap on mobile
- `<input type="search">` gives a "search" keyboard on mobile with a search button
- FAB (floating action button) for add — familiar mobile pattern
- Each screen is a separate div shown/hidden — simple, no routing needed
- "保存并继续添加" button — useful when entering multiple records from photos

- [ ] **Step 2: Create PWA manifest for Add to Home Screen**

```json
{
  "name": "快递单号管理",
  "short_name": "快递管理",
  "description": "记录和查询快递单号",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#f5f5f5",
  "theme_color": "#1890ff",
  "icons": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📦</text></svg>",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ]
}
```

Note: Uses an emoji-derived SVG icon (no image file needed). When user adds to home screen on iPhone/Android, it shows the package emoji as the app icon.

- [ ] **Step 3: Initialize git repo and commit**

```bash
cd /path/to/project
git add docs/tracking-tool/
git commit -m "feat: add mobile-first HTML structure for tracking tool"
```

---

### Task 2: Mobile-first CSS

**Files:**
- Modify: `docs/tracking-tool/index.html` (CSS inside `<style>`)

- [ ] **Step 1: Write mobile-first CSS**

Key design rules:
- Everything feels like a native mobile app
- Cards, not a table
- Minimum touch target 44px
- Bottom-anchored FAB button
- Colors: orange = pending, green = received

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #f5f5f5;
  color: #333;
  font-size: 16px;
  line-height: 1.5;
  /* Prevent pull-to-refresh conflicts with our UI */
  overscroll-behavior: none;
}

/* === Screen Management === */
.screen {
  display: none;
  min-height: 100dvh;
  flex-direction: column;
}
.screen.active {
  display: flex;
}

/* === Header === */
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 10;
  min-height: 52px;
}

header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #1890ff;
  padding: 8px 4px;
  cursor: pointer;
  min-width: 60px;
  text-align: left;
}

#stats {
  font-size: 13px;
  color: #888;
}

/* === Search Bar === */
#search-bar {
  display: flex;
  gap: 0;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 52px;
  z-index: 9;
}

#search-input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 22px;
  font-size: 16px;
  outline: none;
  background: #f8f8f8;
  transition: border-color 0.2s, background 0.2s;
}

#search-input:focus {
  border-color: #1890ff;
  background: #fff;
}

#btn-clear-search {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: #c0c0c0;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* === Card List === */
#card-list {
  flex: 1;
  padding: 12px 16px;
  padding-bottom: 80px; /* space for FAB */
}

.record-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: box-shadow 0.2s;
  position: relative;
  border-left: 4px solid #ffa940;
}

.record-card.received {
  border-left-color: #73d13d;
}

.record-card:active {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-number {
  font-size: 18px;
  font-weight: 600;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
  color: #1a1a1a;
  margin-bottom: 6px;
  word-break: break-all;
}

.card-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #666;
}

.card-meta span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.card-status {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.card-status.pending {
  background: #fff7e6;
  color: #d46b08;
}

.card-status.received {
  background: #f6ffed;
  color: #389e0d;
}

.card-date {
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
}

/* === Empty State === */
#empty-state {
  text-align: center;
  padding: 80px 20px;
}

#empty-state .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

#empty-state p {
  font-size: 16px;
  color: #999;
}

#empty-state .empty-hint {
  font-size: 14px;
  color: #bbb;
  margin-top: 8px;
}

/* === FAB (Floating Action Button) === */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  border: none;
  font-size: 28px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(24,144,255,0.4);
  cursor: pointer;
  z-index: 20;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab:active {
  transform: scale(0.92);
  box-shadow: 0 2px 6px rgba(24,144,255,0.3);
}

/* Scan FAB — positioned slightly above the add button */
.fab-scan {
  position: fixed;
  bottom: 92px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #52c41a;
  color: #fff;
  border: none;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(82,196,26,0.4);
  cursor: pointer;
  z-index: 20;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-scan:active {
  transform: scale(0.92);
  box-shadow: 0 2px 6px rgba(82,196,26,0.3);
}

/* === Add Form Screen === */
#screen-add {
  background: #fff;
}

.form-group {
  padding: 16px 20px 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 17px;
  outline: none;
  transition: border-color 0.2s;
  background: #fafafa;
}

.form-group input:focus {
  border-color: #1890ff;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(24,144,255,0.1);
}

.form-group input::placeholder {
  color: #c0c0c0;
}

.form-actions {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-primary {
  height: 50px;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 500;
  background: #1890ff;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:active {
  background: #096dd9;
}

.btn-secondary {
  height: 50px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  font-size: 16px;
  background: #fff;
  color: #555;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:active {
  background: #f5f5f5;
}

.btn-danger {
  height: 50px;
  border: 1px solid #ff4d4f;
  border-radius: 10px;
  font-size: 16px;
  background: #fff;
  color: #ff4d4f;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:active {
  background: #fff2f0;
}

.btn-large {
  width: 100%;
}

/* === Detail Screen === */
#detail-content {
  padding: 20px;
  flex: 1;
}

.detail-field {
  margin-bottom: 18px;
}

.detail-field label {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
  display: block;
}

.detail-value {
  font-size: 17px;
  color: #333;
  word-break: break-all;
}

.detail-value.large {
  font-size: 22px;
  font-weight: 600;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
}

.detail-actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* === Match Highlight === */
.highlight {
  background: #fff3cd;
  padding: 1px 3px;
  border-radius: 2px;
}

/* === Utility === */
.hidden {
  display: none !important;
}

/* === Camera Overlay === */
#camera-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

#camera-overlay.hidden {
  display: none;
}

#camera-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  z-index: 2;
}

#camera-header .header-btn {
  color: #fff;
}

#camera-status {
  font-size: 14px;
  color: #ccc;
}

#camera-view {
  flex: 1;
  width: 100%;
  object-fit: cover;
}

#scan-result {
  padding: 16px;
  background: rgba(0,0,0,0.85);
  color: #fff;
  text-align: center;
  font-size: 15px;
  min-height: 60px;
}

#scan-result .scanned-number {
  font-size: 20px;
  font-weight: 600;
  font-family: "Courier New", monospace;
  color: #52c41a;
  letter-spacing: 1px;
}

#scan-result .scan-match {
  color: #52c41a;
  font-weight: 500;
}

#scan-result .scan-no-match {
  color: #ff4d4f;
}

#scan-result .scan-retry-btn {
  margin-top: 8px;
  padding: 8px 20px;
  border: 1px solid #fff;
  border-radius: 8px;
  background: transparent;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}
```

- [ ] **Step 2: Refresh and verify mobile layout**

Open `index.html` in a mobile browser or Chrome DevTools mobile mode (iPhone SE or similar). Expected:
- Header with title "快递单号" and stats line
- Search bar with rounded input
- Empty state with 📦 icon and text
- Blue FAB button in bottom-right corner
- Add form screen hidden
- Detail screen hidden

- [ ] **Step 3: Commit**

```bash
git add docs/tracking-tool/index.html
git commit -m "feat: add mobile-first CSS with card layout and touch-friendly design"
```

---

### Task 3: Data layer

**Files:**
- Modify: `docs/tracking-tool/index.html` (add JS in `<script>` block)

- [ ] **Step 1: Add data management code**

```javascript
// === Data Layer ===

const STORAGE_KEY = 'tracking_data_v1';

let appData = [];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    appData = raw ? JSON.parse(raw) : [];
  } catch (e) {
    appData = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function addRecord(number, customer, region, notes) {
  const record = {
    id: generateId(),
    number: number.trim(),
    customer: customer.trim(),
    region: region.trim(),
    notes: notes ? notes.trim() : '',
    date: new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }),
    received: false,
    receivedAt: null,
    createdAt: Date.now()
  };
  appData.unshift(record);
  saveData();
  return record;
}

function deleteRecord(id) {
  appData = appData.filter(r => r.id !== id);
  saveData();
}

function toggleReceived(id) {
  const record = appData.find(r => r.id === id);
  if (!record) return;
  record.received = !record.received;
  record.receivedAt = record.received ? Date.now() : null;
  saveData();
}

function getFilteredData(query) {
  if (!query) return appData;
  const q = query.trim().toLowerCase();
  return appData.filter(r =>
    r.number.toLowerCase().includes(q) ||
    r.customer.toLowerCase().includes(q) ||
    r.region.toLowerCase().includes(q) ||
    (r.notes && r.notes.toLowerCase().includes(q))
  );
}
```

- [ ] **Step 2: Verify in browser**

Open DevTools console on mobile emulation:
```javascript
localStorage.clear();
addRecord('SF123456789', '张三', '北京', '测试');
```
Expected: no errors. Data is stored in localStorage (check Application > Local Storage).

- [ ] **Step 3: Commit**

```bash
git add docs/tracking-tool/index.html
git commit -m "feat: add localStorage data layer with CRUD operations"
```

---

### Task 4: Render the card list + search

**Files:**
- Modify: `docs/tracking-tool/index.html`

- [ ] **Step 1: Write render and search functions**

```javascript
// === Render ===

function render() {
  const query = document.getElementById('search-input').value;
  const data = getFilteredData(query);
  const container = document.getElementById('card-list');
  const emptyState = document.getElementById('empty-state');
  const statsEl = document.getElementById('stats');
  const clearBtn = document.getElementById('btn-clear-search');

  // Stats
  const total = appData.length;
  const received = appData.filter(r => r.received).length;
  const pending = total - received;
  statsEl.textContent = `共${total}条 · 已收${received} · 待收${pending}`;

  // Clear button visibility
  if (query) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  // Empty state or cards
  if (data.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    if (query) {
      emptyState.querySelector('p').textContent = '没有匹配的记录';
      emptyState.querySelector('.empty-hint').textContent = '试试其他关键词';
    } else {
      emptyState.querySelector('p').textContent = '还没有快递记录';
      emptyState.querySelector('.empty-hint').textContent = '点 + 按钮添加第一条';
    }
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = data.map(record => {
    const statusClass = record.received ? 'received' : 'pending';
    const statusText = record.received ? '已收到' : '待收件';
    return `
      <div class="record-card ${statusClass}" data-id="${record.id}" onclick="showDetail('${record.id}')">
        <div class="card-number">${hl(record.number, query)}</div>
        <div class="card-meta">
          <span>👤 ${hl(record.customer, query)}</span>
          <span>📍 ${hl(record.region, query)}</span>
        </div>
        ${record.notes ? `<div class="card-meta"><span>📝 ${hl(record.notes, query)}</span></div>` : ''}
        <span class="card-status ${statusClass}">${statusText}</span>
        <div class="card-date">${record.date}</div>
      </div>
    `;
  }).join('');
}

function hl(text, query) {
  if (!query || !text) return text || '';
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  const before = escapeHtml(text.slice(0, idx));
  const match = escapeHtml(text.slice(idx, idx + q.length));
  const after = escapeHtml(text.slice(idx + q.length));
  return `${before}<span class="highlight">${match}</span>${after}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

- [ ] **Step 2: Initialize on page load**

Add at end of `<script>`:
```javascript
// === Init ===
loadData();
render();
```

- [ ] **Step 3: Test the list rendering**

1. Open in browser mobile view
2. Add data via console: `addRecord('SF123', '张三', '北京')`, `addRecord('YT456', '李四', '上海')`
3. Refresh page
4. Expected: two cards visible with tracking numbers, customer names, regions, "待收件" badge
5. Statistics shows "共2条 · 已收0 · 待收2"

- [ ] **Step 4: Commit**

```bash
git add docs/tracking-tool/index.html
git commit -m "feat: add card list render with search highlighting"
```

---

### Task 5: Wire up add form screen

**Files:**
- Modify: `docs/tracking-tool/index.html`

- [ ] **Step 1: Add screen navigation and form handlers**

```javascript
// === Screen Navigation ===

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// === Form Handlers ===

document.addEventListener('DOMContentLoaded', function() {

  // FAB → show add screen
  document.getElementById('btn-add').addEventListener('click', function() {
    document.getElementById('add-form').reset();
    showScreen('screen-add');
    setTimeout(function() {
      document.getElementById('input-number').focus();
    }, 300);
  });

  // Back from add screen
  document.getElementById('btn-back-from-add').addEventListener('click', function() {
    showScreen('screen-list');
    render();
  });

  // Save
  document.getElementById('add-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const number = document.getElementById('input-number').value.trim();
    const customer = document.getElementById('input-customer').value.trim();
    const region = document.getElementById('input-region').value.trim();
    const notes = document.getElementById('input-notes').value.trim();

    if (!number || !customer || !region) {
      alert('请填写快递单号和客户信息');
      return;
    }

    addRecord(number, customer, region, notes);
    this.reset();
    showScreen('screen-list');
    render();
  });

  // Save and continue adding (useful for entering multiple records from photos)
  document.getElementById('btn-save-continue').addEventListener('click', function() {
    const number = document.getElementById('input-number').value.trim();
    const customer = document.getElementById('input-customer').value.trim();
    const region = document.getElementById('input-region').value.trim();
    const notes = document.getElementById('input-notes').value.trim();

    if (!number || !customer || !region) {
      alert('请填写快递单号和客户信息');
      return;
    }

    addRecord(number, customer, region, notes);
    document.getElementById('add-form').reset();
    // Focus back to first field for next entry
    setTimeout(function() {
      document.getElementById('input-number').focus();
    }, 200);
  });

  // Search with real-time filtering
  document.getElementById('search-input').addEventListener('input', function() {
    render();
  });

  // Clear search button
  document.getElementById('btn-clear-search').addEventListener('click', function() {
    document.getElementById('search-input').value = '';
    document.getElementById('search-input').focus();
    render();
  });

});
```

- [ ] **Step 2: Test the add flow on mobile**

1. Tap FAB "+" button → add screen slides in (with header "添加快递" and back button)
2. Tap "返回" → back to list
3. Tap FAB again, fill in: 单号=SF123, 客户=张三, 地区=北京
4. Tap "保存" → back to list, card appears
5. Tap FAB, fill another one, tap "保存并继续添加" → saved, form clears, focus back on first field
6. Tap "返回" → back to list with 2 cards

- [ ] **Step 3: Commit**

```bash
git add docs/tracking-tool/index.html
git commit -m "feat: wire up add form with save and save-continue flow"
```

---

### Task 6: Record detail screen (view, mark received, delete)

**Files:**
- Modify: `docs/tracking-tool/index.html`

- [ ] **Step 1: Add detail screen logic**

```javascript
// === Detail Screen ===

let currentDetailId = null;

function showDetail(id) {
  currentDetailId = id;
  const record = appData.find(r => r.id === id);
  if (!record) return;

  document.getElementById('detail-number').textContent = record.number;
  document.getElementById('detail-customer').textContent = record.customer;
  document.getElementById('detail-region').textContent = record.region;
  document.getElementById('detail-date').textContent = record.date;
  document.getElementById('detail-notes').textContent = record.notes || '无';

  const statusEl = document.getElementById('detail-status');
  const toggleBtn = document.getElementById('btn-toggle-receive');

  if (record.received) {
    statusEl.textContent = '已收到';
    statusEl.style.color = '#389e0d';
    toggleBtn.textContent = '标记为未收到';
    toggleBtn.className = 'btn-secondary btn-large';
  } else {
    statusEl.textContent = '待收件';
    statusEl.style.color = '#d46b08';
    toggleBtn.textContent = '标记为已收到';
    toggleBtn.className = 'btn-primary btn-large';
  }

  showScreen('screen-detail');
}

// Back from detail
document.getElementById('btn-back-from-detail').addEventListener('click', function() {
  showScreen('screen-list');
  render();
});

// Toggle received status
document.getElementById('btn-toggle-receive').addEventListener('click', function() {
  if (currentDetailId) {
    toggleReceived(currentDetailId);
    showDetail(currentDetailId); // re-render detail
    render(); // update list in background
  }
});

// Delete with confirmation
document.getElementById('btn-delete').addEventListener('click', function() {
  if (!currentDetailId) return;
  if (confirm('确定要删除这条记录吗？')) {
    deleteRecord(currentDetailId);
    currentDetailId = null;
    showScreen('screen-list');
    render();
  }
});
```

- [ ] **Step 2: Test detail screen on mobile**

1. Have at least one record in the list
2. Tap on a card → detail screen opens
3. Expected: all fields shown, tracking number in large font
4. Tapping 一个记录卡片 → 进入详情页
5. Expected: all fields shown, tracking number in large font
6. Tap "标记为已收到" → 状态变为"已收到"(绿色), button changes to "标记为未收到"
7. Tap "← 返回" → list shows card with green left border and "已收到" badge
8. Open detail again, tap "删除此记录" → confirm dialog → record deleted
9. Expected: back to list, record gone, stats updated

- [ ] **Step 3: Commit**

```bash
git add docs/tracking-tool/index.html
git commit -m "feat: add record detail screen with mark-received and delete"
```

---

### Task 7: Barcode scanning (Android Chrome — native BarcodeDetector API)

**Files:**
- Modify: `docs/tracking-tool/index.html`

- [ ] **Step 1: Add scan button handler and camera logic**

```javascript
// === Barcode Scanning (Android Chrome BarcodeDetector API) ===

let barcodeDetector = null;
let scanStream = null;

// Check if BarcodeDetector is available and supports 1D barcodes
function isScanSupported() {
  if (!('BarcodeDetector' in window)) return false;
  // BarcodeDetector might exist but not support 1D formats (iOS only supports QR)
  // We detect by checking formats, defaulting to showing the button
  return true;
}

// Hide scan button on unsupported devices
function initScanSupport() {
  const scanBtn = document.getElementById('btn-scan');
  if (!isScanSupported()) {
    scanBtn.classList.add('hidden');
    return;
  }
  // Check if it supports common express barcode formats
  if ('BarcodeDetector' in window && BarcodeDetector.getSupportedFormats) {
    BarcodeDetector.getSupportedFormats().then(function(formats) {
      const supported = formats.some(function(f) {
        return ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf'].includes(f);
      });
      if (!supported) scanBtn.classList.add('hidden');
    }).catch(function() {
      // keep button visible, let it fail gracefully at scan time
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initScanSupport();

  document.getElementById('btn-scan').addEventListener('click', startScanner);
  document.getElementById('btn-close-camera').addEventListener('click', stopScanner);
});

async function startScanner() {
  const overlay = document.getElementById('camera-overlay');
  const video = document.getElementById('camera-view');
  const status = document.getElementById('camera-status');
  const resultDiv = document.getElementById('scan-result');
  overlay.classList.remove('hidden');
  resultDiv.innerHTML = '正在启动相机...';

  try {
    barcodeDetector = new BarcodeDetector({
      formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf']
    });
  } catch (e) {
    resultDiv.innerHTML = '<span style="color:#ff4d4f">此设备不支持扫码功能，请使用搜索</span>';
    setTimeout(stopScanner, 2000);
    return;
  }

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    video.srcObject = scanStream;
    await video.play();
    status.textContent = '对准面单条形码';
    resultDiv.innerHTML = '正在识别...';
    scanLoop(video, resultDiv, status);
  } catch (e) {
    resultDiv.innerHTML = '<span style="color:#ff4d4f">无法打开相机</span>';
    setTimeout(stopScanner, 1500);
  }
}

function stopScanner() {
  const overlay = document.getElementById('camera-overlay');
  overlay.classList.add('hidden');
  if (scanStream) {
    scanStream.getTracks().forEach(function(t) { t.stop(); });
    scanStream = null;
  }
  barcodeDetector = null;
}

let scanLoopActive = false;

async function scanLoop(video, resultDiv, statusEl) {
  if (scanLoopActive) return;
  scanLoopActive = true;

  let scanCount = 0;
  let lastNumber = '';

  while (scanLoopActive) {
    try {
      const barcodes = await barcodeDetector.detect(video);
      if (barcodes.length > 0) {
        const number = barcodes[0].rawValue.trim();
        if (number !== lastNumber) {
          lastNumber = number;
          scanCount++;
          // Search for this number in our data
          const matches = getFilteredData(number);
          if (matches.length > 0) {
            // Found match — show result with match info
            const record = matches[0];
            resultDiv.innerHTML =
              '<div class="scanned-number">' + escapeHtml(number) + '</div>' +
              '<div class="scan-match">已匹配：' + escapeHtml(record.customer) +
              '（' + escapeHtml(record.region) + '）' +
              (record.received ? ' · 已收到' : ' · 待收件') + '</div>' +
              '<button class="scan-retry-btn" onclick="showMatchedRecord()">查看详情</button>';

            // Store matched ID for the button
            window._lastScannedId = record.id;
            statusEl.textContent = '✅ 匹配成功！';
            scanLoopActive = false;
            return;
          } else {
            // No match — show the number and continue scanning
            resultDiv.innerHTML =
              '<div class="scanned-number">' + escapeHtml(number) + '</div>' +
              '<div class="scan-no-match">未找到匹配记录</div><div style="font-size:13px;color:#999;margin-top:6px">该单号不在列表中，继续扫描...</div>';
            statusEl.textContent = '未匹配，继续扫描';
          }
        }
      }
    } catch (e) {
      // detection frame error, retry
    }

    // Yield to UI between frames
    await new Promise(function(r) { setTimeout(r, 300); });

    // Safety limit: stop after ~30 seconds of scanning
    if (scanCount > 100) {
      resultDiv.innerHTML = '<div style="color:#999">扫码超时，请点击关闭后重试</div>';
      break;
    }
  }
  scanLoopActive = false;
}

function showMatchedRecord() {
  if (window._lastScannedId) {
    stopScanner();
    showDetail(window._lastScannedId);
  }
}
```

- [ ] **Step 2: Test barcode scanning on Android**

1. Open the app in Chrome on Android
2. Tap the green 📷 button on the list screen
3. Expected: camera opens, "对准面单条形码" shown
4. Point at an express label with a barcode (or print one for testing)
5. Expected: barcode detected, number shown in green, if matched → shows customer info and "查看详情" button
6. Tap "查看详情" → camera closes, detail screen opens for that record
7. If barcode doesn't match any record → shows "未找到匹配记录", continues scanning
8. Tap "← 关闭" to exit scanner

- [ ] **Step 3: Test graceful fallback on iOS**

1. Open the app in Safari on iPhone
2. Expected: green 📷 scan button is NOT visible (hidden via detection API)
3. User uses search instead

- [ ] **Step 4: Commit**

```bash
git add docs/tracking-tool/index.html
git commit -m "feat: add barcode scanning via BarcodeDetector API (Android Chrome)"
```

---

### Task 8: Service worker + offline support

**Files:**
- Create: `docs/tracking-tool/sw.js`

- [ ] **Step 1: Create service worker for offline use**

```javascript
// Service Worker for offline caching
const CACHE_NAME = 'tracking-tool-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
```

- [ ] **Step 2: Register service worker in index.html**

Add before closing `</script>` tag:
```javascript
// === Service Worker Registration ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').catch(function(err) {
      console.log('SW registration failed:', err);
    });
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add docs/tracking-tool/sw.js docs/tracking-tool/index.html
git commit -m "feat: add service worker for offline support"
```

---

### Task 9: Deploy via GitHub Pages

**Files:**
- No code changes — set up hosting

- [ ] **Step 1: Push to GitHub and enable Pages**

The `docs/` folder is already a GitHub Pages convention. After pushing to GitHub:
1. Go to repo Settings → Pages
2. Source: Deploy from branch
3. Branch: main, folder: `/docs`
4. Save

After a minute, the app is available at `https://<username>.github.io/<repo>/tracking-tool/`

- [ ] **Step 2: Test on phone**

1. Open the GitHub Pages URL on phone browser
2. Expected: app loads, works correctly
3. Tap Share → "Add to Home Screen" → app opens with standalone look (no browser chrome)
4. Test offline: turn on airplane mode, app still works with cached data

- [ ] **Step 3: Provide final URL to user**

The URL is all the user needs. They open it on their phone and add to home screen.

- [ ] **Step 4: Commit**

```bash
git add docs/tracking-tool/
git commit -m "docs: finalize tracking tool for GitHub Pages deployment"
```

---

### Task 10: Final integration test

**Files:**
- Verify everything works end-to-end

- [ ] **Step 1: Test complete workflow on mobile**

1. Open the GitHub Pages URL on an iPhone/Android
2. Add to home screen
3. Open from home screen — looks like a native app
4. Add 3 records: different customers, regions, one with notes
5. Search by partial tracking number — cards filter instantly
6. Search by customer name — works
7. Clear search — all records back
8. Tap a card → detail view
9. Mark as received → green status, back to list confirms
10. Delete one record → confirm dialog → gone
11. Close browser, reopen → data persists

- [ ] **Step 2: Commit (if any fixes needed)**

```bash
git add docs/tracking-tool/index.html
git commit -m "fix: final adjustments after mobile integration test"
```
