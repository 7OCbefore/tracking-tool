import { useEffect, useRef, useState } from 'react';

interface UseBarcodeDetectorResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  scanning: boolean;
  error: string | null;
  torchOn: boolean;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  toggleTorch: () => Promise<void>;
}

export function useBarcodeDetector(
  onDetected?: (code: string) => void,
): UseBarcodeDetectorResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCodeRef = useRef<string>('');
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  const stopScanning = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
    setTorchOn(false);
  };

  const detectLoop = async () => {
    if (!videoRef.current || !('BarcodeDetector' in window)) return;

    try {
      const detector = new (window as any).BarcodeDetector({
        formats: ['code_128', 'code_39', 'code_93', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf'],
      });
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue.trim();
        if (code !== lastCodeRef.current) {
          lastCodeRef.current = code;
          onDetectedRef.current?.(code);
        }
      }
    } catch {
      // BarcodeDetector may throw on some frames
    }
    rafRef.current = requestAnimationFrame(detectLoop);
  };

  const startScanning = async () => {
    setError(null);
    lastCodeRef.current = '';
    setTorchOn(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          advanced: [
            { focusMode: 'continuous' },
            { exposureMode: 'continuous' },
          ] as any,
        },
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

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
    if (!capabilities?.torch) {
      setError('该设备不支持闪光灯');
      setTimeout(() => setError(null), 2000);
      return;
    }
    const newState = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: newState }] as any });
      setTorchOn(newState);
    } catch {
      setError('无法切换闪光灯');
      setTimeout(() => setError(null), 2000);
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, scanning, error, torchOn, startScanning, stopScanning, toggleTorch };
}
