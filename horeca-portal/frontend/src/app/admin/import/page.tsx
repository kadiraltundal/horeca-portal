'use client';

import { useState, useRef } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';

interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: string[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Faqat CSV fayllarni yuklash mumkin');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Fayl tanlanmagan');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const importResult: ImportResult = await api.importProducts(file);
      setResult(importResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import xatolik');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await api.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'horeca_product_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Shablon yuklashda xatolik');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              ← Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mahsulot Import</h1>
          <p className="text-gray-600 mt-1">CSV fayli orqali mahsulotlarni to'plam import qilish</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Import Qo'llanmasi</h2>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Shablon faylni yuklab oling</li>
            <li>Excel yoki boshqa dasturda oching</li>
            <li>Mahsulot ma'lumotlarini to'ldiring</li>
            <li>CSV formatida saqlang</li>
            <li>Yuklab oling va "Import" tugmasini bosing</li>
          </ol>
          <div className="mt-3">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Shablon Yuklab Olish
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CSV Fayl Yuklash</h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {file ? (
              <div>
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 font-medium">{file.name}</p>
                <p className="text-green-600 text-sm mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="mt-3 text-sm text-red-600 hover:text-red-800"
                >
                  Faylni o'chirish
                </button>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600">
                  CSV faylni bu yerga tashlang yoki{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    tanlang
                  </button>
                </p>
                <p className="text-gray-400 text-sm mt-1">.csv formatida</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`mt-4 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              file && !isUploading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Import qilinmoqda...
              </span>
            ) : (
              'Import Qilish'
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Natijalari</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className={result.success ? 'text-green-800 font-medium' : 'text-red-800 font-medium'}>
                  {result.success ? 'Import muvaffaqiyatli yakunlandi!' : 'Import xatolik bilan yakunlandi'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{result.totalRows}</p>
                <p className="text-sm text-gray-600">Jami qator</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                <p className="text-sm text-gray-600">Import qilindi</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
                <p className="text-sm text-gray-600">O'tkazib yuborildi</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{result.warnings.length}</p>
                <p className="text-sm text-gray-600">Ogohlantirishlar</p>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-yellow-800 mb-2">Ogohlantirishlar:</h3>
                <div className="bg-yellow-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {result.warnings.map((warning, idx) => (
                    <p key={idx} className="text-sm text-yellow-700">{warning}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <h3 className="font-medium text-red-800 mb-2">Xatoliklar:</h3>
                <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <p key={idx} className="text-sm text-red-700">
                      Qator {err.row}: {err.message}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CSV Format Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CSV Format Ma'lumotlari</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Ustun</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Majburiy</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Tavsif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><td className="px-4 py-2">sku</td><td className="px-4 py-2 text-green-600">Ha</td><td className="px-4 py-2">Unikal mahsulot kodi</td></tr>
                <tr><td className="px-4 py-2">name_uz</td><td className="px-4 py-2 text-green-600">Ha</td><td className="px-4 py-2">Mahsulot nomi (o'zbekcha)</td></tr>
                <tr><td className="px-4 py-2">name_ru</td><td className="px-4 py-2 text-gray-400">Yo'q</td><td className="px-4 py-2">Mahsulot nomi (ruscha)</td></tr>
                <tr><td className="px-4 py-2">category_name</td><td className="px-4 py-2 text-gray-400">Yo'q</td><td className="px-4 py-2">Kategoriya nomi (avtomatik yaratiladi)</td></tr>
                <tr><td className="px-4 py-2">brand_name</td><td className="px-4 py-2 text-gray-400">Yo'q</td><td className="px-4 py-2">Brend nomi (avtomatik yaratiladi)</td></tr>
                <tr><td className="px-4 py-2">cost_price</td><td className="px-4 py-2 text-green-600">Ha</td><td className="px-4 py-2">Alish narxi (UZS)</td></tr>
                <tr><td className="px-4 py-2">margin_percentage</td><td className="px-4 py-2 text-green-600">Ha</td><td className="px-4 py-2">Kâr foizi (0-100)</td></tr>
                <tr><td className="px-4 py-2">additional_costs</td><td className="px-4 py-2 text-gray-400">Yo'q</td><td className="px-4 py-2">Qo'shimcha xarajatlar</td></tr>
                <tr><td className="px-4 py-2">tier1_min, tier1_max, tier1_price</td><td className="px-4 py-2 text-gray-400">Yo'q</td><td className="px-4 py-2">Narx kademalari (ixtiyoriy)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
