import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const rentalApi = {
  getCategories: () => api.get('/rentals/categories').then((r) => r.data),

  getItems: (params) => api.get('/rentals/items', { params }).then((r) => r.data),
  getMyItems: (params) => api.get('/rentals/items/mine', { params }).then((r) => r.data),
  getItem: (itemId) => api.get(`/rentals/items/${itemId}`).then((r) => r.data),
  createItem: (payload) => api.post('/rentals/items', payload).then((r) => r.data),
  toggleLike: (itemId) => api.post(`/rentals/items/${itemId}/like`).then((r) => r.data),
  registerShare: (itemId) => api.post(`/rentals/items/${itemId}/share`).then((r) => r.data),
  checkAvailability: (itemId, from, to) =>
    api.get(`/rentals/items/${itemId}/availability`, { params: { from, to } }).then((r) => r.data),
  // NEW — powers the live delivery-fee estimate on the booking checkout page.
  // Calls GET /rentals/items/:itemId/delivery-quote?state=..&lga=..
  getDeliveryQuote: (itemId, state, lga) =>
    api.get(`/rentals/items/${itemId}/delivery-quote`, { params: { state, lga } }).then((r) => r.data),

  createBooking: (itemId, payload) => api.post(`/rentals/items/${itemId}/book`, payload).then((r) => r.data),
  verifyBookingPayment: (reference) => api.get(`/rentals/bookings/verify/${reference}`).then((r) => r.data),
  markCollected: (bookingId) => api.put(`/rentals/bookings/${bookingId}/collected`).then((r) => r.data),
  markReturned: (bookingId) => api.put(`/rentals/bookings/${bookingId}/return`).then((r) => r.data),
  confirmReturn: (bookingId) => api.put(`/rentals/bookings/${bookingId}/confirm-return`).then((r) => r.data),
  cancelBooking: (bookingId, reason) =>
    api.put(`/rentals/bookings/${bookingId}/cancel`, { reason }).then((r) => r.data),
  requestExtension: (bookingId, newEndDate) =>
    api.post(`/rentals/bookings/${bookingId}/extend`, { newEndDate }).then((r) => r.data),
  verifyExtensionPayment: (reference) =>
    api.get(`/rentals/bookings/extend/verify/${reference}`).then((r) => r.data),
  submitReview: (bookingId, payload) => api.post(`/rentals/bookings/${bookingId}/review`, payload).then((r) => r.data),
  getMyBookingsAsRenter: () => api.get('/rentals/bookings/mine/as-renter').then((r) => r.data),
  getMyBookingsAsOwner: () => api.get('/rentals/bookings/mine/as-owner').then((r) => r.data),

  initiateVideoSubscription: () => api.post('/rentals/video-subscription/initiate').then((r) => r.data),
  getVideoSubscriptionStatus: () => api.get('/rentals/video-subscription/status').then((r) => r.data),
};

export default api;














