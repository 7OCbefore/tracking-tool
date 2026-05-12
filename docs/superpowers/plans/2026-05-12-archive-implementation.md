# 半年归档方案 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable unlimited long-term use of the tracking tool by adding IndexedDB storage, paginated rendering, half-year archive/clear, and temporary read-only CSV import.

**Architecture:** IndexedDB replaces localStorage as the primary record store. The in-memory `appData` array remains as a cache for rendering. IndexedDB operations are async (Promise-based). LocalStorage is retained for small metadata (last input, last archive date). Pagination renders 50 cards at a time with infinite scroll.

**Tech Stack:** IndexedDB API, Blob/URL download, FileReader for CSV import. Zero dependencies.

---

### Task 1: IndexedDB data layer

**Files:**
- Modify: `E:\Development\Personal\docs\index.html` — replace the data layer functions

**Scope:** Replace the localStorage-based data layer with IndexedDB. Keep `appData` as an in-memory cache but use IndexedDB for persistence. LocalStorage retains metadata only (lastInput, lastArchiveDate).

- [ ] **Step 1: Add IndexedDB wrapper + modify data functions**

Replace the data layer section (from `// === Data Layer V2 ===` through `// === Init ===` including `loadData(); render();`) with:

```javascript
// === Data Layer V2 — IndexedDB ===

var STORAGE_KEY = 'tracking_data_v2';
var INPUT_KEY = 'tracking_last_input';
var META_KEY = 'tracking_meta';
var appData = [];
var currentTab = 'pending';
var batchMode = false;
var batchSelected = {};
var pendingDeleteId = null;
var pendingDeleteTimer = null;
var dbReady = false;
var dbQueue = [];  // queued operations before DB is ready

// === IndexedDB ===

function openDB() {
  return new Promise(function(resolve, reject) {
    var req = indexedDB.open('tracking_tool', 1);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains('records')) {
        var store = db.createObjectStore('records', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('received', 'received', { unique: false });
      }
    };
    req.onsuccess = function(e) {
      dbReady = true;
      resolve(e.target.result);
      // Process queued operations
      while (dbQueue.length > 0) { dbQueue.shift()(); }
    };
    req.onerror = function(e) {
      reject(e.target.error);
    };
  });
}

function withDB(callback) {
  return new Promise(function(resolve, reject) {
    if (!dbReady) {
      dbQueue.push(function() { withDB(callback).then(resolve).catch(reject); });
      return;
    }
    var req = indexedDB.open('tracking_tool', 1);
    req.onsuccess = function(e) {
      var db = e.target.result;
      try {
        var result = callback(db);
        db.close();
        resolve(result);
      } catch (err) {
        db.close();
        reject(err);
      }
    };
    req.onerror = function(e) { reject(e.target.error); };
  });
}

function dbGetAllRecords() {
  return withDB(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction('records', 'readonly');
      var store = tx.objectStore('records');
      var req = store.getAll();
      req.onsuccess = function() { resolve(req.result); };
      req.onerror = function() { reject(req.error); };
    });
  });
}

function dbAddRecord(record) {
  return withDB(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction('records', 'readwrite');
      var store = tx.objectStore('records');
      var req = store.add(record);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  });
}

function dbPutRecord(record) {
  return withDB(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction('records', 'readwrite');
      var store = tx.objectStore('records');
      var req = store.put(record);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  });
}

function dbAddMany(records) {
  return withDB(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction('records', 'readwrite');
      var store = tx.objectStore('records');
      var completed = 0;
      for (var i = 0; i < records.length; i++) {
        var req = store.add(records[i]);
        req.onsuccess = function() {
          completed++;
          if (completed >= records.length) resolve();
        };
        req.onerror = function() { reject(this.error); };
      }
      if (records.length === 0) resolve();
    });
  });
}

function dbDeleteRecord(id) {
  return withDB(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction('records', 'readwrite');
      var store = tx.objectStore('records');
      var req = store.delete(id);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  });
}

function dbClearAll() {
  return withDB(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction('records', 'readwrite');
      var store = tx.objectStore('records');
      var req = store.clear();
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  });
}

function dbCount() {
  return withDB(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction('records', 'readonly');
      var store = tx.objectStore('records');
      var req = store.count();
      req.onsuccess = function() { resolve(req.result); };
      req.onerror = function() { reject(req.error); };
    });
  });
}

// === Data CRUD (sync appData + async IndexedDB) ===

function loadData() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      appData = JSON.parse(raw);
      // Migrate from localStorage to IndexedDB
      if (appData.length > 0) {
        dbAddMany(appData).then(function() {
          localStorage.removeItem(STORAGE_KEY);
        }).catch(function() {});
      }
    }
  } catch (e) {
    appData = [];
  }
  // Load from IndexedDB if localStorage was empty
  if (appData.length === 0) {
    dbGetAllRecords().then(function(records) {
      records.sort(function(a, b) { return b.createdAt - a.createdAt; });
      appData = records;
      render();
    }).catch(function() {
      appData = [];
    });
  }
}

function saveRecord(record) {
  dbPutRecord(record).catch(function(e) {
    console.log('DB save error:', e);
  });
}

function saveData() {
  // No-op: data auto-syncs via individual saveRecord calls
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function addRecord(number, customer, region, notes) {
  var record = {
    id: generateId(),
    number: number.trim(),
    customer: customer ? customer.trim() : '',
    region: region ? region.trim() : '',
    notes: notes ? notes.trim() : '',
    date: new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }),
    received: false,
    receivedAt: null,
    createdAt: Date.now(),
    schemaVersion: 2
  };
  appData.unshift(record);
  dbAddRecord(record).catch(function(e) { console.log('DB add error:', e); });
  saveLastInput(record.customer, record.region);
  return record;
}

function deleteRecord(id) {
  appData = appData.filter(function(r) { return r.id !== id; });
  dbDeleteRecord(id).catch(function(e) { console.log('DB del error:', e); });
}

function softDelete(id) {
  var record = appData.find(function(r) { return r.id === id; });
  if (!record) return;
  pendingDeleteId = id;
  showToast('已删除 ' + record.number, '撤销', function() {
    undoDelete();
  });
  if (pendingDeleteTimer) clearTimeout(pendingDeleteTimer);
  pendingDeleteTimer = setTimeout(function() {
    if (pendingDeleteId === id) {
      deleteRecord(id);
      pendingDeleteId = null;
    }
    hideToast();
  }, 5000);
}

function undoDelete() {
  if (pendingDeleteId) {
    pendingDeleteId = null;
    hideToast();
    render();
  }
}

function toggleReceived(id) {
  var record = appData.find(function(r) { return r.id === id; });
  if (!record) return;
  record.received = !record.received;
  record.receivedAt = record.received ? Date.now() : null;
  saveRecord(record);
}

function batchMarkReceived(ids) {
  var count = 0;
  ids.forEach(function(id) {
    var record = appData.find(function(r) { return r.id === id; });
    if (record && !record.received) {
      record.received = true;
      record.receivedAt = Date.now();
      saveRecord(record);
      count++;
    }
  });
  exitBatchMode();
  render();
  return count;
}

function getFilteredData(query) {
  var records = appData.filter(function(r) {
    return currentTab === 'pending' ? !r.received : r.received;
  });
  if (!query) return records;
  var q = query.trim().toLowerCase();
  return records.filter(function(r) {
    var num = r.number.toLowerCase();
    return num.indexOf(q) !== -1 || q.indexOf(num) !== -1 ||
      (r.customer && r.customer.toLowerCase().indexOf(q) !== -1) ||
      (r.region && r.region.toLowerCase().indexOf(q) !== -1) ||
      (r.notes && r.notes.toLowerCase().indexOf(q) !== -1);
  });
}
```

