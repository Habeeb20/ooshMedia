import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const feedAPI = {
  getFeed: (params) => API.get('/api/posts/feed', { params }),
  getPost: (id) => API.get(`/api/posts/${id}`),
  createPost: (data) => API.post('/api/posts', data),
  updatePost: (id, data) => API.put(`/api/posts/${id}`, data),
  deletePost: (id) => API.delete(`/api/posts/${id}`),
  toggleLike: (id) => API.post(`/api/posts/${id}/like`),
  repost: (id, data) => API.post(`/api/posts/${id}/repost`, data),
  share: (id) => API.post(`/api/posts/${id}/share`),
  addReview: (id, data) => API.post(`/api/posts/${id}/review`, data),
  applyToPost: (id, data) => API.post(`/api/posts/${id}/apply`, data),
  getApplications: (id) => API.get(`/api/posts/${id}/applications`),
  updateApplicationStatus: (postId, appId, status) =>
    API.patch(`/api/posts/${postId}/applications/${appId}/status`, { status }),
  withdrawApplication: (postId, appId) =>
    API.delete(`/api/posts/${postId}/applications/${appId}/withdraw`),
  getMyApplications: () => API.get('/api/posts/my-applications'),
  getUserPosts: (userId) => API.get(`/api/posts/user/${userId}`),
};

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
};

























const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
 
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─────────────────────────────────────────────
// src/App.jsx — Router setup (add to your existing App.jsx)
// ─────────────────────────────────────────────
/*
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import POSPage from './pages/POSPage';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderId" element={<OrderDetailPage />} />
          <Route path="/payment/verify" element={<PaymentVerifyPage />} />
          <Route path="/dashboard/seller" element={<SellerDashboard />} />
          <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
          <Route path="/pos" element={<POSPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
*/
