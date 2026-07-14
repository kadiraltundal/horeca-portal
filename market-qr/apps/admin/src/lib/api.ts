const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

export async function api<T = any>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    api('/auth/login', { method: 'POST', body: { email, password } }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api('/auth/register', { method: 'POST', body: data }),

  refresh: (refreshToken: string) =>
    api('/auth/refresh', { method: 'POST', body: { refreshToken } }),
};

export const storesApi = {
  list: () => api('/stores'),
  get: (id: string) => api(`/stores/${id}`),
  create: (data: any) => api('/stores', { method: 'POST', body: data }),
  update: (id: string, data: any) =>
    api(`/stores/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/stores/${id}`, { method: 'DELETE' }),
};

export const productsApi = {
  listByStore: (storeId: string, page = 1, limit = 20) =>
    api(`/products/${storeId}?page=${page}&limit=${limit}`),
  get: (storeId: string, productId: string) =>
    api(`/products/${storeId}/${productId}`),
  create: (data: any) => api('/products', { method: 'POST', body: data }),
  update: (id: string, data: any) =>
    api(`/products/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/products/${id}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  list: () => api('/categories'),
  create: (data: any) => api('/categories', { method: 'POST', body: data }),
  update: (id: string, data: any) =>
    api(`/categories/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/categories/${id}`, { method: 'DELETE' }),
};

export const inventoryApi = {
  list: (storeId: string, page = 1, limit = 20) =>
    api(`/inventory/${storeId}?page=${page}&limit=${limit}`),
  getAlerts: (storeId: string) => api(`/inventory/alerts/${storeId}`),
  update: (storeId: string, productId: string, data: any) =>
    api(`/inventory/${storeId}/${productId}`, { method: 'PUT', body: data }),
  bulkUpdate: (storeId: string, items: any[]) =>
    api('/inventory/bulk-update', { method: 'POST', body: { storeId, items } }),
};

export const ordersApi = {
  list: (storeId: string, page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return api(`/orders/${storeId}?${params}`);
  },
  get: (id: string) => api(`/orders/detail/${id}`),
  updateStatus: (id: string, status: string) =>
    api(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
  getStats: (storeId: string) => api(`/orders/stats/${storeId}`),
};

export const notificationsApi = {
  list: (page = 1, limit = 20) =>
    api(`/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => api('/notifications/unread-count'),
  markAsRead: (id: string) =>
    api(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => api('/notifications/read-all', { method: 'PUT' }),
};

export const dashboardApi = {
  getOverview: (storeId?: string) =>
    api(`/dashboard/overview${storeId ? `?storeId=${storeId}` : ''}`),
  getTopProducts: (storeId?: string, limit = 10) =>
    api(`/dashboard/top-products?limit=${limit}${storeId ? `&storeId=${storeId}` : ''}`),
  getCampaignConversion: (storeId?: string) =>
    api(`/dashboard/campaign-conversion${storeId ? `?storeId=${storeId}` : ''}`),
};

export const organizationsApi = {
  listCompanies: () => api('/organizations/companies'),
  getCompany: (id: string) => api(`/organizations/companies/${id}`),
  createCompany: (data: any) => api('/organizations/companies', { method: 'POST', body: data }),
  updateCompany: (id: string, data: any) => api(`/organizations/companies/${id}`, { method: 'PUT', body: data }),
  listRegions: (companyId?: string) =>
    api(`/organizations/regions${companyId ? `?companyId=${companyId}` : ''}`),
  createRegion: (data: any) => api('/organizations/regions', { method: 'POST', body: data }),
  listWarehouses: (companyId?: string) =>
    api(`/organizations/warehouses${companyId ? `?companyId=${companyId}` : ''}`),
  createWarehouse: (data: any) => api('/organizations/warehouses', { method: 'POST', body: data }),
};

export const brandsApi = {
  list: () => api('/products/brands/all'),
  create: (data: any) => api('/products/brands', { method: 'POST', body: data }),
  update: (id: string, data: any) => api(`/products/brands/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/products/brands/${id}`, { method: 'DELETE' }),
};

export const batchesApi = {
  list: (params?: { productId?: string; warehouseId?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.productId) searchParams.set('productId', params.productId);
    if (params?.warehouseId) searchParams.set('warehouseId', params.warehouseId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return api(`/batches${qs ? `?${qs}` : ''}`);
  },
  getExpiring: (days = 30) => api(`/batches/expiring?days=${days}`),
  getExpired: () => api('/batches/expired'),
  create: (data: any) => api('/batches', { method: 'POST', body: data }),
};

export const pricingApi = {
  getProductPrice: (productId: string) => api(`/pricing/product/${productId}`),
  getBestPrice: (productId: string) => api(`/pricing/product/${productId}/best`),
  list: (productId?: string) => api(`/pricing${productId ? `?productId=${productId}` : ''}`),
  create: (data: any) => api('/pricing', { method: 'POST', body: data }),
};

export const promotionsApi = {
  list: (isActive?: boolean) =>
    api(`/promotions${isActive !== undefined ? `?isActive=${isActive}` : ''}`),
  get: (id: string) => api(`/promotions/${id}`),
  create: (data: any) => api('/promotions', { method: 'POST', body: data }),
  update: (id: string, data: any) => api(`/promotions/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/promotions/${id}`, { method: 'DELETE' }),
  toggleActive: (id: string) => api(`/promotions/${id}/toggle`, { method: 'PUT' }),
  listCoupons: () => api('/promotions/coupons/all'),
  createCoupon: (data: any) => api('/promotions/coupons', { method: 'POST', body: data }),
};

export const scanApi = {
  getStats: (storeId?: string, days = 7) =>
    api(`/scan/stats?days=${days}${storeId ? `&storeId=${storeId}` : ''}`),
  getHourly: (storeId?: string, date?: string) =>
    api(`/scan/hourly${storeId ? `?storeId=${storeId}` : ''}${date ? `&date=${date}` : ''}`),
  getRecent: (limit = 20) => api(`/scan/recent?limit=${limit}`),
};

export const customersApi = {
  list: (page = 1, limit = 20) => api(`/customers?page=${page}&limit=${limit}`),
  get: (userId: string) => api(`/customers/${userId}`),
  detail: (id: string) => api(`/customers/${id}`),
  addresses: (id: string) => api(`/customers/${id}/addresses`),
  createAddress: (id: string, data: any) =>
    api(`/customers/${id}/addresses`, { method: 'POST', body: data }),
  updateAddress: (customerId: string, addressId: string, data: any) =>
    api(`/customers/${customerId}/addresses/${addressId}`, { method: 'PUT', body: data }),
  deleteAddress: (customerId: string, addressId: string) =>
    api(`/customers/${customerId}/addresses/${addressId}`, { method: 'DELETE' }),
};

export const auditApi = {
  list: (entity?: string, page = 1, limit = 50) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (entity) params.set('entity', entity);
    return api(`/audit?${params}`);
  },
  getEntityHistory: (entity: string, entityId: string) =>
    api(`/audit/entity/${entity}/${entityId}`),
};

export const suppliersApi = {
  list: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    return api(`/suppliers?${params}`);
  },
  get: (id: string) => api(`/suppliers/${id}`),
  create: (data: any) => api('/suppliers', { method: 'POST', body: data }),
  update: (id: string, data: any) => api(`/suppliers/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/suppliers/${id}`, { method: 'DELETE' }),
  getStats: (id: string) => api(`/suppliers/${id}/stats`),
};

export const stockMovementsApi = {
  list: (storeId: string, page = 1, limit = 20, type?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.set('type', type);
    return api(`/stock-movements/${storeId}?${params}`);
  },
  listByProduct: (storeId: string, productId: string, page = 1, limit = 20) =>
    api(`/stock-movements/${storeId}/product/${productId}?page=${page}&limit=${limit}`),
  create: (data: any) => api('/stock-movements', { method: 'POST', body: data }),
  getStats: (storeId: string) => api(`/stock-movements/${storeId}/stats`),
};

export const purchaseOrdersApi = {
  list: (page = 1, limit = 20, status?: string, supplierId?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    if (supplierId) params.set('supplierId', supplierId);
    return api(`/purchase-orders?${params}`);
  },
  get: (id: string) => api(`/purchase-orders/${id}`),
  create: (data: any) => api('/purchase-orders', { method: 'POST', body: data }),
  updateStatus: (id: string, status: string) =>
    api(`/purchase-orders/${id}/status`, { method: 'PUT', body: { status } }),
  delete: (id: string) => api(`/purchase-orders/${id}`, { method: 'DELETE' }),
};

export const refundsApi = {
  list: (storeId: string, page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return api(`/refunds/${storeId}?${params}`);
  },
  get: (id: string) => api(`/refunds/${id}`),
  create: (data: any) => api('/refunds', { method: 'POST', body: data }),
  updateStatus: (id: string, status: string) =>
    api(`/refunds/${id}/status`, { method: 'PUT', body: { status } }),
};

export const cashDrawerApi = {
  getOpen: (storeId: string) => api(`/cash-drawers/${storeId}/open`),
  open: (data: any) => api('/cash-drawers/open', { method: 'POST', body: data }),
  close: (data: any) => api('/cash-drawers/close', { method: 'POST', body: data }),
  getHistory: (storeId: string, page = 1, limit = 20) =>
    api(`/cash-drawers/${storeId}/history?page=${page}&limit=${limit}`),
};

export const zReportApi = {
  generate: (storeId: string) =>
    api(`/z-reports/generate/${storeId}`, { method: 'POST' }),
  list: (storeId: string, page = 1, limit = 20) =>
    api(`/z-reports/${storeId}?page=${page}&limit=${limit}`),
  get: (id: string) => api(`/z-reports/detail/${id}`),
  getDaily: (storeId: string, date?: string) =>
    api(`/z-reports/daily/${storeId}${date ? `?date=${date}` : ''}`),
};

export const usersApi = {
  list: (page = 1, limit = 20, role?: string, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (role) params.set('role', role);
    if (search) params.set('search', search);
    return api(`/users?${params}`);
  },
  get: (id: string) => api(`/users/${id}`),
  create: (data: any) => api('/users', { method: 'POST', body: data }),
  update: (id: string, data: any) =>
    api(`/users/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
  updateRole: (id: string, role: string) =>
    api(`/users/${id}/role`, { method: 'PUT', body: { role } }),
};

export const financeApi = {
  invoices: {
    list: (params?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const qs = searchParams.toString();
      return api(`/finance/invoices${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api(`/finance/invoices/${id}`),
    create: (data: any) => api('/finance/invoices', { method: 'POST', body: data }),
    update: (id: string, data: any) => api(`/finance/invoices/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => api(`/finance/invoices/${id}`, { method: 'DELETE' }),
  },
  expenses: {
    list: (params?: { page?: number; limit?: number; category?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.category) searchParams.set('category', params.category);
      const qs = searchParams.toString();
      return api(`/finance/expenses${qs ? `?${qs}` : ''}`);
    },
    create: (data: any) => api('/finance/expenses', { method: 'POST', body: data }),
  },
  taxReport: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const qs = searchParams.toString();
    return api(`/finance/tax-report${qs ? `?${qs}` : ''}`);
  },
  summary: () => api('/finance/summary'),
};

export const warehouseApi = {
  list: () => api('/warehouses'),
  zones: {
    list: (warehouseId: string) => api(`/warehouses/${warehouseId}/zones`),
    create: (warehouseId: string, data: any) =>
      api(`/warehouses/${warehouseId}/zones`, { method: 'POST', body: data }),
  },
  stock: {
    list: (warehouseId: string, params?: { page?: number; limit?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.search) searchParams.set('search', params.search);
      const qs = searchParams.toString();
      return api(`/warehouses/${warehouseId}/stock${qs ? `?${qs}` : ''}`);
    },
  },
  transfers: {
    list: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return api(`/warehouses/transfers${qs ? `?${qs}` : ''}`);
    },
    create: (data: any) => api('/warehouses/transfers', { method: 'POST', body: data }),
  },
  tasks: {
    list: (warehouseId: string, params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return api(`/warehouses/${warehouseId}/tasks${qs ? `?${qs}` : ''}`);
    },
  },
};

export const staffApi = {
  shifts: {
    list: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string; staffId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.staffId) searchParams.set('staffId', params.staffId);
      const qs = searchParams.toString();
      return api(`/staff/shifts${qs ? `?${qs}` : ''}`);
    },
    create: (data: any) => api('/staff/shifts', { method: 'POST', body: data }),
  },
  attendance: {
    list: (params?: { page?: number; limit?: number; date?: string; staffId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.date) searchParams.set('date', params.date);
      if (params?.staffId) searchParams.set('staffId', params.staffId);
      const qs = searchParams.toString();
      return api(`/staff/attendance${qs ? `?${qs}` : ''}`);
    },
  },
  performance: {
    get: (staffId: string, params?: { startDate?: string; endDate?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const qs = searchParams.toString();
      return api(`/staff/${staffId}/performance${qs ? `?${qs}` : ''}`);
    },
  },
};

export const reportsApi = {
  sales: (params?: { startDate?: string; endDate?: string; storeId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.storeId) searchParams.set('storeId', params.storeId);
    const qs = searchParams.toString();
    return api(`/reports/sales${qs ? `?${qs}` : ''}`);
  },
  inventory: (params?: { storeId?: string; categoryId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.storeId) searchParams.set('storeId', params.storeId);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    const qs = searchParams.toString();
    return api(`/reports/inventory${qs ? `?${qs}` : ''}`);
  },
  financial: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const qs = searchParams.toString();
    return api(`/reports/financial${qs ? `?${qs}` : ''}`);
  },
  customer: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const qs = searchParams.toString();
    return api(`/reports/customer${qs ? `?${qs}` : ''}`);
  },
  product: (params?: { storeId?: string; categoryId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.storeId) searchParams.set('storeId', params.storeId);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    const qs = searchParams.toString();
    return api(`/reports/product${qs ? `?${qs}` : ''}`);
  },
  supplier: (params?: { startDate?: string; endDate?: string; supplierId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.supplierId) searchParams.set('supplierId', params.supplierId);
    const qs = searchParams.toString();
    return api(`/reports/supplier${qs ? `?${qs}` : ''}`);
  },
  generate: (data: { type: string; startDate?: string; endDate?: string; storeId?: string }) =>
    api('/reports/generate', { method: 'POST', body: data }),
};

export const ecommerceApi = {
  platforms: {
    list: () => api('/ecommerce/platforms'),
    connect: (data: any) => api('/ecommerce/platforms/connect', { method: 'POST', body: data }),
  },
  products: {
    list: (params?: { platformId?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.platformId) searchParams.set('platformId', params.platformId);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return api(`/ecommerce/products${qs ? `?${qs}` : ''}`);
    },
    sync: (platformId: string) =>
      api(`/ecommerce/platforms/${platformId}/sync`, { method: 'POST' }),
  },
  orders: {
    list: (params?: { platformId?: string; status?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.platformId) searchParams.set('platformId', params.platformId);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return api(`/ecommerce/orders${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api(`/ecommerce/orders/${id}`),
  },
  syncLogs: {
    list: (params?: { platformId?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.platformId) searchParams.set('platformId', params.platformId);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return api(`/ecommerce/sync-logs${qs ? `?${qs}` : ''}`);
    },
  },
};

export const cmsApi = {
  banners: {
    list: () => api('/cms/banners'),
    create: (data: any) => api('/cms/banners', { method: 'POST', body: data }),
    update: (id: string, data: any) => api(`/cms/banners/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => api(`/cms/banners/${id}`, { method: 'DELETE' }),
  },
  pages: {
    list: () => api('/cms/pages'),
    get: (id: string) => api(`/cms/pages/${id}`),
    create: (data: any) => api('/cms/pages', { method: 'POST', body: data }),
    update: (id: string, data: any) => api(`/cms/pages/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => api(`/cms/pages/${id}`, { method: 'DELETE' }),
  },
  blog: {
    list: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return api(`/cms/blog${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api(`/cms/blog/${id}`),
    create: (data: any) => api('/cms/blog', { method: 'POST', body: data }),
    update: (id: string, data: any) => api(`/cms/blog/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => api(`/cms/blog/${id}`, { method: 'DELETE' }),
  },
  faq: {
    list: () => api('/cms/faq'),
    create: (data: any) => api('/cms/faq', { method: 'POST', body: data }),
    update: (id: string, data: any) => api(`/cms/faq/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => api(`/cms/faq/${id}`, { method: 'DELETE' }),
  },
  announcements: {
    list: () => api('/cms/announcements'),
    create: (data: any) => api('/cms/announcements', { method: 'POST', body: data }),
    update: (id: string, data: any) => api(`/cms/announcements/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => api(`/cms/announcements/${id}`, { method: 'DELETE' }),
  },
};

export const loyaltyApi = {
  balance: (customerId: string) => api(`/loyalty/balance/${customerId}`),
  transactions: {
    list: (customerId: string, params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return api(`/loyalty/transactions/${customerId}${qs ? `?${qs}` : ''}`);
    },
  },
  rewards: {
    list: () => api('/loyalty/rewards'),
    redeem: (customerId: string, rewardId: string) =>
      api(`/loyalty/redeem`, { method: 'POST', body: { customerId, rewardId } }),
  },
};

export const returnsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; storeId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.storeId) searchParams.set('storeId', params.storeId);
    const qs = searchParams.toString();
    return api(`/returns${qs ? `?${qs}` : ''}`);
  },
  detail: (id: string) => api(`/returns/${id}`),
  create: (data: any) => api('/returns', { method: 'POST', body: data }),
  updateStatus: (id: string, status: string) =>
    api(`/returns/${id}/status`, { method: 'PUT', body: { status } }),
  refund: (id: string, data: any) =>
    api(`/returns/${id}/refund`, { method: 'POST', body: data }),
};

export const deliveryApi = {
  orders: {
    list: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return api(`/delivery/orders${qs ? `?${qs}` : ''}`);
    },
  },
  tracking: (orderId: string) => api(`/delivery/tracking/${orderId}`),
  zones: {
    list: () => api('/delivery/zones'),
    create: (data: any) => api('/delivery/zones', { method: 'POST', body: data }),
    update: (id: string, data: any) => api(`/delivery/zones/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => api(`/delivery/zones/${id}`, { method: 'DELETE' }),
  },
  riders: {
    list: () => api('/delivery/riders'),
    get: (id: string) => api(`/delivery/riders/${id}`),
  },
};

export const supportApi = {
  tickets: {
    list: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      return api(`/support/tickets${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api(`/support/tickets/${id}`),
    create: (data: any) => api('/support/tickets', { method: 'POST', body: data }),
    updateStatus: (id: string, status: string) =>
      api(`/support/tickets/${id}/status`, { method: 'PUT', body: { status } }),
  },
  messages: {
    list: (ticketId: string) => api(`/support/tickets/${ticketId}/messages`),
    send: (ticketId: string, data: any) =>
      api(`/support/tickets/${ticketId}/messages`, { method: 'POST', body: data }),
  },
  stats: () => api('/support/stats'),
};

export const giftCardsApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return api(`/gift-cards${qs ? `?${qs}` : ''}`);
  },
  detail: (id: string) => api(`/gift-cards/${id}`),
  create: (data: any) => api('/gift-cards', { method: 'POST', body: data }),
  redeem: (code: string, amount: number) =>
    api('/gift-cards/redeem', { method: 'POST', body: { code, amount } }),
  activate: (id: string) =>
    api(`/gift-cards/${id}/activate`, { method: 'PUT' }),
  cancel: (id: string) =>
    api(`/gift-cards/${id}/cancel`, { method: 'PUT' }),
  transactions: {
    list: (id: string) => api(`/gift-cards/${id}/transactions`),
  },
};
