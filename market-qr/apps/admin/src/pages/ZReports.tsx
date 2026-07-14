import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { zReportApi, storesApi } from '../lib/api';

interface ZReport {
  id: string;
  reportDate: string;
  totalSales: number;
  totalRefunds: number;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  transactionCount: number;
  createdAt: string;
  user?: { firstName: string; lastName: string };
}

interface Store {
  id: string;
  name: string;
}

export default function ZReports() {
  const [reports, setReports] = useState<ZReport[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    storesApi.list().then((data) => {
      const list = data.data || data;
      setStores(Array.isArray(list) ? list : []);
      if (list.length > 0) setSelectedStore(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedStore) loadReports();
  }, [selectedStore]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await zReportApi.list(selectedStore, 1, 30);
      setReports(data.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm('Gün sonu raporu oluşturmak istediğinize emin misiniz?')) return;
    try {
      setGenerating(true);
      await zReportApi.generate(selectedStore);
      loadReports();
    } catch (err: any) {
      alert(err.message || 'Rapor oluşturulamadı');
    } finally {
      setGenerating(false);
    }
  };

  const loadDailySummary = async (date?: string) => {
    try {
      const data = await zReportApi.getDaily(selectedStore, date);
      setDailySummary(data);
    } catch (err) {
      console.error('Failed to load daily summary:', err);
    }
  };

  useEffect(() => {
    if (selectedStore) {
      loadDailySummary(selectedDate || undefined);
    }
  }, [selectedStore, selectedDate]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gün Sonu Raporları</h1>
          <p className="text-gray-500">Z raporlarını ve günlük özetleri görüntüleyin</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50"
          >
            <FileText size={20} />
            {generating ? 'Oluşturuluyor...' : 'Rapor Oluştur'}
          </button>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-semibold">Günlük Özet</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm"
          />
        </div>
        {dailySummary && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600">Toplam Satış</p>
              <p className="text-2xl font-bold text-blue-700">
                {dailySummary.totalSales?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '₺0'}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">İadeler</p>
              <p className="text-2xl font-bold text-red-700">
                {dailySummary.totalRefunds?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '₺0'}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">Net Satış</p>
              <p className="text-2xl font-bold text-green-700">
                {dailySummary.netSales?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '₺0'}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600">İşlem Sayısı</p>
              <p className="text-2xl font-bold text-purple-700">{dailySummary.transactionCount || 0}</p>
            </div>
          </div>
        )}

        {dailySummary?.topProducts?.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h4 className="font-medium mb-3">En Çok Satan Ürünler</h4>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ürün</th>
                  <th className="px-3 py-2 text-right">Miktar</th>
                  <th className="px-3 py-2 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dailySummary.topProducts.map((p: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2 text-right">{p.quantity}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {p.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reports List */}
      <div>
        <h3 className="font-semibold mb-3">Rapor Geçmişi</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Henüz rapor yok</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tarih</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Kasiyer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Toplam Satış</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">İadeler</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nakit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Kart</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(report.reportDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {report.user ? `${report.user.firstName} ${report.user.lastName}` : '-'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      {report.totalSales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-600">
                      {report.totalRefunds.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {report.cashSales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {report.cardSales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="px-4 py-3 text-sm">{report.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
