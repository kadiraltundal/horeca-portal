import { useState } from 'react';
import { FileText, Download, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type ReportType = 'satis' | 'stok' | 'finansal' | 'musteri' | 'urun' | 'tedarikci';

const reportTypes: { key: ReportType; label: string; icon: any }[] = [
  { key: 'satis', label: 'Satış Raporu', icon: BarChart3 },
  { key: 'stok', label: 'Stok Raporu', icon: FileText },
  { key: 'finansal', label: 'Finansal Rapor', icon: FileText },
  { key: 'musteri', label: 'Müşteri Raporu', icon: FileText },
  { key: 'urun', label: 'Ürün Raporu', icon: FileText },
  { key: 'tedarikci', label: 'Tedarikçi Raporu', icon: FileText },
];

export default function Reports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType>('satis');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState<any>(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  const generateReport = async () => {
    if (!token) return;
    setLoading(true);
    setReportGenerated(false);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const response = await fetch(`${API_URL}/reports/${selectedReport}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dateRange),
      });
      const data = await response.json();
      setReportData(data.data || data);
      setReportGenerated(true);
    } catch (error) {
      console.error('Report error:', error);
      alert('Rapor oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!token || !reportGenerated) return;
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const response = await fetch(`${API_URL}/reports/${selectedReport}/export`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...dateRange, format }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}_rapor.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Dışa aktarma başarısız');
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    if (selectedReport === 'satis' && reportData.sales) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Toplam Satış</p>
              <p className="text-2xl font-bold text-primary-600">₺{reportData.sales.totalSales?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Sipariş Sayısı</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.sales.orderCount || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Ortalama Sipariş</p>
              <p className="text-2xl font-bold text-green-600">₺{reportData.sales.averageOrder?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">En Çok Satan</p>
              <p className="text-lg font-bold text-yellow-600">{reportData.sales.topProduct || '-'}</p>
            </div>
          </div>
          {reportData.sales.daily && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-4">Günlük Satışlar</h4>
              <div className="space-y-2">
                {reportData.sales.daily.map((day: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{day.date}</span>
                    <span className="font-medium">₺{day.amount?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (selectedReport === 'stok' && reportData.stock) {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mevcut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(reportData.stock.items || []).map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.minStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.currentStock < item.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.currentStock < item.minStock ? 'Kritik' : 'Yeterli'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (selectedReport === 'finansal' && reportData.financial) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Gelir</p>
              <p className="text-2xl font-bold text-green-600">₺{reportData.financial.revenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Gider</p>
              <p className="text-2xl font-bold text-red-600">₺{reportData.financial.expenses?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Kâr</p>
              <p className="text-2xl font-bold text-primary-600">₺{reportData.financial.profit?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Rapor Verileri</h4>
        <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(reportData, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Raporlar</h2>
        {reportGenerated && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
            >
              <Download size={20} />
              PDF İndir
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Download size={20} />
              Excel İndir
            </button>
          </div>
        )}
      </div>

      {/* Rapor Tipi Seçimi */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.key}
              onClick={() => setSelectedReport(type.key)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedReport === type.key
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon size={24} className={selectedReport === type.key ? 'text-primary-600' : 'text-gray-400'} />
              <p className={`mt-2 text-sm font-medium ${selectedReport === type.key ? 'text-primary-600' : 'text-gray-700'}`}>
                {type.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Tarih Aralığı */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            <span className="font-medium">Tarih Aralığı:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Oluşturuluyor...' : 'Rapor Oluştur'}
          </button>
        </div>
      </div>

      {/* Rapor Sonucu */}
      {reportGenerated && (
        <div>
          <h3 className="text-lg font-semibold mb-4">{reportTypes.find(t => t.key === selectedReport)?.label}</h3>
          {renderReportContent()}
        </div>
      )}
    </div>
  );
}
