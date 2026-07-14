'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';
import Loading from '@/components/common/Loading';
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

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, [params.id]);

  const loadCampaign = async () => {
    try {
      const data = await api.getCampaign(params.id as string);
      setCampaign(data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiscountText = () => {
    if (!campaign) return '';
    if (campaign.discountType === 'percentage') {
      return `${campaign.discountValue}%`;
    }
    return formatPrice(campaign.discountValue);
  };

  const getDaysRemaining = () => {
    if (!campaign) return '';
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Tugagan';
    if (diff === 0) return 'Bugun tugaydi';
    return `${diff} kun qoldi`;
  };

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Kampanya" showBackButton />
        <div className="text-center py-12">
          <span className="text-5xl mb-4 block">😕</span>
          <h3 className="text-lg font-semibold text-gray-900">Kampanya topilmadi</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Kampanya" showBackButton />

      {/* Campaign Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="text-center">
          <div className="inline-block bg-white text-blue-600 px-6 py-3 rounded-full text-2xl font-bold mb-4">
            {getDiscountText()} CHEGIRMA
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{campaign.titleUz}</h1>
          {campaign.titleRu && (
            <p className="text-blue-100">{campaign.titleRu}</p>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Campaign Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">
                {new Date(campaign.startDate).toLocaleDateString('uz-UZ')} -{' '}
                {new Date(campaign.endDate).toLocaleDateString('uz-UZ')}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              getDaysRemaining() === 'Tugagan'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {getDaysRemaining()}
            </span>
          </div>

          {campaign.descriptionUz && (
            <p className="text-gray-600">{campaign.descriptionUz}</p>
          )}
          {campaign.descriptionRu && (
            <p className="text-gray-500 text-sm mt-2">{campaign.descriptionRu}</p>
          )}
        </div>

        {/* Products */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Kampanyadagi mahsulotlar
          </h2>

          {!campaign.products || campaign.products.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <span className="text-4xl mb-2 block">📦</span>
              <p className="text-gray-500">Hozircha mahsulotlar qo'shilmagan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaign.products.map((product: any) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {product.campaignPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      -{getDiscountText()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}