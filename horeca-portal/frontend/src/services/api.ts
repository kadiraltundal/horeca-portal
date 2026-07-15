const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Auth
  async telegramLogin(initData: string) {
    return this.request<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/telegram-login',
      {
        method: 'POST',
        body: JSON.stringify({ initData }),
      },
    );
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
    );
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/products${query}`);
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async searchProducts(query: string) {
    return this.request<any>(`/products/search?q=${encodeURIComponent(query)}`);
  }

  async getAlternatives(id: string) {
    return this.request<any>(`/products/${id}/alternatives`);
  }

  // Categories
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async getCategoryBySlug(slug: string) {
    return this.request<any>(`/categories/${slug}`);
  }

  // Brands
  async getBrands() {
    return this.request<any[]>('/brands');
  }

  async getBrandBySlug(slug: string) {
    return this.request<any>(`/brands/${slug}`);
  }

  // Favorites
  async getFavorites() {
    return this.request<any[]>('/favorites');
  }

  async addFavorite(productId: string) {
    return this.request<any>(`/favorites/${productId}`, {
      method: 'POST',
    });
  }

  async removeFavorite(productId: string) {
    return this.request<void>(`/favorites/${productId}`, {
      method: 'DELETE',
    });
  }

  // Cart
  async getCart() {
    return this.request<any[]>('/cart');
  }

  async addToCart(productId: string, quantity?: number, note?: string) {
    return this.request<any>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, note }),
    });
  }

  async updateCartItem(id: string, quantity?: number, note?: string) {
    return this.request<any>(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, note }),
    });
  }

  async removeFromCart(id: string) {
    return this.request<void>(`/cart/${id}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request<void>('/cart', {
      method: 'DELETE',
    });
  }

  // Quotes
  async getQuotes() {
    return this.request<any[]>('/quotes');
  }

  async getQuote(id: string) {
    return this.request<any>(`/quotes/${id}`);
  }

  async createQuote(customerNote?: string) {
    return this.request<any>('/quotes', {
      method: 'POST',
      body: JSON.stringify({ customerNote }),
    });
  }

  async repeatQuote(id: string) {
    return this.request<any>(`/quotes/${id}/repeat`, {
      method: 'POST',
    });
  }

  // Campaigns
  async getCampaigns() {
    return this.request<any[]>('/campaigns');
  }

  async getCampaign(id: string) {
    return this.request<any>(`/campaigns/${id}`);
  }

  // Notifications
  async getNotifications(unreadOnly?: boolean) {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    return this.request<any[]>(`/notifications${query}`);
  }

  async getUnreadCount() {
    return this.request<{ count: number }>('/notifications/unread-count');
  }

  async markAsRead(id: string) {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllAsRead() {
    return this.request<void>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // User
  async getProfile() {
    return this.request<any>('/users/profile');
  }

  async updateProfile(data: Partial<any>) {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Search
  async search(query: string, limit?: number) {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    return this.request<any>(`/search?${params.toString()}`);
  }

  async autocomplete(query: string, limit?: number) {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    return this.request<any>(`/search/autocomplete?${params.toString()}`);
  }

  async getPopularSearches(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/search/popular${params}`);
  }

  async getSearchHistory(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/search/history${params}`);
  }

  async clearSearchHistory() {
    return this.request<void>('/search/history', {
      method: 'DELETE',
    });
  }

  // Admin
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  async getAdminQuotes() {
    return this.request<any[]>('/quotes/admin/all');
  }

  async updateQuoteStatus(id: string, status: string, adminNote?: string) {
    return this.request<any>(`/quotes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNote }),
    });
  }

  // Admin Orders
  async getAdminOrders() {
    return this.request<any[]>('/orders/admin/all');
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Admin Payments
  async getAdminPayments() {
    return this.request<any[]>('/payments/admin/all');
  }

  async updatePaymentStatus(id: string, status: string) {
    return this.request<any>(`/payments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Vendors
  async getVendors() {
    return this.request<any[]>('/vendors');
  }

  async getVendor(id: string) {
    return this.request<any>(`/vendors/${id}`);
  }

  async approveVendor(id: string) {
    return this.request<any>(`/vendors/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectVendor(id: string, reason: string) {
    return this.request<any>(`/vendors/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async suspendVendor(id: string, reason: string) {
    return this.request<any>(`/vendors/${id}/suspend`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Generic HTTP methods for admin operations
  async get(endpoint: string) {
    return this.request<any>(endpoint);
  }

  async post(endpoint: string, data?: any) {
    return this.request<any>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request<any>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Import
  async importProducts(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/import/products`;
    const headers: Record<string, string> = {};

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Import failed');
    }

    return response.json();
  }

  async downloadImportTemplate() {
    const url = `${this.baseUrl}/import/template`;
    const headers: Record<string, string> = {};

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Template download failed');
    }

    return response.blob();
  }
}

export const api = new ApiClient(API_BASE_URL);