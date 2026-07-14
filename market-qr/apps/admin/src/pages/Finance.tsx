import { useEffect, useState } from 'react';
import { Plus, X, Eye, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const statusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Taslak', color: 'bg-gray-100 text-gray-800' },
  SENT: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Ödendi', color: 'bg-green-100 text-green-800' },
  OVERDUE: { label: 'Gecikmiş', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-800' },
  PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
};

type Tab = 'faturalar' | 'giderler' | 'kdv' | 'ozet';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function Finance() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('faturalar');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netProfit: 0, vatTotal: 0 });

  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    customerName: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }] as InvoiceItem[],
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [invoicesRes, expensesRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/finance/invoices`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/finance/expenses`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/finance/summary`, { headers }).then(r => r.json()),
      ]);
      setInvoices(Array.isArray(invoicesRes) ? invoicesRes : invoicesRes.data || []);
      setExpenses(Array.isArray(expensesRes) ? expensesRes : expensesRes.data || []);
      if (summaryRes) setSummary(summaryRes.data || summaryRes);
    } catch (error) {
      console.error('Finance load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      await fetch(`${API_URL}/finance/invoices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(invoiceForm),
      });
      setShowInvoiceModal(false);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Fatura oluşturulamadı');
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/finance/expenses/${expenseId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'İşlem başarısız');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Bu gideri silmek istediğinize emin misiniz?')) return;
    if (!token) return;
    try {
      await fetch(`${API_URL}/finance/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Silme başarısız');
    }
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceForm({
      ...invoiceForm,
      items: invoiceForm.items.filter((_, i) => i !== index),
    });
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const items = [...invoiceForm.items];
    items[index] = { ...items[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, items });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'faturalar', label: 'Faturalar' },
    { key: 'giderler', label: 'Giderler' },
    { key: 'kdv', label: 'KDV Raporu' },
    { key: 'ozet', label: 'Özet' },
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
        <h2 className="text-2xl font-bold">Finans</h2>
        <div className="flex gap-2">
          {activeTab === 'faturalar' && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
            >
              <Plus size={20} />
              Yeni Fatura
            </button>
          )}
          {activeTab === 'giderler' && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
            >
              <Plus size={20} />
              Yeni Gider
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Faturalar Tab */}
      {activeTab === 'faturalar' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numara</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Fatura bulunamadı</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.customerName || invoice.customer?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{invoice.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[invoice.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusMap[invoice.status]?.label || invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Giderler Tab */}
      {activeTab === 'giderler' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Gider bulunamadı</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date || expense.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₺{expense.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[expense.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusMap[expense.status]?.label || expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {expense.status === 'PENDING' && (
                          <button onClick={() => handleApproveExpense(expense.id)} className="text-green-600 hover:text-green-900">
                            <Check size={18} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* KDV Raporu Tab */}
      {activeTab === 'kdv' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">KDV Raporu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Alınan KDV</p>
              <p className="text-xl font-bold text-blue-600">₺{summary.vatTotal?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">İndirilecek KDV</p>
              <p className="text-xl font-bold text-green-600">₺{(summary.vatTotal * 0.3)?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">KDV Farkı</p>
              <p className="text-xl font-bold text-yellow-600">₺{(summary.vatTotal * 0.7)?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Dönem</p>
              <p className="text-xl font-bold text-gray-600">2026 Q3</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Detaylı KDV raporu için muhasebe departmanınıza başvurun.</p>
        </div>
      )}

      {/* Özet Tab */}
      {activeTab === 'ozet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-600">₺{summary.totalIncome?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-600">₺{summary.totalExpenses?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Net Kâr</p>
              <p className="text-2xl font-bold text-primary-600">₺{summary.netProfit?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">KDV Toplamı</p>
              <p className="text-2xl font-bold text-blue-600">₺{summary.vatTotal?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Son Faturalar</h3>
            <p className="text-gray-500 text-sm">Son 5 fatura listeleniyor...</p>
            <div className="mt-4 space-y-2">
              {invoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{inv.invoiceNumber} - {inv.customerName || '-'}</span>
                  <span className="font-medium">₺{inv.totalAmount?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Create Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Fatura</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Adı</label>
                <input
                  type="text"
                  value={invoiceForm.customerName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Satırlar</label>
                  <button type="button" onClick={addInvoiceItem} className="text-primary-600 text-sm hover:text-primary-800">
                    + Satır Ekle
                  </button>
                </div>
                <div className="space-y-2">
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        placeholder="Açıklama"
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Miktar"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Birim Fiyat"
                        value={item.unitPrice}
                        onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        required
                      />
                      <span className="py-2 text-sm font-medium">₺{(item.quantity * item.unitPrice).toFixed(2)}</span>
                      {invoiceForm.items.length > 1 && (
                        <button type="button" onClick={() => removeInvoiceItem(index)} className="text-red-500 hover:text-red-700 py-2">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right text-sm font-medium text-gray-700">
                  Toplam: ₺{invoiceForm.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Fatura Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Create Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Gider</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!token) return;
                try {
                  await fetch(`${API_URL}/finance/expenses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ ...expenseForm, amount: parseFloat(expenseForm.amount) }),
                  });
                  setShowExpenseModal(false);
                  setExpenseForm({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
                  await loadData();
                } catch (error: any) {
                  alert(error.message || 'Gider oluşturulamadı');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Kategori seçin</option>
                  <option value="Kira">Kira</option>
                  <option value="Maaş">Maaş</option>
                  <option value="Malzeme">Malzeme</option>
                  <option value="Enerji">Enerji</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Gider Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Fatura Detayı</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fatura No</p>
                  <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Müşteri</p>
                  <p className="font-medium">{selectedInvoice.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[selectedInvoice.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusMap[selectedInvoice.status]?.label || selectedInvoice.status}
                  </span>
                </div>
              </div>
              {selectedInvoice.items && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Satırlar</p>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item.description}</span>
                        <span className="font-medium">{item.quantity} x ₺{item.unitPrice?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Toplam</span>
                  <span className="text-xl font-bold">₺{selectedInvoice.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
