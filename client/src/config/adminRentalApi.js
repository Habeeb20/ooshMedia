
import api from '../pages/rental/api/rentalApi';

export const adminRentalApi = {
  getStats: () => api.get('/admin/rentals/stats').then((r) => r.data),

  getItems: (params) => api.get('/admin/rentals/items', { params }).then((r) => r.data),
  getItem: (itemId) => api.get(`/admin/rentals/items/${itemId}`).then((r) => r.data),

  getBookings: (params) => api.get('/admin/rentals/bookings', { params }).then((r) => r.data),
  getBooking: (bookingId) => api.get(`/admin/rentals/bookings/${bookingId}`).then((r) => r.data),
};

export default adminRentalApi;