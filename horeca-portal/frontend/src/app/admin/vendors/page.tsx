'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  status: string;
  commissionRate: number;
  isVerified: boolean;
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await api.getVendors();
      setVendors(data);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      await api.approveVendor(vendorId);
      setVendors(
        vendors.map((v) =>
          v.id === vendorId ? { ...v, status: 'approved' } : v
        )
      );
    } catch (error) {
      console.error('Failed to approve vendor:', error);
    }
  };

  const handleReject = async (vendorId: string) => {
    const reason = prompt('Red sebebi:');
    if (!reason) return;
    try {
      await api.rejectVendor(vendorId, reason);
      setVendors(
        vendors.map((v) =>
          v.id === vendorId ? { ...v, status: 'rejected' } : v
        )
      );
    } catch (error) {
      console.error('Failed to reject vendor:', error);
    }
  };

  const handleSuspend = async (vendorId: string) => {
    const reason = prompt('Askıya alma sebebi:');
    if (!reason) return;
    try {
      await api.suspendVendor(vendorId, reason);
      setVendors(
        vendors.map((v) =>
          v.id === vendorId ? { ...v, status: 'suspended' } : v
        )
      );
    } catch (error) {
      console.error('Failed to suspend vendor:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Kutilmoqda',
      approved: 'Tasdiqlangan',
      rejected: 'Rad etilgan',
      suspended: 'Askida',
    };
    return texts[status] || status;
  };

  const filteredVendors =
    filter === 'all' ? vendors : vendors.filter((v) => v.status === filter);

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saticilar</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['all', 'pending', 'approved', 'rejected', 'suspended'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Barchasi' : getStatusText(status)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Egasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komissiya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{vendor.name}</div>
                  <div className="text-sm text-gray-500">/{vendor.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {vendor.user?.firstName} {vendor.user?.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  %{vendor.commissionRate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {vendor.totalSales} satis
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
                    {getStatusText(vendor.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {vendor.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(vendor.id)}
                        className="text-green-500 hover:text-green-600 mr-3"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleReject(vendor.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Rad etish
                      </button>
                    </>
                  )}
                  {vendor.status === 'approved' && (
                    <button
                      onClick={() => handleSuspend(vendor.id)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      Askiga olish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12 text-gray-500">Saticilar topilmadi</div>
        )}
      </div>
    </div>
  );
}
