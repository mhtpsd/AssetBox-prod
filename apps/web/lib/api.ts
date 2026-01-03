import axios, { AxiosError, AxiosInstance } from 'axios';

const api:  AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
api.interceptors. request.use(
  (config) => {
    // Session token is sent via cookies automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return the data directly if success wrapper exists
    if (response. data?. success !== undefined) {
      return { ... response, data: response.data. data };
    }
    return response;
  },
  (error: AxiosError<{ message?:  string; errors?: Record<string, string[]> }>) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Redirect to login on client side
      if (typeof window !== 'undefined') {
        window. location.href = '/login';
      }
    }

    // Extract error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Create enhanced error
    const enhancedError = new Error(message) as any;
    enhancedError.status = error.response?. status;
    enhancedError.errors = error.response?. data?.errors;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

// API Methods

// Users
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data:  {
    name?:  string;
    username?: string;
    bio?: string;
    image?: string;
  }) => api.patch('/users/me', data),
  acceptTerms: () => api.post('/users/me/accept-terms'),
  getStats: () => api.get('/users/me/stats'),
  getEarnings: (days?:  number) =>
    api.get('/users/me/earnings', { params: { days } }),
  getProfile: (username: string) => api.get(`/users/${username}`),
  getUserAssets: (username:  string, page?:  number, limit?: number) =>
    api.get(`/users/${username}/assets`, { params: { page, limit } }),
};

// Assets
export const assetsApi = {
  list: (params?:  Record<string, any>) => api.get('/marketplace', { params }),
  search: (query: string, filters?: Record<string, any>) =>
    api.get('/marketplace/search', { params: { query, ... filters } }),
  get: (id:  string) => api.get(`/assets/${id}`),
  create: (data: FormData) =>
    api.post('/assets', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data:  FormData) =>
    api.patch(`/assets/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submit: (id: string, proof: { type: string; data: string; notes?: string }) =>
    api.post(`/assets/${id}/submit`, { 
      proofType: proof.type, 
      proofData: proof.data,
      notes: proof.notes 
    }),
  delete: (id:  string) => api.delete(`/assets/${id}`),
  getMyUploads: (params?: { status?: string; page?: number; limit?:  number }) =>
    api.get('/assets/my-uploads', { params }),
};

// Cart
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (assetId: string) => api.post('/cart/items', { assetId }),
  removeItem: (assetId: string) => api.delete(`/cart/items/${assetId}`),
  checkout: () => api.post('/payments/checkout'),
};

// Downloads
export const downloadsApi = {
  getUrl: (assetId: string) => api.post(`/downloads/${assetId}`),
  myAssets: (params?: { page?: number; limit?: number }) =>
    api.get('/downloads/my-assets', { params }),
};

// Notifications
export const notificationsApi = {
  list: (page?: number) => api.get('/notifications', { params:  { page } }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  getUnreadCount:  () => api.get('/notifications/unread-count'),
};

// Wallet
export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  getStats: () => api.get('/wallet/stats'),
  getEarnings: (params?: { page?: number; limit?: number }) =>
    api.get('/wallet/earnings', { params }),
  requestPayout: (amount: number) => api.post('/wallet/payout', { amount }),
  getPayoutHistory: (params?: { page?: number; limit?: number }) =>
    api.get('/wallet/payouts', { params }),
};

// Support API
export const supportApi = {
  // User endpoints
  createTicket: (data: { subject: string; message: string; priority?:  string }) =>
    api.post('/support/tickets', data),
  getTickets: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/support/tickets', { params }),
  getTicket: (id: string) =>
    api.get(`/support/tickets/${id}`),
  sendMessage: (ticketId: string, data: { message: string }) =>
    api.post(`/support/tickets/${ticketId}/messages`, data),
  updateTicket: (ticketId: string, data: { status?:  string }) =>
    api.patch(`/support/tickets/${ticketId}`, data),

  // Admin endpoints
  getAllTickets: (params?: { page?:  number; limit?: number; status?: string; priority?: string }) =>
    api.get('/support/admin/tickets', { params }),
  getTicketAdmin: (id: string) =>
    api.get(`/support/admin/tickets/${id}`),
  replyToTicket: (ticketId: string, data: { message:  string }) =>
    api.post(`/support/admin/tickets/${ticketId}/messages`, data),
  updateTicketAdmin: (ticketId: string, data: { status?: string; priority?: string }) =>
    api.patch(`/support/admin/tickets/${ticketId}`, data),
  getStats: () =>
    api.get('/support/admin/stats'),
};

// Admin
export const adminApi = {
  getPendingAssets: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/assets/pending', { params }),
  getAssetForReview: (id: string) =>
    api.get(`/admin/assets/${id}`),
  approveAsset: (id: string, note?: string) =>
    api.patch(`/admin/assets/${id}/approve`, { note }),
  rejectAsset: (id: string, reason: string) =>
    api.patch(`/admin/assets/${id}/reject`, { reason }),
  getPendingPayouts: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/payouts/pending', { params }),
  processPayout: (id: string) => api.patch(`/admin/payouts/${id}/process`),
  rejectPayout: (id: string, reason: string) =>
    api.patch(`/admin/payouts/${id}/reject`, { reason }),
  getStats: () => api.get('/admin/stats'),
};

// Add ordersApi
export const ordersApi = {
  list: (params?:  { page?: number; limit?: number }) =>
    api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
};

export default api;