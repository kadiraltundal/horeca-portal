import { useEffect, useState } from 'react';
import { Plus, X, Clock, Users, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const statusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
  INACTIVE: { label: 'Pasif', color: 'bg-gray-100 text-gray-800' },
  ON_LEAVE: { label: 'İzinli', color: 'bg-yellow-100 text-yellow-800' },
};

type Tab = 'vardiya' | 'puantaj' | 'performans';

export default function Staff() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('vardiya');
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    days: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [shiftsRes, attendanceRes, perfRes] = await Promise.all([
        fetch(`${API_URL}/staff/shifts`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/staff/attendance`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/staff/performance`, { headers }).then(r => r.json()),
      ]);
      setShifts(Array.isArray(shiftsRes) ? shiftsRes : shiftsRes.data || []);
      setAttendance(Array.isArray(attendanceRes) ? attendanceRes : attendanceRes.data || []);
      setPerformance(Array.isArray(perfRes) ? perfRes : perfRes.data || []);
    } catch (error) {
      console.error('Staff load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await fetch(`${API_URL}/staff/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(shiftForm),
      });
      setShowShiftModal(false);
      setShiftForm({ name: '', startTime: '', endTime: '', days: [] });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Vardiya oluşturulamadı');
    }
  };

  const toggleDay = (day: string) => {
    const days = shiftForm.days.includes(day)
      ? shiftForm.days.filter((d) => d !== day)
      : [...shiftForm.days, day];
    setShiftForm({ ...shiftForm, days });
  };

  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'vardiya', label: 'Vardiyalar', icon: Clock },
    { key: 'puantaj', label: 'Puantaj', icon: Users },
    { key: 'performans', label: 'Performans', icon: Award },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Personel Yönetimi</h2>
        {activeTab === 'vardiya' && (
          <button
            onClick={() => setShowShiftModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus size={20} />
            Yeni Vardiya
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Vardiyalar Tab */}
      {activeTab === 'vardiya' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.length === 0 ? (
            <p className="text-gray-500 col-span-3 text-center py-8">Vardiya bulunamadı</p>
          ) : (
            shifts.map((shift) => (
              <div key={shift.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={24} className="text-primary-600" />
                  <h3 className="font-semibold text-lg">{shift.name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Başlangıç:</span>
                    <span className="font-medium">{shift.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bitiş:</span>
                    <span className="font-medium">{shift.endTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Günler:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(shift.days || []).map((day: string) => (
                        <span key={day} className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-500">Çalışan Sayısı:</span>
                    <span className="font-medium">{shift.staffCount || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Puantaj Tab */}
      {activeTab === 'puantaj' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çalışan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giriş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çıkış</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Puantaj bulunamadı</td></tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date || record.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.staffName || record.user?.firstName} {record.staffSurname || record.user?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.clockIn || record.checkIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.clockOut || record.checkOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.hoursWorked || record.totalHours || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[record.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusMap[record.status]?.label || record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Performans Tab */}
      {activeTab === 'performans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Ortalama Satış</p>
              <p className="text-2xl font-bold text-primary-600">
                {performance.length > 0
                  ? `₺${(performance.reduce((sum, p) => sum + (p.totalSales || 0), 0) / performance.length).toFixed(0)}`
                  : '₺0'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Toplam Mesai</p>
              <p className="text-2xl font-bold text-green-600">
                {performance.reduce((sum, p) => sum + (p.hoursWorked || 0), 0)} saat
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Devam Oranı</p>
              <p className="text-2xl font-bold text-blue-600">
                %{performance.length > 0 ? (performance.filter(p => p.status === 'ACTIVE').length / performance.length * 100).toFixed(0) : 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Aktif Çalışan</p>
              <p className="text-2xl font-bold text-yellow-600">{performance.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çalışan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozisyon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Satış</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {performance.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Performans verisi bulunamadı</td></tr>
                ) : (
                  performance.map((perf) => (
                    <tr key={perf.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {perf.firstName || perf.user?.firstName} {perf.lastName || perf.user?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{perf.position || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₺{perf.totalSales?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{perf.hoursWorked || 0} saat</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{perf.score || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[perf.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {statusMap[perf.status]?.label || perf.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vardiya Oluşturma Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Vardiya</h3>
              <button onClick={() => setShowShiftModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vardiya Adı</label>
                <input
                  type="text"
                  value={shiftForm.name}
                  onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Örn: Sabah Vardiyası"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                  <input
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                  <input
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Günler</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        shiftForm.days.includes(day)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowShiftModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
