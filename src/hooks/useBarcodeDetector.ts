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
