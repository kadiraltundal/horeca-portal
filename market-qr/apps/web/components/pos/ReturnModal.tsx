'use client';

import { useState } from 'react';
import { X, Search, Package, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ReturnModalProps {
  storeId: string;
  onClose: () => void;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  orderItems: OrderItem[];
}

export default function ReturnModal({ storeId, onClose }: ReturnModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const result = await api<any>(`/orders/${storeId}?page=1&limit=20`);
      const orderList = result.data || [];
      // Filter by order ID prefix or product barcode
      const filtered = orderList.filter((o: Order) =>
        o.id.startsWith(searchQuery.trim()) ||
        o.orderItems.some((item: any) =>
          item.product?.barcode === searchQuery.trim() ||
          item.product?.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      );
      setOrders(filtered);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnItem = (productId: string, maxQty: number) => {
    setReturnItems(prev => {
      const current = prev[productId] || 0;
      if (current >= maxQty) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: current + 1 };
    });
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrder) return;
    const itemsToReturn = Object.entries(returnItems).filter(([, qty]) => qty > 0);
    if (itemsToReturn.length === 0) return;

    setSubmitting(true);
    try {
      const totalAmount = itemsToReturn.reduce((sum, [productId, qty]) => {
        const item = selectedOrder.orderItems.find(i => i.productId === productId);
        return sum + (item ? item.unitPrice * qty : 0);
      }, 0);

      await api(`/refunds/${storeId}`, {
        method: 'POST',
        body: {
          orderId: selectedOrder.id,
          amount: totalAmount,
          reason: `POS iade - ${itemsToReturn.length} ürün`,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'İade oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">İade Başarılı!</h2>
          <p className="text-sm text-gray-500 mb-6">İade işlemi başarıyla oluşturuldu.</p>
          <button onClick={onClose} className="w-full h-12 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
            Tamam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b">
          <h2 className="text-lg font-bold text-gray-900">İade İşlemi</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Sipariş no veya ürün barkodu girin..."
              className="flex-1 h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="h-10 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Ara
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {orders.length === 0 && !loading && (
            <p className="text-center text-gray-400 text-sm py-8">Sipariş bulunamadı</p>
          )}

          {orders.map(order => (
            <div
              key={order.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedOrder?.id === order.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</span>
                <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('tr-TR')}</span>
                <span className="text-sm font-bold text-gray-900">{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="mt-2 space-y-1 border-t pt-2">
                  {order.orderItems.map((item: any) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span>{item.product?.name || item.productId}</span>
                        <span className="text-gray-400">x{item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReturnItem(item.productId, item.quantity); }}
                          className={`px-2 py-0.5 text-xs rounded font-semibold transition-colors ${
                            returnItems[item.productId]
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          {returnItems[item.productId] ? `${returnItems[item.productId]} adet iade` : 'İade'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        {selectedOrder && Object.values(returnItems).some(q => q > 0) && (
          <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
            <button onClick={onClose} className="flex-1 h-12 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100">
              İptal
            </button>
            <button
              onClick={handleSubmitReturn}
              disabled={submitting}
              className="flex-1 h-12 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              İadeyi Onayla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
