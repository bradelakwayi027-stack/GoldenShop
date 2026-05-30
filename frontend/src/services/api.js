import axios from 'axios';

const isProd = import.meta.env.MODE === 'production';
// En dev: utiliser une URL relative (le proxy Vite redirige /api -> localhost:5000)
// En prod: utiliser VITE_API_URL ou la même origine
export const API_URL = isProd ? (import.meta.env.VITE_API_URL || '') : '';

if (isProd && !import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL is missing. API calls will use same origin.");
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper pour construire les URLs des images
const IMAGE_BASE = isProd ? (import.meta.env.VITE_API_URL || '') : 'http://127.0.0.1:5000';
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Si le chemin est déjà absolu, l'utiliser tel quel
  if (imagePath.startsWith('http')) return imagePath;
  // Sinon, préfixer avec l'URL du backend pour les images
  return `${IMAGE_BASE}${imagePath}`;
};

// Ajouter le token JWT à chaque requête et gérer FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Ne pas forcer Content-Type pour FormData
  // Laisser axios/navigateur gérer multipart/form-data automatiquement
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Auth
export const authService = {
  register: (name, email, password, role) =>
    api.post('/api/auth/register', { name, email, password, role }),
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
};

// Shops
export const shopService = {
  create: (payload) => api.post('/api/shops', payload),
  getAll: () => api.get('/api/shops'),
  getPending: () => api.get('/api/shops/pending'),
  approve: (id) => api.put(`/api/shops/${id}/approve`),
  delete: (id) => api.delete(`/api/shops/${id}`),
};

// Products
export const productService = {
  create: (payload) => api.post('/api/products', payload),
  getAll: () => api.get('/api/products'),
  getByShop: (shopId) => api.get(`/api/products/shop/${shopId}`),
  getMyProducts: () => api.get('/api/products/my'),
  update: (id, payload) => api.put(`/api/products/${id}`, payload),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// Orders
export const orderService = {
  create: (payload) => api.post('/api/orders', payload),
  getVendor: () => api.get('/api/orders/vendor'),
  getAdmin: () => api.get('/api/orders/admin'),
  getMine: () => api.get('/api/orders/mine'),
  delete: (id) => api.delete(`/api/orders/${id}`),
  markAsRead: (id) => api.put(`/api/orders/${id}/read-vendor`),
};

// Users
export const userService = {
  getAll: () => api.get('/api/users'),
};

// Messages
export const messageService = {
  adminSend: (payload) => api.post('/api/messages/admin/send', payload),
  getVendorMessages: () => api.get('/api/messages/vendor'),
  markAsRead: (id) => api.put(`/api/messages/${id}/read`),
};

// Payment (Flexpay)
export const paymentService = {
  initiateFlexpay: (payload) => api.post('/api/payment/flexpay/initiate', payload),
};

export default api;