- [ ] **Step 2: Update init to be async**

Replace the init block with:

```javascript
// === Init ===
openDB().then(function() { loadData(); }).then(function() { render(); }).catch(function() { render(); });
```

- [ ] **Step 3: Update exportCSV to use current appData (unchanged, already works)**

Read the existing exportCSV function — it already reads from `appData` which is the in-memory cache. No changes needed.

- [ ] **Step 4: Verify in browser**

Open browser console:
```javascript
addRecord('SF123', '张三', '北京');
// Refresh page — data should persist via IndexedDB

dbCount().then(function(c) { console.log('DB count:', c); });
// Should return 1
```

- [ ] **Step 5: Commit**

```bash
git add docs/index.html
git commit -m "feat: migrate data layer from localStorage to IndexedDB"
```

---

### Task 2: Pagination + infinite scroll

**Files:**
- Modify: `E:\Development\Personal\docs\index.html` — modify render() and add scroll handler

- [ ] **Step 1: Add pagination state and functions**

Append after the data layer functions:

```javascript
// === Pagination ===

var PAGE_SIZE = 50;
var currentPage = 1;
var isLoadingMore = false;
var hasMore = true;

function resetPagination() {
  currentPage = 1;
  hasMore = true;
}

function loadMore() {
  if (isLoadingMore || !hasMore) return;
  isLoadingMore = true;
  currentPage++;
  render();
}
```

