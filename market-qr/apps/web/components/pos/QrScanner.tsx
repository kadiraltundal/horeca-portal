'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, ScanLine } from 'lucide-react';

interface QrScannerProps {
  onScan: (token: string) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-scanner-container';

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        async (decodedText) => {
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
          }
          setIsScanning(false);
          onScan(decodedText);
        },
        () => {},
      );
    } catch {
      setIsScanning(false);
      setError('Kamera erişimi reddedildi');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setIsScanning(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <ScanLine size={20} className="text-primary-600" />
        <h3 className="font-semibold">QR Kod Tara</h3>
      </div>

      <div
        id={containerId}
        className="w-full h-48 bg-gray-100 rounded-lg mb-3 overflow-hidden"
      />

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</div>
      )}

      <div className="flex gap-2">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            <Camera size={18} />
            Taramaya Başla
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            <CameraOff size={18} />
            Durdur
          </button>
        )}
      </div>
    </div>
  );
}
