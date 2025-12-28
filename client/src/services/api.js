import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

// Books API
export const booksAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/books/categories/list');
    return response.data;
  },
  create: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },
  update: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  create: async (userId, items, shippingAddress, paymentMethod = 'cash') => {
    const response = await api.post('/orders', {
      userId,
      items,
      shippingAddress,
      paymentMethod,
    });
    return response.data;
  },
  getUserOrders: async (userId) => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  cancel: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

// User Books API
export const userBooksAPI = {
  getUserBooks: async (userId) => {
    const response = await api.get(`/user-books/${userId}`);
    return response.data;
  },
  checkOwnership: async (userId, bookId) => {
    const response = await api.get(`/user-books/${userId}/check/${bookId}`);
    return response.data;
  },
  getCategories: async (userId) => {
    const response = await api.get(`/user-books/${userId}/categories`);
    return response.data;
  },
  getStats: async (userId) => {
    const response = await api.get(`/user-books/${userId}/stats`);
    return response.data;
  },
};

// Membership API
export const membershipAPI = {
  subscribe: async (userId, planType, duration = 30) => {
    const response = await api.post('/memberships/subscribe', {
      userId,
      planType,
      duration,
    });
    return response.data;
  },
  getUserMembership: async (userId) => {
    const response = await api.get(`/memberships/user/${userId}`);
    return response.data;
  },
  cancel: async (id) => {
    const response = await api.put(`/memberships/${id}/cancel`);
    return response.data;
  },
  renew: async (id, duration = 30) => {
    const response = await api.put(`/memberships/${id}/renew`, { duration });
    return response.data;
  },
  getPlans: async () => {
    const response = await api.get('/memberships/plans');
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/memberships/${id}`);
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  submit: async (userId, bookId, rating, comment) => {
    const response = await api.post('/feedback', {
      userId,
      bookId,
      rating,
      comment,
    });
    return response.data;
  },
  getBookFeedback: async (bookId, params = {}) => {
    const response = await api.get(`/feedback/book/${bookId}`, { params });
    return response.data;
  },
  getUserFeedback: async (userId) => {
    const response = await api.get(`/feedback/user/${userId}`);
    return response.data;
  },
  getRecent: async (limit = 10) => {
    const response = await api.get('/feedback/recent', { params: { limit } });
    return response.data;
  },
  update: async (id, rating, comment) => {
    const response = await api.put(`/feedback/${id}`, { rating, comment });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getUserDetails: async (id) => {
    const response = await api.get(`/admin/users/${id}/details`);
    return response.data;
  },
  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },
  getSalesReport: async (params = {}) => {
    const response = await api.get('/admin/sales-report', { params });
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  // Book management
  addBook: async (bookData) => {
    const response = await api.post('/admin/books', bookData);
    return response.data;
  },
  updateBook: async (id, bookData) => {
    const response = await api.put(`/admin/books/${id}`, bookData);
    return response.data;
  },
  deleteBook: async (id) => {
    const response = await api.delete(`/admin/books/${id}`);
    return response.data;
  },
};

export default api;
