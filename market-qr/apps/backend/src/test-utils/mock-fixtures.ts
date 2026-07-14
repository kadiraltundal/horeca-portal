export const mockUser = (overrides?: Partial<any>) => ({
  id: 'user-123',
  email: 'test@example.com',
  password: '$2a$10$hashedpassword',
  firstName: 'Test',
  lastName: 'User',
  role: 'ADMIN',
  phone: '+905551234567',
  storeId: 'store-123',
  companyId: null,
  avatarUrl: null,
  isMfaEnabled: false,
  mfaSecret: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockProduct = (overrides?: Partial<any>) => ({
  id: 'product-123',
  sku: 'PRD-001',
  name: 'Test Product',
  description: 'Test description',
  price: 100,
  currency: 'TRY',
  vatRate: 20,
  barcode: '8691234567890',
  weight: 1.0,
  volume: null,
  country: 'Turkey',
  origin: 'Local',
  status: 'ACTIVE',
  isActive: true,
  categoryId: 'category-123',
  brandId: 'brand-123',
  supplierId: 'supplier-123',
  unitId: 'unit-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockStoreProduct = (overrides?: Partial<any>) => ({
  storeId: 'store-123',
  productId: 'product-123',
  stockQuantity: 50,
  shelfNumber: 'A1',
  minStockThreshold: 10,
  lastUpdated: new Date('2024-01-01'),
  product: mockProduct(),
  ...overrides,
});

export const mockOrder = (overrides?: Partial<any>) => ({
  id: 'order-123',
  userId: 'user-123',
  storeId: 'store-123',
  totalAmount: 250,
  discountAmount: 0,
  paymentMethod: 'CASH',
  status: 'PENDING',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: { id: 'user-123', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
  store: { id: 'store-123', name: 'Test Store', address: 'Test Address' },
  orderItems: [],
  payment: null,
  ...overrides,
});

export const mockOrderItem = (overrides?: Partial<any>) => ({
  id: 'item-123',
  orderId: 'order-123',
  productId: 'product-123',
  quantity: 2,
  unitPrice: 100,
  subtotal: 200,
  product: mockProduct(),
  ...overrides,
});

export const mockPayment = (overrides?: Partial<any>) => ({
  id: 'payment-123',
  orderId: 'order-123',
  amount: 250,
  method: 'CASH',
  provider: 'MANUAL',
  status: 'PENDING',
  externalRef: null,
  webhookLog: null,
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockStore = (overrides?: Partial<any>) => ({
  id: 'store-123',
  regionId: 'region-123',
  name: 'Test Store',
  address: 'Test Address',
  lat: 41.0082,
  lng: 28.9784,
  phone: '+905559876543',
  workingHours: '09:00-22:00',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockCategory = (overrides?: Partial<any>) => ({
  id: 'category-123',
  name: 'Test Category',
  parentId: null,
  sortOrder: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockBrand = (overrides?: Partial<any>) => ({
  id: 'brand-123',
  name: 'Test Brand',
  logoUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockSupplier = (overrides?: Partial<any>) => ({
  id: 'supplier-123',
  name: 'Test Supplier',
  contactName: 'Ali Veli',
  phone: '+905551112233',
  email: 'supplier@test.com',
  taxNumber: '1234567890',
  bankName: 'Test Bank',
  bankAccount: 'TR1234567890',
  rating: 4.5,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockRegisterDto = (overrides?: Partial<any>) => ({
  email: 'newuser@example.com',
  password: 'Password123',
  firstName: 'New',
  lastName: 'User',
  phone: '+905551234567',
  ...overrides,
});

export const mockLoginDto = (overrides?: Partial<any>) => ({
  email: 'test@example.com',
  password: 'Password123',
  ...overrides,
});
