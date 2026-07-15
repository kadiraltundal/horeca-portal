'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';

interface Campaign {
  id: string;
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products?: any[];
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kampanyayi silmek istediginize emin misiniz?')) return;
    try {
      await api.delete(`campaigns/${id}`);
      setCampaigns(campaigns.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kampanyalar</h1>
        <Link
          href="/admin/campaigns/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Yangi Kampanya
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chegirma</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Muddat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {campaign.discountType === 'percentage'
                    ? `%${campaign.discountValue}`
                    : `${campaign.discountValue} so'm`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(campaign.startDate).toLocaleDateString('uz-UZ')} -{' '}
                  {new Date(campaign.endDate).toLocaleDateString('uz-UZ')}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link
                    href={`/admin/campaigns/${campaign.id}/edit`}
                    className="text-blue-500 hover:text-blue-600 mr-3"
                  >
                    Tahrirlash
                  </Link>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Ochirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {campaigns.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Kampanyalar topilmadi
          </div>
        )}
      </div>
    </div>
  );
}
