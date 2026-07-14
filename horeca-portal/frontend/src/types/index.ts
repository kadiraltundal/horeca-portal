// User Types
export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  company?: string;
  role: 'admin' | 'customer';
  language: 'uz' | 'ru';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  id: string;
  categoryId?: string;
  brandId?: string;
  sku: string;
  nameUz: string;
  nameRu?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  unit: 'piece' | 'kg' | 'liter' | 'box' | 'set';
  minQuantity: number;
  maxQuantity?: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'limited';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  pricing?: Pricing[];
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  attributeName: string;
  attributeValue: string;
  sortOrder: number;
}

// Category Types
export interface Category {
  id: string;
  parentId?: string;
  nameUz: string;
  nameRu?: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  products?: Product[];
}

// Pricing Types
export interface Pricing {
  id: string;
  productId: string;
  costPrice: number;
  currency: 'UZS' | 'USD';
  additionalCosts: number;
  marginPercentage: number;
  sellingPrice: number;
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  tiers?: PricingTier[];
}

export interface PricingTier {
  id: string;
  pricingId: string;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  marginPercentage?: number;
}

// Cart Types
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  product?: Product;
}

// Quote Types
export interface Quote {
  id: string;
  quoteNumber: string;
  userId?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  totalAmount?: number;
  currency: string;
  customerNote?: string;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  product?: Product;
}

// Notification Types
export interface Notification {
  id: string;
  userId?: string;
  type: 'quote_status' | 'price_change' | 'campaign' | 'stock' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Campaign Types
export interface Campaign {
  id: string;
  titleUz: string;
  titleRu?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minQuantity?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Currency Helpers
export const CURRENCY_SYMBOLS: Record<string, string> = {
  UZS: "so'm",
  USD: '$',
};

export const formatPrice = (price: number, currency: string = 'UZS'): string => {
  const formatted = new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

  if (currency === 'UZS') {
    return `${formatted} so'm`;
  }
  return `$${formatted}`;
};