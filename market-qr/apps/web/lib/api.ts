const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('qr_token') : null);
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'İstek başarısız' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    api('/auth/login', { method: 'POST', body: { email, password } }),
};

export const productsApi = {
  scan: (qrToken: string) => api(`/products/scan/${qrToken}`),
  findByBarcode: (barcode: string) => api(`/products/barcode/${barcode}`),
  search: (q: string) => api(`/products/search?q=${encodeURIComponent(q)}`),
  listByStore: (storeId: string, page = 1, limit = 50) =>
    api(`/products/${storeId}?page=${page}&limit=${limit}`),
};

export const storesApi = {
  list: () => api('/stores'),
};

export const ordersApi = {
  calculate: (data: { storeId: string; items: Array<{ productId: string; quantity: number }>; couponCode?: string }) =>
    api('/orders/calculate', { method: 'POST', body: data }),
  create: (data: { storeId: string; paymentMethod: string; items: Array<{ productId: string; quantity: number }>; couponCode?: string }) =>
    api('/orders', { method: 'POST', body: data }),
  getReceiptUrl: (orderId: string) => `${API_BASE}/orders/${orderId}/receipt`,
  list: (storeId: string, page = 1, limit = 20) =>
    api(`/orders/${storeId}?page=${page}&limit=${limit}`),
  getStats: (storeId: string) => api(`/orders/stats/${storeId}`),
};

export const paymentsApi = {
  initialize: (data: { orderId: string; method: string }) =>
    api('/payments/initialize', { method: 'POST', body: data }),
  confirm: (orderId: string) =>
    api(`/payments/${orderId}/confirm`, { method: 'POST' }),
  getStatus: (orderId: string) =>
    api(`/payments/${orderId}/status`),
};

export const promotionsApi = {
  list: () => api('/promotions?isActive=true'),
  validateCoupon: (code: string, amount: number) =>
    api('/promotions/coupons/validate', { method: 'POST', body: { code, amount } }),
};

export const categoriesApi = {
  list: () => api('/categories'),
  create: (data: any) => api('/categories', { method: 'POST', body: data }),
  update: (id: string, data: any) => api(`/categories/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/categories/${id}`, { method: 'DELETE' }),
};

export const dashboardApi = {
  getOverview: (storeId?: string) =>
    api(`/dashboard/overview${storeId ? `?storeId=${storeId}` : ''}`),
  getTopProducts: (storeId?: string, limit = 10) =>
    api(`/dashboard/top-products?limit=${limit}${storeId ? `&storeId=${storeId}` : ''}`),
};
