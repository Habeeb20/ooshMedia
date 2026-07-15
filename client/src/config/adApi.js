import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adAPI = {
  getPlans: () => API.get('/api/ads/plans'),
  getActiveAds: (adType) => API.get('/api/ads/active', { params: adType ? { adType } : {} }),
  subscribe: (data) => API.post('/api/ads/subscribe', data),
  verify: (reference) => API.get('/api/ads/verify', { params: { reference } }),
  getMySubscriptions: (status) => API.get('/api/ads/my-subscriptions', { params: status ? { status } : {} }),
  getStats: () => API.get('/api/ads/stats'),
  cancel: (id) => API.put(`/api/ads/${id}/cancel`),
  trackClick: (id) => API.post(`/api/ads/${id}/click`),
};