import { api } from '@/services/api';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupApiInterceptor = () => {
  // This would be called once to set up interceptors
  // For now, we handle token refresh in the API client

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;

    // Skip interceptor for auth endpoints
    if (typeof url === 'string' && url.includes('/auth/')) {
      return originalFetch(url, options);
    }

    const response = await originalFetch(url, options);

    // If 401, try to refresh token
    if (response.status === 401 && !isRefreshing) {
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const data = await api.refreshToken(refreshToken);
        api.setAccessToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        processQueue(null, data.accessToken);

        // Retry original request
        const newOptions = {
          ...options,
          headers: {
            ...options?.headers,
            Authorization: `Bearer ${data.accessToken}`,
          },
        };
        return originalFetch(url, newOptions);
      } catch (error) {
        processQueue(error, null);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return response;
  };
};
