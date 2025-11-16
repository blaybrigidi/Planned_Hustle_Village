/**
 * API Configuration for connecting to the backend
 */

// Backend API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      apiFetch('/auth/logout', {
        method: 'POST',
      }),
  },

  // Services endpoints (public)
  services: {
    getAll: (params?: { category?: string; search?: string; limit?: number; offset?: number; sortBy?: string; order?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.order) queryParams.append('order', params.order);
      const query = queryParams.toString();
      return apiFetch(`/services${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getById: (id: string) => apiFetch(`/services/${id}`, { method: 'GET' }),
  },

  // Seller endpoints
  sellers: {
    createService: (data: any) =>
      apiFetch('/sellers/create-service', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateService: (serviceId: string, data: any) =>
      apiFetch(`/sellers/edit-service/${serviceId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleServiceStatus: (serviceId: string) =>
      apiFetch(`/sellers/toggleServiceStatus/${serviceId}`, {
        method: 'PUT',
      }),
    setupSeller: (data: any) =>
      apiFetch('/sellers/setup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Booking endpoints
  bookings: {
    create: (data: { serviceId: string; date: string; time: string; status?: string }) =>
      apiFetch('/bookings/book-now', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getById: (bookingId: string) =>
      apiFetch(`/bookings/${bookingId}`, { method: 'GET' }),
    getUserBookings: (role: 'buyer' | 'seller' = 'buyer') =>
      apiFetch(`/bookings?role=${role}`, { method: 'GET' }),
    accept: (bookingId: string) =>
      apiFetch(`/bookings/${bookingId}/accept`, {
        method: 'PATCH',
      }),
  },

  // Request endpoints
  requests: {
    create: (data: { title: string; description: string; needed_by: string }) =>
      apiFetch('/requests/create-request', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    accept: (requestId: string) =>
      apiFetch(`/requests/${requestId}/accept`, {
        method: 'PATCH',
      }),
  },

  // Health check
  health: () => apiFetch('/health', { method: 'GET' }),
};

export default api;

