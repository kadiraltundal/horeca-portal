'use client';

import { useState, useEffect } from 'react';
import { Warehouse, AlertTriangle, Search, Plus, Minus, Save } from 'lucide-react';

interface StockItem {
  id: string;
  stockQuantity: number;
  shelfNumber?: string;
  minStockThreshold: number;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
}

interface InventoryPageProps {
  storeId: string;
}

export default function InventoryPage({ storeId }: InventoryPageProps) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [storeId]);

  const loadInventory = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${API_BASE}/inventory/${storeId}`);
      if (!res.ok) throw new Error('Stok verileri yüklenemedi');
      const data = await res.json();
      setItems(data.data || []);
    } catch (e) {
      console.error('Inventory load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setSaving(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const res = await fetch(`${API_BASE}/inventory/${storeId}/${item.product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newQuantity }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Güncelleme başarısız');
      }

      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, stockQuantity: newQuantity } : i
      ));
      setEditingId(null);
    } catch (e: any) {
      alert(e.message || 'Stok güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: StockItem) => {
    setEditingId(item.id);
    setEditValue(String(item.stockQuantity));
  };

  const filtered = items.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(search.toLowerCase());
    if (filter === 'low') return matchesSearch && item.stockQuantity <= item.minStockThreshold && item.stockQuantity > 0;
    if (filter === 'out') return matchesSearch && item.stockQuantity === 0;
    return matchesSearch;
  });

  const lowStockCount = items.filter(i => i.stockQuantity <= i.minStockThreshold && i.stockQuantity > 0).length;
  const outOfStockCount = items.filter(i => i.stockQuantity === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Stok bilgileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white m-4 rounded-xl shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Warehouse size={20} />
          Stok Yönetimi
        </h2>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              <AlertTriangle size={12} />
              {lowStockCount} düşük stok
            </span>
          )}
          {outOfStockCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              {outOfStockCount} tükendi
            </span>
          )}
          <button
            onClick={loadInventory}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
          >
            Yenile
          </button>
        </div>
      </div>

      <div className="p-4 border-b flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün veya SKU ara..."
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full"
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: 'all' as const, label: 'Tümü' },
            { key: 'low' as const, label: 'Düşük' },
            { key: 'out' as const, label: 'Tükenen' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                filter === f.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-600">Ürün</th>
              <th className="text-left p-3 font-semibold text-gray-600">SKU</th>
              <th className="text-left p-3 font-semibold text-gray-600">Raf</th>
              <th className="text-center p-3 font-semibold text-gray-600">Stok</th>
              <th className="text-right p-3 font-semibold text-gray-600">Min. Eşik</th>
              <th className="text-center p-3 font-semibold text-gray-600">Durum</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{item.product.name}</td>
                <td className="p-3 text-gray-500 font-mono text-xs">{item.product.sku}</td>
                <td className="p-3 text-gray-500">{item.shelfNumber || '-'}</td>
                <td className="p-3 text-center">
                  {editingId === item.id ? (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          const val = parseInt(editValue) - 1;
                          if (val >= 0) setEditValue(String(val));
                        }}
                        className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 text-center border rounded px-1 py-0.5 text-sm"
                        min="0"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setEditValue(String(parseInt(editValue) + 1));
                        }}
                        className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => handleUpdateStock(item.id, parseInt(editValue) || 0)}
                        disabled={saving}
                        className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      >
                        <Save size={12} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(item)}
                      className="font-semibold hover:bg-primary-50 px-2 py-0.5 rounded cursor-pointer"
                      title="Stok güncelle"
                    >
                      {item.stockQuantity}
                    </button>
                  )}
                </td>
                <td className="p-3 text-right text-gray-500">{item.minStockThreshold}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.stockQuantity === 0 ? 'bg-red-100 text-red-700' :
                    item.stockQuantity <= item.minStockThreshold ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.stockQuantity === 0 ? 'Tükendi' :
                     item.stockQuantity <= item.minStockThreshold ? 'Düşük' : 'Yeterli'}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Stok kaydı bulunamadı</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
