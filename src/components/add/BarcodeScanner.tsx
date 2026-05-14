import { useState, useCallback, useEffect } from 'react';
import { useBarcodeDetector } from '@/hooks/useBarcodeDetector';
import { useUIStore } from '@/stores/uiStore';
import { db } from '@/services/db';
import { formatDateTime } from '@/utils/format';
import type { Package } from '@/types/package';

interface MatchResult {
  type: 'match' | 'no-match';
  code: string;
  pkg?: Package;
}

export default function BarcodeScanner() {
  const goBack = useUIStore((s) => s.goBack);
  const navigate = useUIStore((s) => s.navigate);
  const [scanCount, setScanCount] = useState(0);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [flash, setFlash] = useState<'green' | 'orange' | null>(null);

  const triggerFlash = useCallback((color: 'green' | 'orange') => {
    setFlash(color);
    setTimeout(() => setFlash(null), 300);
  }, []);

  const handleDetected = useCallback(async (code: string) => {
    try {
      const all = await db.packages
        .where('isArchived')
        .equals(0)
        .filter((p) => p.status === 'pending')
        .toArray();

      const q = code.toLowerCase();
      const match = all.find((p) => {
        const num = p.number.toLowerCase();
        return num.includes(q) || q.includes(num);
      });

      if (match) {
        await db.packages.update(match.id, {
          status: 'received',
          receivedAt: Date.now(),
        });
        setScanCount((c) => c + 1);
        setLastResult({ type: 'match', code, pkg: match });
        triggerFlash('green');
        if (navigator.vibrate) navigator.vibrate(50);
      } else {
        setLastResult({ type: 'no-match', code });
        triggerFlash('orange');
      }
    } catch {
      // Silently continue scanning
    }
  }, [triggerFlash]);

  const { videoRef, scanning, error, startScanning, stopScanning } =
    useBarcodeDetector(handleDetected);

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  const handleClose = () => {
    stopScanning();
    goBack();
  };

  const handleViewDetail = () => {
    if (lastResult?.type === 'match' && lastResult.pkg) {
      stopScanning();
      navigate('detail', { id: lastResult.pkg.id });
    }
  };

  const flashBg =
    flash === 'green' ? 'bg-green-500/30' :
    flash === 'orange' ? 'bg-orange-400/30' : '';

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-4 pt-12 pb-4 safe-top">
        <button onClick={handleClose} className="text-white p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-white text-sm font-medium">扫码匹配</span>
        <span className="text-white text-sm font-mono tabular-nums min-w-[4rem] text-right">
          {scanCount > 0 ? `✓ ${scanCount}单` : ''}
        </span>
      </div>

      {/* Camera + flash overlay */}
      <div className="relative flex-1">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline />
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-200 ${flashBg}`} />

        {/* Scan frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-48 border-2 border-white/50 rounded-2xl" />
        </div>

        {/* Result card */}
        {lastResult && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            {lastResult.type === 'match' && lastResult.pkg ? (
              <div className="bg-white rounded-2xl p-4 shadow-xl animate-slide-up">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                  <span className="text-sm font-medium text-green-700">已匹配 — 已自动标记已收到</span>
                </div>
                <div className="h-px bg-gray-100 mb-3" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">单号</span>
                    <span className="font-mono text-base font-semibold text-gray-900 tracking-wider">{lastResult.code}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">客户</span>
                      <span className="text-sm text-gray-700">{lastResult.pkg.customer || '未填写'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">地区</span>
                      <span className="text-sm text-gray-700">{lastResult.pkg.region || '未填写'}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">日期</span>
                      <span className="text-sm text-gray-700">
                        {lastResult.pkg.createdAt ? formatDateTime(lastResult.pkg.createdAt) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">状态</span>
                      <span className="text-sm text-green-600 font-medium">已收到</span>
                    </div>
                  </div>
                  {lastResult.pkg.notes && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">备注</span>
                      <span className="text-sm text-gray-500">{lastResult.pkg.notes}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleViewDetail}
                  className="w-full mt-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium
                             active:bg-blue-100 transition-colors"
                >
                  查看完整信息
                </button>
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur rounded-2xl p-4 text-center animate-slide-up">
                <p className="font-mono text-lg text-white tracking-wider">{lastResult.code}</p>
                <p className="text-sm text-orange-300 mt-1">未找到匹配记录</p>
                <p className="text-xs text-white/40 mt-1">单号不在列表中，继续扫描...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Start button */}
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
