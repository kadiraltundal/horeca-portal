'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import Header from '@/components/common/Header';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface Category {
  id: string;
  nameUz: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

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
    currency: 'USD',
  });

  useEffect(() => {
    loadFormData();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create product
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

      const product = await api.post('/products', productData);

      // Create pricing if cost price provided
      if (formData.costPrice && formData.marginPercentage) {
        const costPrice = parseFloat(formData.costPrice);
        const margin = parseFloat(formData.marginPercentage);
        const sellingPrice = costPrice * (1 + margin / 100);

        await api.post('/pricing', {
          productId: product.id,
          costPrice,
          currency: formData.currency,
          additionalCosts: 0,
          marginPercentage: margin,
          sellingPrice,
        });
      }

      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Mahsulot yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Header title="Yangi mahsulot" showBackButton />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">Asosiy ma'lumotlar</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DET-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (O'zbekcha) *</label>
            <input
              type="text"
              name="nameUz"
              value={formData.nameUz}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Premium Deterjan"
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
              placeholder="Премиум Детергент"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif (O'zbekcha)</label>
            <textarea
              name="descriptionUz"
              value={formData.descriptionUz}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mahsulot tavsifi..."
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
              {categories.map((cat) => (
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
              {brands.map((brand) => (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. miqdor</label>
              <input
                type="number"
                name="minQuantity"
                value={formData.minQuantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                placeholder="1.50"
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
                placeholder="25"
              />
            </div>
          </div>

          {formData.costPrice && formData.marginPercentage && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Taxminiy sotish narxi:{' '}
                <span className="font-bold">
                  {formatPrice(parseFloat(formData.costPrice) * (1 + parseFloat(formData.marginPercentage) / 100))}
                </span>
              </p>
            </div>
          )}
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
          <Button type="submit" fullWidth loading={loading}>
            Saqlash
          </Button>
        </div>
      </form>
    </div>
  );
}