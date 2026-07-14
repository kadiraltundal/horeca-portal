'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  barcode: string | null;
  imageUrl: string | null;
}

interface ScanResult {
  product: Product;
  store: {
    id: string;
    name: string;
    address: string;
  };
  storeProduct: {
    stockQuantity: number;
    shelfNumber: string | null;
  };
}

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setScanResult(null);
    setIsScanning(true);

    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await scanner.stop();
          setIsScanning(false);
          await handleScanResult(decodedText);
        },
        () => {
          // Ignore scan errors
        },
      );
    } catch (err) {
      setIsScanning(false);
      setError('Kamera erişimi reddedildi veya desteklenmiyor.');
      console.error(err);
    }
  };

  const handleScanResult = async (token: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${baseUrl}/api/v1/products/scan/${token}`,
      );

      if (!response.ok) {
        throw new Error('Ürün bulunamadı');
      }

      const data = await response.json();
      setScanResult(data);
    } catch (err) {
      setError('Ürün bilgisi alınamadı. Lütfen tekrar deneyin.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setIsScanning(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">QR Kod Tara</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div
          id={scannerContainerId}
          className="w-full h-64 bg-gray-100 rounded-lg mb-4"
        />

        <div className="flex gap-4 justify-center">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Taramaya Başla
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Taramayı Durdur
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {scanResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">{scanResult.product.name}</h3>
          
          {scanResult.product.imageUrl && (
            <img
              src={scanResult.product.imageUrl}
              alt={scanResult.product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold">Açıklama:</span>{' '}
              {scanResult.product.description || 'Açıklama yok'}
            </p>
            <p className="text-2xl font-bold text-primary-600">
              ₺{scanResult.product.price.toFixed(2)}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Stok:</span>{' '}
              {scanResult.storeProduct.stockQuantity > 0
                ? `${scanResult.storeProduct.stockQuantity} adet mevcut`
                : 'Stokta yok'}
            </p>
            {scanResult.storeProduct.shelfNumber && (
              <p className="text-gray-600">
                <span className="font-semibold">Raf:</span>{' '}
                {scanResult.storeProduct.shelfNumber}
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-semibold">Mağaza:</span>{' '}
              {scanResult.store.name}
            </p>
          </div>

          {scanResult.storeProduct.stockQuantity > 0 && (
            <button
              onClick={() => {
                alert(`${scanResult.product.name} sepete eklendi!`);
              }}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Sepete Ekle
            </button>
          )}
        </div>
      )}
    </div>
  );
}