- [ ] **Step 2: Modify render() for paginated output**

Replace the card-rendering section inside `render()` (from `container.innerHTML = data.map(function(record)...` through `.join('');`) with:

```javascript
  // Pagination
  var totalFiltered = data.length;
  var endIndex = currentPage * PAGE_SIZE;
  if (endIndex >= totalFiltered) {
    endIndex = totalFiltered;
    hasMore = false;
  } else {
    hasMore = true;
  }

  container.innerHTML = data.slice(0, endIndex).map(function(record) {
    // ... existing card HTML template (unchanged inner template) ...
  }).join('');

  // Load more button or spacer
  if (hasMore) {
    container.innerHTML += '<div id="load-more" class="load-more" onclick="loadMore()">显示更多 (已加载 ' + endIndex + '/' + totalFiltered + ')</div>';
  } else if (totalFiltered > PAGE_SIZE) {
    container.innerHTML += '<div class="load-more load-more-done">已加载全部 ' + totalFiltered + ' 条</div>';
  }
```

- [ ] **Step 3: Add infinite scroll listener**

Append after render():

```javascript
// === Infinite scroll ===

var scrollCheckTimer = null;
document.getElementById('card-list').addEventListener('scroll', function() {
  clearTimeout(scrollCheckTimer);
  scrollCheckTimer = setTimeout(function() {
    var el = document.getElementById('card-list');
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      loadMore();
    }
  }, 200);
});
```

- [ ] **Step 4: Add pagination CSS**

```css
.load-more { text-align: center; padding: 16px; color: #1890ff; font-size: 14px; cursor: pointer; }
.load-more:active { background: #f5f5f5; border-radius: 8px; }
.load-more-done { color: #999; cursor: default; }
```

- [ ] **Step 5: Test pagination**

Create 60+ records, verify:
- Only 50 render initially
- Scroll to bottom → "load more" appears
- Click/scroll → loads next batch
- Search respects pagination (resets page to 1)

- [ ] **Step 6: Commit**

```bash
git add docs/index.html
git commit -m "feat: add paginated rendering with infinite scroll (50 per page)"
```

---

### Task 3: Archive flow

**Files:**
- Modify: `E:\Development\Personal\docs\index.html` — add archive functions + FAB menu update

- [ ] **Step 1: Add metadata helpers**

Append after the data layer functions:

```javascript
// === Metadata ===

function getMeta(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) { return null; }
}

function setMeta(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}

function getLastArchiveDate() { return getMeta('lastArchiveDate'); }

function setLastArchiveDate(date) { setMeta('lastArchiveDate', date); }
```

- [ ] **Step 2: Add archive function**

