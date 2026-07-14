'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';
import { useTelegram } from '@/hooks/useTelegram';
import QuantitySelector from '@/components/ui/QuantitySelector';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Loading from '@/components/common/Loading';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  nameUz: string;
  nameRu?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  sku: string;
  unit: string;
  minQuantity: number;
  stockStatus: string;
  images?: { imageUrl: string; altText?: string; isPrimary: boolean }[];
  pricing?: {
    sellingPrice: number;
    currency: string;
    tiers?: { minQuantity: number; maxQuantity?: number | null; unitPrice: number }[];
  }[];
  category?: { nameUz: string; slug: string };
  brand?: { name: string; logoUrl?: string };
  attributes?: { attributeName: string; attributeValue: string }[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { showMainButton, hideMainButton, sendMainButtonClicked } = useTelegram();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  useEffect(() => {
    if (product && product.stockStatus === 'in_stock') {
      showMainButton('Savatga qo\'shish');
      sendMainButtonClicked(handleAddToCart);
    }
    return () => hideMainButton();
  }, [product]);

  const loadProduct = async () => {
    try {
      const data = await api.getProduct(params.id as string);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      alert('Savatga qo\'shildi!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Savatga qo\'shishda xatolik yuz berdi');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <Loading text="Yuklanmoqda..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Mahsulot topilmadi</p>
      </div>
    );
  }

  const pricing = product.pricing?.[0];
  const tiers = pricing?.tiers;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate flex-1">{product.nameUz}</h1>
          <button className="p-1 text-gray-400 hover:text-red-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Product Image */}
      <div className="bg-white">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.images[0].altText || product.nameUz}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">📦</span>
          )}
        </div>
        {product.images && product.images.length > 1 && (
          <div className="flex justify-center gap-2 py-2">
            {product.images.map((_, index) => (
              <span key={index} className="w-2 h-2 rounded-full bg-gray-300" />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 space-y-4">
        {/* Title & Price */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{product.nameUz}</h2>
              {product.nameRu && (
                <p className="text-sm text-gray-500">{product.nameRu}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>SKU: {product.sku}</span>
            {product.brand && <span>{product.brand.name}</span>}
          </div>

          {/* Stock Status */}
          <div className="mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              product.stockStatus === 'in_stock'
                ? 'bg-green-100 text-green-700'
                : product.stockStatus === 'out_of_stock'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {product.stockStatus === 'in_stock' ? '✅ Stokda' :
               product.stockStatus === 'out_of_stock' ? '❌ Stokda yo\'q' : '⚠️ Cheklangan'}
            </span>
          </div>
        </div>

        {/* Price Display */}
        {pricing && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <PriceDisplay
              basePrice={pricing.sellingPrice}
              tiers={tiers}
              quantity={quantity}
              currency={pricing.currency}
            />
          </div>
        )}

        {/* Quantity Selector */}
        {product.stockStatus === 'in_stock' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Miqdor</h3>
            <div className="flex items-center justify-center">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={product.minQuantity}
                size="lg"
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">
              Jami: <span className="font-bold text-gray-900">
                {formatPrice((pricing?.sellingPrice || 0) * quantity)}
              </span>
            </p>
          </div>
        )}

        {/* Description */}
        {product.descriptionUz && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Tavsif</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{product.descriptionUz}</p>
          </div>
        )}

        {/* Attributes */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Xususiyatlar</h3>
            <div className="space-y-2">
              {product.attributes.map((attr, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500">{attr.attributeName}</span>
                  <span className="font-medium text-gray-900">{attr.attributeValue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button (Mobile) */}
        {product.stockStatus === 'in_stock' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <Button
              onClick={handleAddToCart}
              loading={addingToCart}
              fullWidth
              size="lg"
            >
              🛒 Savatga qo'shish
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}