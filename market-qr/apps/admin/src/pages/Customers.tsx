import { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { customersApi } from '../lib/api';

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [filterTier, setFilterTier] = useState<string>('');

  useEffect(() => {
    loadCustomers();
  }, [token]);

  const loadCustomers = async () => {
    if (!token) return;

    try {
      const response = await customersApi.list();
      const customersList = Array.isArray(response) ? response : response.data || [];
      setCustomers(customersList);
    } catch (error) {
      console.error('Customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetail = async (customer: any) => {
    try {
      setSelectedCustomer(customer);
      // Mock order history - in real app, fetch from API
      const mockOrders = [
        { id: '1', date: '2024-01-15', total: 150.00, status: 'Tamamlandı' },
        { id: '2', date: '2024-01-20', total: 85.50, status: 'Tamamlandı' },
        { id: '3', date: '2024-02-01', total: 220.00, status: 'Beklemede' },
      ];
      setCustomerOrders(mockOrders);
      setShowDetail(true);
    } catch (error) {
      console.error('Customer detail error:', error);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    const matchesTier = !filterTier || customer.loyaltyTier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'bg-orange-100 text-orange-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'PLATINUM': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'Bronz';
      case 'SILVER': return 'Gümüş';
      case 'GOLD': return 'Altın';
      case 'PLATINUM': return 'Platin';
      default: return tier || 'Yok';
    }
  };

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
        <h2 className="text-2xl font-bold">Müşteriler</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
            />
          </div>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Tüm Tiers</option>
            <option value="BRONZE">Bronz</option>
            <option value="SILVER">Gümüş</option>
            <option value="GOLD">Altın</option>
            <option value="PLATINUM">Platin</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Müşteri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sipariş Sayısı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sadakat Tier
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Müşteri bulunamadı
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.orderCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierColor(customer.loyaltyTier)}`}
                    >
                      {getTierLabel(customer.loyaltyTier)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => viewCustomerDetail(customer)}
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

      {/* Customer Detail Modal */}
      {showDetail && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Müşteri Detayı</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ad Soyad</p>
                  <p className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{selectedCustomer.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sadakat Tier</p>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierColor(selectedCustomer.loyaltyTier)}`}
                  >
                    {getTierLabel(selectedCustomer.loyaltyTier)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Kayıtlı Adresler</p>
                <div className="space-y-2">
                  {selectedCustomer.addresses?.map((address: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {address.title}: {address.street}, {address.city}
                    </div>
                  )) || (
                    <p className="text-gray-400 text-sm">Kayıtlı adres bulunamadı</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Sipariş Geçmişi</p>
                <div className="space-y-2">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">Sipariş #{order.id}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₺{order.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}