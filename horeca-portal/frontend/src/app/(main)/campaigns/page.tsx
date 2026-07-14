'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import Header from '@/components/common/Header';
import { formatPrice } from '@/lib/utils';

interface Campaign {
  id: string;
  titleUz: string;
  titleRu?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  products?: any[];
}

export default function CampaignsPage() {
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

  const getDiscountText = (campaign: Campaign) => {
    if (campaign.discountType === 'percentage') {
      return `${campaign.discountValue}% chegirma`;
    }
    return `${formatPrice(campaign.discountValue)} chegirma`;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Tugagan';
    if (diff === 0) return 'Bugun tugaydi';
    return `${diff} kun qoldi`;
  };

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Kampanyalar" showBackButton />

      <div className="px-4 py-4">
        {campaigns.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="Hozircha kampanyalar yo'q"
            description="Tez orada yangi kampanyalar bo'ladi"
          />
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Campaign Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{campaign.titleUz}</h3>
                      {campaign.titleRu && (
                        <p className="text-blue-100 text-sm">{campaign.titleRu}</p>
                      )}
                    </div>
                    <div className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold">
                      {getDiscountText(campaign)}
                    </div>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-4">
                  {campaign.descriptionUz && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {campaign.descriptionUz}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString('uz-UZ')} -{' '}
                        {new Date(campaign.endDate).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                    <span className={`font-medium ${
                      getDaysRemaining(campaign.endDate) === 'Tugagan'
                        ? 'text-red-500'
                        : 'text-green-600'
                    }`}>
                      {getDaysRemaining(campaign.endDate)}
                    </span>
                  </div>

                  {campaign.products && campaign.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {campaign.products.length} ta mahsulot
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}