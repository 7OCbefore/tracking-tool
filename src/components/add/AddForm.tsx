import { useState, useEffect } from 'react';
import { usePackageStore } from '@/stores/packageStore';
import { useUIStore } from '@/stores/uiStore';

export default function AddForm() {
  const add = usePackageStore((s) => s.add);
  const goBack = useUIStore((s) => s.goBack);
  const showToast = useUIStore((s) => s.showToast);
  const searchToAdd = useUIStore((s) => s.searchToAdd);
  const setSearchToAdd = useUIStore((s) => s.setSearchToAdd);

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

  const [number, setNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [region, setRegion] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 自动记忆：加载上次输入的客户、地区和备注
    const lastCustomer = localStorage.getItem('tracking_last_customer');
    const lastRegion = localStorage.getItem('tracking_last_region');
    const lastNotes = localStorage.getItem('tracking_last_notes');
    if (lastCustomer) setCustomer(lastCustomer);
    if (lastRegion) setRegion(lastRegion);
    if (lastNotes) setNotes(lastNotes);

    // 读取扫码结果
    const scanResult = sessionStorage.getItem('scan_result');
    if (scanResult) {
      setNumber(scanResult);
      sessionStorage.removeItem('scan_result');
    }

    if (searchToAdd) {
      setNumber(searchToAdd);
      setSearchToAdd(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      localStorage.setItem('tracking_last_notes', notes.trim());
      return true;
    } catch {
      showToast('添加失败，请重试', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

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
      // Re-focus number input for next entry
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('#add-form input[type="text"]');
        input?.focus();
      }, 100);
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

      <form id="add-form" onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            快递单号 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="输入快递单号"
            autoFocus
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-base
                       focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
                       placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">客户名称（选填）</label>
          <input
            type="text"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="输入客户名称（选填）"
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-base
                       focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
                       placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">地区（选填）</label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="如：上海、北京、广东（选填）"
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-base
                       focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
                       placeholder:text-gray-300"
          />
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注（可选）</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="如：订单号、商品名称"
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
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={saving}
          className="w-full py-3.5 bg-white text-brand rounded-xl font-medium text-base
                     border-2 border-brand disabled:opacity-50 active:bg-blue-50 transition-colors"
        >
          {saving ? '保存中...' : '保存并继续添加'}
        </button>
      </form>
    </div>
  );
}
