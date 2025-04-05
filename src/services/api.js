import axios from 'axios';

// Configure base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
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

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Payment API endpoints
const payments = {
  verifyPayment: (paymentData) => api.post('/verify-payment', paymentData),
};

// Transactions API endpoints
const transactions = {
  create: (transactionData) => api.post('/transactions', transactionData),
  getById: (id) => api.get(`/transactions/${id}`),
  getAll: (params) => api.get('/transactions', { params }),
};

// Export API methods
export default {
  payments,
  transactions,
  
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
  },
  
  // Dashboard endpoints
  dashboard: {
    getSummary: () => api.get('/dashboard/summary'),
    getPlatformBreakdown: () => api.get('/dashboard/platforms'),
    getPerformanceMetrics: (period = '1y') => api.get(`/dashboard/performance?period=${period}`),
    getAssetAllocation: () => api.get('/dashboard/asset-allocation'),
    getRecentTransactions: (limit = 5) => api.get(`/dashboard/transactions?limit=${limit}`),
    getComparisonData: (metrics = ['returns', 'risk']) => api.post('/dashboard/comparison', { metrics }),
  },
  
  // Portfolio endpoints
  portfolio: {
    getAll: () => api.get('/portfolio'),
    getById: (id) => api.get(`/portfolio/${id}`),
    getByPlatform: (platform) => api.get(`/portfolio/platform/${platform}`),
    create: (data) => api.post('/portfolio', data),
    update: (id, data) => api.put(`/portfolio/${id}`, data),
    delete: (id) => api.delete(`/portfolio/${id}`),
  },
  
  // Mutual Fund endpoints
  mutualFunds: {
    search: (query) => api.get(`/mf/search?q=${query}`),
    getDetails: (schemeCode) => api.get(`/mf/${schemeCode}`),
    buy: (orderData) => api.post('/mf/buy', orderData),
    sell: (orderData) => api.post('/mf/sell', orderData),
    quickInvest: (orderData) => api.post('/mf/quick-invest', orderData),
    getMfuLink: (schemeCode) => api.get(`/mf/${schemeCode}/mfu-link`),
  },
  
  // Stock endpoints
  stocks: {
    search: (query) => api.get(`/stocks/search?q=${query}`),
    getDetails: (symbol) => api.get(`/stocks/${symbol}`),
    buy: (orderData) => api.post('/stocks/buy', orderData),
    sell: (orderData) => api.post('/stocks/sell', orderData),
  },
  
  // Comparison endpoints
  comparison: {
    compare: (items) => api.post('/comparison', { items }),
    getRecommendations: (itemId) => api.get(`/comparison/recommendations/${itemId}`),
  },
  
  // Cryptocurrency endpoints
  crypto: {
    getAll: () => api.get('/crypto'),
    getById: (id) => api.get(`/crypto/${id}`),
    getPrice: (symbol) => api.get(`/crypto/${symbol}/price`),
    buy: (orderData) => api.post('/crypto/buy', orderData),
    sell: (orderData) => api.post('/crypto/sell', orderData),
    getTopAssets: (limit = 10) => api.get(`/crypto/top?limit=${limit}`),
    getHistory: (symbol, period = '1y') => api.get(`/crypto/${symbol}/history?period=${period}`),
  },
  
  // Unified Trading API
  trading: {
    search: (query, assetType = 'all') => api.get(`/trading/search?q=${query}&type=${assetType}`),
    getDetails: (symbol, assetType) => api.get(`/trading/${assetType}/${symbol}`),
    buy: (orderData) => api.post('/trading/buy', orderData),
    sell: (orderData) => api.post('/trading/sell', orderData),
    quickBuy: (symbol, assetType, amount) => api.post('/trading/quick-buy', { symbol, assetType, amount }),
    quickSell: (symbol, assetType, units, amount) => api.post('/trading/quick-sell', { symbol, assetType, units, amount }),
    getQuote: (symbol, assetType, quantity) => api.get(`/trading/quote?symbol=${symbol}&type=${assetType}&quantity=${quantity}`),
    getMarketHours: (exchange) => api.get(`/trading/market-hours?exchange=${exchange}`),
    getAssetTypes: () => api.get('/trading/asset-types'),
  },
};