Append:

```javascript
// === Archive ===

function archiveData() {
  var count = appData.length;
  if (count === 0) { alert('当前没有数据需要归档'); return; }

  var startDate = new Date();
  var half = startDate.getMonth() < 6 ? '上半年' : '下半年';
  var year = startDate.getFullYear();
  var dateStr = startDate.toISOString().slice(0, 10);
  var filename = year + half + '_快递记录_' + dateStr + '.csv';
  var newTab = currentTab;

  if (!confirm('当前共 ' + count + ' 条记录，将导出为：\n' + filename + '\n\n导出后会清空当前数据开始新的半年。\n确定继续吗？')) return;

  // Export
  var rows = [['快递单号', '客户名称', '地区', '录入日期', '状态', '备注']];
  appData.forEach(function(r) {
    rows.push([r.number, r.customer, r.region, r.date, r.received ? '已收到' : '待收件', r.notes]);
  });
  var csv = rows.map(function(row) {
    return row.map(function(cell) { return '"' + (cell || '').replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  var BOM = '﻿';
  var blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  // Clear all data
  dbClearAll().then(function() {
    appData = [];
    setLastArchiveDate(dateStr);
    resetPagination();
    exitBatchMode();
    render();
    alert('归档完成！已导出 ' + count + ' 条记录并清零开始新的半年。\n\n文件名：' + filename);
  }).catch(function() {
    alert('归档失败，请重试');
  });
}
```

- [ ] **Step 3: Update FAB menu HTML**

Find the FAB menu in the HTML and add the archive button after the import button:

```html
      <button onclick="toggleFabMenu(); archiveData();">归档</button>
```

- [ ] **Step 4: Test archive flow**

1. Create a few records
2. Tap 📋 → 归档
3. Confirm dialog appears with record count
4. CSV downloads
5. Data clears, list is empty
6. Refresh page → data is gone (verified by IndexedDB clear)

- [ ] **Step 5: Commit**

```bash
git add docs/index.html
git commit -m "feat: add half-year archive flow with CSV export and data clear"
```

---

### Task 4: Temporary read-only CSV import

**Files:**
- Modify: `E:\Development\Personal\docs\index.html`

- [ ] **Step 1: Add temp view state and import function**

Append:

```javascript
// === Temporary CSV View ===

var importedViewData = null;
var isViewingImported = false;

function importTempCSV() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      var lines = text.split(/\r?\n/).filter(function(l) { return l.trim(); });
      var records = [];
      var errors = 0;
      for (var i = 1; i < lines.length; i++) {
        var parts = parseCSVLine(lines[i]);
        if (parts.length >= 3 && parts[0]) {
          records.push({
            number: parts[0],
            customer: parts[1] || '',
            region: parts[2] || '',
            notes: parts[3] || '',
            date: parts[4] || '',
            received: (parts[5] || '').indexOf('已收') !== -1
          });
        } else {
          errors++;
        }
      }
      if (records.length === 0) {
        alert('无法解析 CSV 文件，请确认格式正确');
        return;
      }
      importedViewData = records;
      isViewingImported = true;
      currentTab = 'pending';
      showScreen('screen-list');
      render();
      alert('已加载 ' + records.length + ' 条历史记录（只读模式）\n顶部黄色条提示当前为查看模式，点「返回当前数据」恢复');
    };
    reader.readAsText(file, 'UTF-8');
  };
  input.click();
}

function exitImportedView() {
  isViewingImported = false;
  importedViewData = null;
  resetPagination();
  render();
}
```

- [ ] **Step 2: Modify render() to check importedView**

Find the line `var data = getFilteredData(query);` in render() and replace it with:

