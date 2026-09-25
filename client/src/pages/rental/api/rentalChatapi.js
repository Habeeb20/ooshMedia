import api from './rentalApi'; // reuses the same configured axios instance + interceptor

export const chatApi = {
  getMyConversations: () => api.get('/rentals/conversations/conversations').then((r) => r.data),
  getMessages: (bookingId, params) =>
    api.get(`/rentals/conversations/bookings/${bookingId}/messages`, { params }).then((r) => r.data),
  sendMessage: (bookingId, text) =>
    api.post(`/rentals/conversations/bookings/${bookingId}/messages`, { text }).then((r) => r.data),
};

