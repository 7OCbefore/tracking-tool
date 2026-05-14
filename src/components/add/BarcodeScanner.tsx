import { useBarcodeDetector } from '@/hooks/useBarcodeDetector';
import { useUIStore } from '@/stores/uiStore';

export default function BarcodeScanner() {
  const goBack = useUIStore((s) => s.goBack);
  const navigate = useUIStore((s) => s.navigate);

  const { videoRef, scanning, error, startScanning, stopScanning } =
    useBarcodeDetector((code) => {
      navigate('add');
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
