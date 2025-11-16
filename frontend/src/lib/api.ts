/**
 * API Configuration for connecting to the backend
 */

// Backend API Base URL
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3000/api';

/**
 * Generic API fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Get auth token from Supabase if available
  try {
    // Try to get the token from Supabase session storage
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') && key.includes('-auth-token')
    );
    
    if (keys.length > 0) {
      const sessionData = localStorage.getItem(keys[0]);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session?.access_token) {
          (defaultHeaders as any)['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * API Methods
 */
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: any) =>
      apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      apiFetch('/auth/logout', {
        method: 'POST',
      }),
    me: () => apiFetch('/auth/me', { method: 'GET' }),
  },

  // Buyer endpoints (products/services discovery and bookings)
  buyer: {
    getServices: (params?: { category?: string; search?: string; limit?: number; offset?: number; sortBy?: string; order?: 'asc' | 'desc' }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.search) q.set('search', params.search);
      if (params?.limit != null) q.set('limit', String(params.limit));
      if (params?.offset != null) q.set('offset', String(params.offset));
      if (params?.sortBy) q.set('sortBy', params.sortBy);
      if (params?.order) q.set('order', params.order);
      const query = q.toString();
      return apiFetch(`/products${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getService: (id: string) => apiFetch(`/products/${id}`, { method: 'GET' }),
    bookService: (data: { serviceId: string; date: string; time: string; status?: 'pending' | 'accepted' | 'in_progress' | 'completed' }) =>
      apiFetch('/bookings/book-now', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getBookings: (role: 'buyer' | 'seller' = 'buyer') => apiFetch(`/bookings?role=${role}`, { method: 'GET' }),
  },

  // Seller endpoints
  hustler: {
    getServices: () => apiFetch('/sellers/services', { method: 'GET' }),
    createService: (data: { title: string; description: string; category: string; default_price?: number; default_delivery_time?: string; express_price?: number; express_delivery_time?: string; portfolio?: string; }) =>
      apiFetch('/sellers/create-service', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateService: (id: string, data: { title?: string; description?: string; category?: string; default_price?: number; default_delivery_time?: string; express_price?: number; express_delivery_time?: string; portfolio?: string; is_verified?: boolean; }) =>
      apiFetch(`/sellers/edit-service/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleServiceStatus: (id: string) =>
      apiFetch(`/sellers/toggleServiceStatus/${id}`, {
        method: 'PUT',
      }),
    getBookings: () => apiFetch('/bookings?role=seller', { method: 'GET' }),
  },

  // Requests
  requests: {
    create: (data: { title: string; description: string; needed_by: string }) =>
      apiFetch('/requests/create-request', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

export type Api = typeof api;

