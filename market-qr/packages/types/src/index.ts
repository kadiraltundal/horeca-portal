export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  MOBILE_WALLET = 'MOBILE_WALLET',
  POS = 'POS',
  CASH = 'CASH',
}

export enum PaymentProvider {
  IYZICO = 'iyzico',
  PAYTR = 'paytr',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

// ===== Entity Types =====

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  storeId: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  isActive: boolean;
  workingHours: Record<string, { open: string; close: string }> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  vatRate: number;
  barcode: string | null;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreProduct {
  id: string;
  storeId: string;
  productId: string;
  stockQuantity: number;
  shelfNumber: string | null;
  minStockThreshold: number;
  lastUpdated: Date;
}

export interface ProductQR {
  id: string;
  storeId: string;
  productId: string;
  qrToken: string;
  qrImageUrl: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  totalAmount: number;
  discountAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  provider: PaymentProvider;
  externalRef: string | null;
  status: PaymentStatus;
  webhookLog: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  targetCategoryId: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  channel: NotificationChannel;
  createdAt: Date;
}

export interface Shelf {
  id: string;
  storeId: string;
  shelfNumber: string;
  floor: number;
  locationDesc: string | null;
}

// ===== API Types =====

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ScanResult {
  product: Product;
  storeProduct: StoreProduct;
  store: Store;
  promotion?: Promotion;
}
