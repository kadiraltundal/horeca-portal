'use client';

import { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BarcodeInput from './BarcodeInput';
import ProductTable from './ProductTable';
import ProductGrid from './ProductGrid';
import CategorySidebar from './CategorySidebar';
import NumPad from './NumPad';
import PaymentFooter from './PaymentFooter';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import ReturnModal from './ReturnModal';
import QrScannerModal from './QrScannerModal';
import ProductsPage from './ProductsPage';
import OrdersPage from './OrdersPage';
import InventoryPage from './InventoryPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useKeyboardShortcuts } from './KeyboardShortcuts';
import { productsApi, ordersApi, categoriesApi } from '@/lib/api';

interface PosLayoutProps {
  storeId: string;
  storeName: string;
}

export default function PosLayout({ storeId, storeName }: PosLayoutProps) {
  const { addItem, removeItem, updateQuantity, clearCart, items, subtotal } = useCart();
  const { logout } = useAuth();
  const [activePage, setActivePage] = useState('pos');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  // NumPad state
  const [numpadMode, setNumpadMode] = useState<'barcode' | 'quantity'>('barcode');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');

  // Category filter state
  const [activeCategory, setActiveCategory] = useState('all');
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    loadAllProducts();
  }, [storeId]);

  const loadAllProducts = async () => {
    try {
      const res = await productsApi.search('');
      const list = Array.isArray(res) ? res : res.data || res.value || [];
      setAllProducts(list);
    } catch {}
  };

  const productCounts: Record<string, number> = {};
  allProducts.forEach((p: any) => {
    if (p.categoryId) {
      productCounts[p.categoryId] = (productCounts[p.categoryId] || 0) + 1;
    }
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<{ amount: number; description: string } | null>(null);
  const [couponInputVisible, setCouponInputVisible] = useState(false);

  const vat = subtotal * 0.20;
  const discountAmount = discount?.amount || 0;
  const total = subtotal + vat - discountAmount;

  // NumPad submit handler
  const handleNumPadSubmit = useCallback(async (value: string) => {
    if (numpadMode === 'barcode') {
      // Try barcode first, then search
      try {
        const result = await productsApi.findByBarcode(value);
        addItem({
          productId: result.product?.id || result.id,
          name: result.product?.name || result.name,
          price: result.product?.price || result.price,
          imageUrl: result.product?.imageUrl || result.imageUrl,
          barcode: value,
        });
      } catch {
        try {
          const result = await productsApi.search(value);
          const products = result.data || result;
          if (products.length > 0) {
            const p = products[0];
            addItem({
              productId: p.id,
              name: p.name,
              price: p.price,
              imageUrl: p.imageUrl,
              barcode: p.barcode,
            });
          }
        } catch {
          // Not found
        }
      }
    } else {
      // Quantity mode — update selected product
      if (selectedProductId) {
        const num = parseInt(value);
        if (!isNaN(num) && num > 0) {
          updateQuantity(selectedProductId, num);
        }
        setSelectedProductId(null);
        setSelectedProductName('');
        setNumpadMode('barcode');
      }
    }
  }, [numpadMode, selectedProductId, addItem, updateQuantity]);

  // Handle product row select (switch to quantity mode)
  const handleProductSelect = useCallback((productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setNumpadMode('quantity');
  }, []);

  // Handle barcode scan from BarcodeInput
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    try {
      const result = await productsApi.findByBarcode(barcode);
      addItem({
        productId: result.product?.id || result.id,
        name: result.product?.name || result.name,
        price: result.product?.price || result.price,
        imageUrl: result.product?.imageUrl || result.imageUrl,
        barcode,
      });
    } catch {
      try {
        const result = await productsApi.search(barcode);
        const products = result.data || result;
        if (products.length > 0) {
          const p = products[0];
          addItem({
            productId: p.id,
            name: p.name,
            price: p.price,
            imageUrl: p.imageUrl,
            barcode: p.barcode,
          });
        }
      } catch {
        // silently fail
      }
    }
  }, [addItem]);

  const handleQRScan = useCallback(() => {
    setShowQrScanner(true);
  }, []);

  const handleQRResult = useCallback(async (token: string) => {
    setShowQrScanner(false);
    try {
      const result = await productsApi.scan(token);
      addItem({
        productId: result.product?.id || result.id,
        name: result.product?.name || result.name,
        price: result.product?.price || result.price,
        imageUrl: result.product?.imageUrl || result.imageUrl,
      });
    } catch {
      // Try barcode fallback
      try {
        const result = await productsApi.findByBarcode(token);
        addItem({
          productId: result.product?.id || result.id,
          name: result.product?.name || result.name,
          price: result.product?.price || result.price,
          imageUrl: result.product?.imageUrl || result.imageUrl,
          barcode: token,
        });
      } catch {
        alert('Ürün bulunamadı');
      }
    }
  }, [addItem]);

  // Coupon apply
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await ordersApi.calculate({
        storeId,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        couponCode: couponCode.trim(),
      });
      if (result.discount > 0) {
        setDiscount({ amount: result.discount, description: result.discountDescription || couponCode });
      } else {
        setDiscount(null);
      }
    } catch {
      setDiscount(null);
    }
  }, [couponCode, storeId, items]);

  const handlePayment = useCallback((method: string) => {
    setPaymentMethod(method);
  }, []);

  const handlePaymentComplete = useCallback((orderId: string) => {
    setPaymentMethod(null);
    setCompletedOrderId(orderId);
    setCouponCode('');
    setDiscount(null);
  }, []);

  const handleClearCart = useCallback(() => {
    if (items.length > 0 && confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
      clearCart();
      setCouponCode('');
      setDiscount(null);
    }
  }, [items.length, clearCart]);

  const handleFocusSearch = useCallback(() => {
    setNumpadMode('barcode');
  }, []);

  const handleDeleteLast = useCallback(() => {
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      removeItem(lastItem.productId);
    }
  }, [items, removeItem]);

  useKeyboardShortcuts({
    onCashSale: () => items.length > 0 && handlePayment('CASH'),
    onPosSale: () => items.length > 0 && handlePayment('CREDIT_CARD'),
    onPartialPayment: () => items.length > 0 && handlePayment('PARTIAL'),
    onClearCart: handleClearCart,
    onFocusSearch: handleFocusSearch,
    onEscape: () => {
      setPaymentMethod(null);
      setCompletedOrderId(null);
      setShowReturnModal(false);
      if (numpadMode === 'quantity') {
        setNumpadMode('barcode');
        setSelectedProductId(null);
      }
    },
    onDeleteLast: handleDeleteLast,
  }, !paymentMethod && !completedOrderId && !showReturnModal);

  const renderPage = () => {
    switch (activePage) {
      case 'products':
        return <ProductsPage storeId={storeId} />;
      case 'orders':
        return <OrdersPage storeId={storeId} />;
      case 'inventory':
        return <InventoryPage storeId={storeId} />;
      case 'reports':
        return <ReportsPage storeId={storeId} />;
      case 'settings':
        return <SettingsPage storeId={storeId} storeName={storeName} />;
      default:
        return (
          <>
            {/* Center: Table + Categories + Grid */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Product Table */}
              <div className="w-[35%] flex flex-col overflow-hidden bg-white border-r border-gray-200">
                <ProductTable onProductSelect={handleProductSelect} selectedProductId={selectedProductId} />
              </div>

              {/* Center: Category Sidebar */}
              <CategorySidebar
                storeId={storeId}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
                productCounts={productCounts}
                totalCount={allProducts.length}
              />

              {/* Right: Product Grid + NumPad */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <ProductGrid storeId={storeId} activeCategory={activeCategory} />
                <NumPad
                  mode={numpadMode}
                  onSubmit={handleNumPadSubmit}
                  selectedProductName={selectedProductName}
                  currentQuantity={items.find(i => i.productId === selectedProductId)?.quantity || 1}
                />
              </div>
            </div>

            {/* Payment Footer */}
            <PaymentFooter onPayment={handlePayment} onClearCart={handleClearCart} discount={discount} />
          </>
        );
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={logout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - only show on POS page */}
        {activePage === 'pos' && (
          <TopBar
            storeName={storeName}
            total={total}
            itemCount={items.length}
            discount={discount}
            onCouponToggle={() => setCouponInputVisible(!couponInputVisible)}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            couponInputVisible={couponInputVisible}
          />
        )}

        {/* Barcode Input - only show on POS page */}
        {activePage === 'pos' && (
          <BarcodeInput
            onBarcodeScan={handleBarcodeScan}
            onQRScan={handleQRScan}
            onReturn={() => setShowReturnModal(true)}
          />
        )}

        {/* Page Content */}
        {renderPage()}
      </div>

      {/* Payment Modal */}
      {paymentMethod && (
        <PaymentModal
          method={paymentMethod}
          storeId={storeId}
          onClose={() => setPaymentMethod(null)}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* Receipt Modal */}
      {completedOrderId && (
        <ReceiptModal
          orderId={completedOrderId}
          onClose={() => setCompletedOrderId(null)}
        />
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <ReturnModal
          storeId={storeId}
          onClose={() => setShowReturnModal(false)}
        />
      )}

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <QrScannerModal
          onScan={handleQRResult}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </div>
  );
}
