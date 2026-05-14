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
    const lastCompany = localStorage.getItem('tracking_last_company');
    if (lastCompany) setCompany(lastCompany);

    const scanResult = sessionStorage.getItem('scan_result');
    if (scanResult) {
      setTrackingNumber(scanResult);
      sessionStorage.removeItem('scan_result');
    }
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