```javascript
  var data;
  if (isViewingImported && importedViewData) {
    data = importedViewData;
    if (query) {
      var q = query.trim().toLowerCase();
      data = importedViewData.filter(function(r) {
        var num = (r.number || '').toLowerCase();
        return num.indexOf(q) !== -1 || q.indexOf(num) !== -1 ||
          (r.customer && r.customer.toLowerCase().indexOf(q) !== -1) ||
          (r.region && r.region.toLowerCase().indexOf(q) !== -1);
      });
    }
    // Filter by currentTab for imported data
    data = data.filter(function(r) {
      return currentTab === 'pending' ? !r.received : r.received;
    });
  } else {
    data = getFilteredData(query);
  }
```

- [ ] **Step 3: Add imported view banner to render**

After the stats line in render(), add:

```javascript
  // Show imported view banner
  var banner = document.getElementById('import-banner');
  if (isViewingImported && importedViewData) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'import-banner';
      banner.className = 'import-banner';
      banner.innerHTML = '<span>📄 查看历史数据 · 共 ' + importedViewData.length + ' 条</span><button onclick="exitImportedView()">返回当前数据</button>';
      document.getElementById('card-list').parentNode.insertBefore(banner, document.getElementById('card-list'));
    }
  } else if (banner) {
    banner.parentNode.removeChild(banner);
  }
```

Also add banner CSS:

```css
.import-banner {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; background: #fffbe6; border-bottom: 1px solid #ffe58f;
  font-size: 14px; color: #ad8b00;
}
.import-banner button {
  padding: 6px 14px; border: 1px solid #ffe58f; border-radius: 6px;
  background: #fff; color: #ad8b00; font-size: 13px; cursor: pointer;
}
```

- [ ] **Step 4: Disable editing in imported view**

In the card template inside render(), wrap editing controls:

```javascript
    // Only add check-btn for current data (not imported view)
    if (currentTab === 'pending' && !batchMode && !isViewingImported) {
      checkBtnHtml = '<button class="card-check-btn" onclick="event.stopPropagation(); toggleReceived(\'' + record.id + '\'); render();"></button>';
    }
```

And in the card onclick:
```javascript
    onclick="' + (batchMode ? 'toggleBatchSelect(\'' + record.id + '\')' : isViewingImported ? '' : 'showDetail(\'' + record.id + '\')') + '"
```

- [ ] **Step 5: Add temporary view button to FAB menu**

Find the FAB menu in HTML and add after the import button:

```html
      <button onclick="toggleFabMenu(); importTempCSV();">临时查看</button>
```

- [ ] **Step 6: Test temp CSV view**

1. Archive some data first (export CSV)
2. Tap 📋 → 临时查看 → select the CSV
3. Yellow banner appears with record count
4. Tab switching, search work
5. Card click does nothing (read-only)
6. Check button not shown
7. Tap "返回当前数据" → current data restored

- [ ] **Step 7: Commit**

```bash
git add docs/index.html
git commit -m "feat: add temporary read-only CSV import for viewing historical data"
```

---

### Task 5: Storage statistics + version bump

**Files:**
- Modify: `E:\Development\Personal\docs\index.html`

- [ ] **Step 1: Update stats line to show archive date**

Modify the stats line in render() (around line where `statsEl.textContent = '共...'`):

```javascript
  var archiveDate = getLastArchiveDate();
  var statsText = '共' + total + '条 · 已收' + received + ' · 待收' + pending;
  if (archiveDate) statsText += ' | 归档: ' + archiveDate;
  statsEl.textContent = statsText;
```

- [ ] **Step 2: Bump version**

Update title, h1, and manifest.json version to `v3.0` (major version due to storage engine change).

- [ ] **Step 3: Commit**

```bash
git add docs/index.html docs/manifest.json
git commit -m "feat: add storage stats, bump v3.0 for IndexedDB migration"
```

---

### Task 6: Deploy

- [ ] **Step 1: Push**

```bash
git push origin master
```

- [ ] **Step 2: Verify on phone**

Open https://7ocbefore.github.io/tracking-tool/. Test:
1. Add a record → refresh → persists
2. Add 55 records → scroll → loads more
3. Archive → CSV downloads → data clears
4. Temp import CSV → view history → return
5. Stats show record count + last archive date
