'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Camera, CameraOff, Zap } from 'lucide-react';

interface QrScannerModalProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        startScanning();
      }
    } catch (err: any) {
      setError(err.message || 'Kamera erişilemedi');
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const startScanning = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const scan = () => {
      if (!video.videoWidth || !video.videoHeight) {
        animFrameRef.current = requestAnimationFrame(scan);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Simple barcode/QR detection using BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39'] });
        detector.detect(canvas).then((barcodes: any[]) => {
          if (barcodes.length > 0) {
            onScan(barcodes[0].rawValue);
            return;
          }
          animFrameRef.current = requestAnimationFrame(scan);
        }).catch(() => {
          animFrameRef.current = requestAnimationFrame(scan);
        });
      } else {
        // Fallback: no native detection, just show camera preview
        // User can manually type barcode
        animFrameRef.current = requestAnimationFrame(scan);
      }
    };

    animFrameRef.current = requestAnimationFrame(scan);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn } as any],
        });
        setTorchOn(!torchOn);
      }
    } catch {
      // torch not supported
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <div className="flex items-center gap-2">
          <Camera size={20} className="text-white" />
          <span className="text-white font-semibold">QR / Barkod Tarama</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTorch}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              torchOn ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Flash"
          >
            <Zap size={18} />
          </button>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-9 h-9 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
            {scanning && (
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-green-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute bottom-20 left-4 right-4 bg-red-600 text-white p-4 rounded-xl text-center">
            <CameraOff size={32} className="mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <p className="text-sm mt-1 text-red-200">Kamera iznini tarayıcı ayarlarından kontrol edin</p>
          </div>
        )}

        {/* Scanning status */}
        {!error && (
          <div className="absolute bottom-20 left-4 right-4 text-center">
            <div className="inline-flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {scanning ? 'Karekod aranıyor...' : 'Kamera başlatılıyor...'}
            </div>
          </div>
        )}
      </div>

      {/* Manual input fallback */}
      <div className="bg-gray-900 px-4 py-4">
        <p className="text-gray-400 text-xs text-center mb-2">Kamera çalışmıyorsa barkodu manuel girin</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Barkod veya QR token"
            className="flex-1 h-12 px-4 bg-gray-800 text-white border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  onScan(target.value.trim());
                }
              }
            }}
            autoFocus
          />
          <button
            onClick={() => {
              const input = document.querySelector('.bg-gray-900 input') as HTMLInputElement;
              if (input?.value.trim()) {
                onScan(input.value.trim());
              }
            }}
            className="h-12 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Tara
          </button>
        </div>
      </div>
    </div>
  );
}
