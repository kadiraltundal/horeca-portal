export interface PlatformProduct {
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl?: string;
  barcode?: string;
  attributes?: Record<string, unknown>;
}

export interface PlatformOrder {
  platformOrderId: string;
  status: string;
  totalAmount: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string;
  items: Array<{
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

export interface PlatformStrategy {
  readonly type: string;

  connect(apiKey: string, apiSecret: string, baseUrl: string): Promise<boolean>;

  pushProducts(products: PlatformProduct[]): Promise<SyncResult>;

  pullOrders(since?: Date): Promise<PlatformOrder[]>;

  updateOrderStatus(platformOrderId: string, status: string): Promise<boolean>;

  getStockLevels(skus: string[]): Promise<Map<string, number>>;
}
