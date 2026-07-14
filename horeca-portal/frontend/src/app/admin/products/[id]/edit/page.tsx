'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import Header from '@/components/common/Header';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  sku: string;
  nameUz: string;
  nameRu?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  unit: string;
  minQuantity: number;
  stockStatus: string;
  category?: { id: string; nameUz: string };
  brand?: { id: string; name: string };
  pricing?: {
    id: string;
    costPrice: number;
    currency: string;
    additionalCosts: number;
    marginPercentage: number;
    sellingPrice: number;
    tiers?: {
      id: string;
      minQuantity: number;
      maxQuantity?: number | null;
      unitPrice: number;
    }[];
  };
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    sku: '',
    nameUz: '',
    nameRu: '',
    descriptionUz: '',
    descriptionRu: '',
    categoryId: '',
    brandId: '',
    unit: 'piece',
    minQuantity: 1,
    stockStatus: 'in_stock',
    costPrice: '',
    marginPercentage: '',
    additionalCosts: '',
    currency: 'USD',
  });

  const [tiers, setTiers] = useState<{
    minQuantity: number;
    maxQuantity: string;
    unitPrice: string;
  }[]>([]);

  useEffect(() => {
    loadProduct();
    loadFormData();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await api.get(`/products/${params.id}`);
      setFormData({
        sku: data.sku,
        nameUz: data.nameUz,
        nameRu: data.nameRu || '',
        descriptionUz: data.descriptionUz || '',
        descriptionRu: data.descriptionRu || '',
        categoryId: data.category?.id || '',
        brandId: data.brand?.id || '',
        unit: data.unit,
        minQuantity: data.minQuantity,
        stockStatus: data.stockStatus,
        costPrice: data.pricing?.[0]?.costPrice?.toString() || '',
        marginPercentage: data.pricing?.[0]?.marginPercentage?.toString() || '',
        additionalCosts: data.pricing?.[0]?.additionalCosts?.toString() || '',
        currency: data.pricing?.[0]?.currency || 'USD',
      });

      if (data.pricing?.[0]?.tiers) {
        setTiers(
          data.pricing[0].tiers.map((t: any) => ({
            minQuantity: t.minQuantity,
            maxQuantity: t.maxQuantity?.toString() || '',
            unitPrice: t.unitPrice.toString(),
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const [catData, brandData] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
      ]);
      setCategories(catData);
      setBrands(brandData);
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (index: number, field: string, value: string) => {
    const newTiers = [...tiers];
    if (field === 'minQuantity') {
      newTiers[index] = { ...newTiers[index], minQuantity: parseInt(value) || 0 };
    } else {
      newTiers[index] = { ...newTiers[index], [field]: value };
    }
    setTiers(newTiers);
  };

  const addTier = () => {
    setTiers([...tiers, { minQuantity: 1, maxQuantity: '', unitPrice: '' }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update product
      const productData = {
        sku: formData.sku,
        nameUz: formData.nameUz,
        nameRu: formData.nameRu || undefined,
        descriptionUz: formData.descriptionUz || undefined,
        descriptionRu: formData.descriptionRu || undefined,
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        unit: formData.unit,
        minQuantity: parseInt(formData.minQuantity.toString()),
        stockStatus: formData.stockStatus,
      };

      await api.put(`/products/${params.id}`, productData);

      // Update pricing
      if (formData.costPrice && formData.marginPercentage) {
        const costPrice = parseFloat(formData.costPrice);
        const margin = parseFloat(formData.marginPercentage);
        const additionalCosts = parseFloat(formData.additionalCosts) || 0;
        const sellingPrice = (costPrice + additionalCosts) * (1 + margin / 100);

        const pricingData = {
          productId: params.id,
          costPrice,
          currency: formData.currency,
          additionalCosts,
          marginPercentage: margin,
          sellingPrice,
        };

        // Check if pricing exists
        const existingPricing = await api.get(`/pricing/product/${params.id}`);

        if (existingPricing) {
          await api.put(`/pricing/${existingPricing.id}`, pricingData);
        } else {
          await api.post('/pricing', pricingData);
        }
      }

      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Mahsulot yangilashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header title="Mahsulotni tahrirlash" showBackButton />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">Asosiy ma&apos;lumotlar</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (O&apos;zbekcha) *</label>
            <input
              type="text"
              name="nameUz"
              value={formData.nameUz}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (Ruscha)</label>
            <input
              type="text"
              name="nameRu"
              value={formData.nameRu}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea
              name="descriptionUz"
              value={formData.descriptionUz}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category & Brand */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">Kategoriya va marka</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kategoriya tanlang</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.nameUz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
            <select
              name="brandId"
              value={formData.brandId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Marka tanlang</option>
              {brands.map((brand: any) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birimi</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="piece">Dona</option>
                <option value="kg">Kg</option>
                <option value="liter">Litr</option>
                <option value="box">Quti</option>
                <option value="set">Set</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok holati</label>
              <select
                name="stockStatus"
                value={formData.stockStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in_stock">Stokda</option>
                <option value="out_of_stock">Stokda yo&apos;q</option>
                <option value="limited">Cheklangan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">Fiyatlandırma</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alish narxi ($)</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kâr marjı (%)</label>
              <input
                type="number"
                name="marginPercentage"
                value={formData.marginPercentage}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qo&apos;shimcha xarajatlar ($)</label>
            <input
              type="number"
              name="additionalCosts"
              value={formData.additionalCosts}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.costPrice && formData.marginPercentage && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Taxminiy sotish narxi:{' '}
                <span className="font-bold">
                  {formatPrice(((parseFloat(formData.costPrice) + (parseFloat(formData.additionalCosts) || 0)) * (1 + parseFloat(formData.marginPercentage) / 100)))}
                </span>
              </p>
            </div>
          )}

          {/* Price Tiers */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">Fiyat kademeleri</h4>
              <button
                type="button"
                onClick={addTier}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                + Qo&apos;shish
              </button>
            </div>

            {tiers.map((tier, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={tier.minQuantity}
                  onChange={(e) => handleTierChange(index, 'minQuantity', e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={tier.maxQuantity}
                  onChange={(e) => handleTierChange(index, 'maxQuantity', e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Narx"
                  value={tier.unitPrice}
                  onChange={(e) => handleTierChange(index, 'unitPrice', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            fullWidth
          >
            Bekor qilish
          </Button>
          <Button type="submit" fullWidth loading={saving}>
            Saqlash
          </Button>
        </div>
      </form>
    </div>
  );
}