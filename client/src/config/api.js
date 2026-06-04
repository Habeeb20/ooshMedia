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
     
    }
    return Promise.reject(err);
  }
);

export default api;







// config/api.js
// Extend your existing api.js with these deal + subscription methods

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

async function request(path, opts = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.message || `HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

export const dealsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/deals?${qs}`);
  },
  getOne: (id) => request(`/deals/${id}`),
  create: (body) => request('/deals', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/deals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => request(`/deals/${id}`, { method: 'DELETE' }),
  updateStatus: (id, status) => request(`/deals/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  like: (id) => request(`/deals/${id}/like`, { method: 'POST' }),
  repost: (id) => request(`/deals/${id}/repost`, { method: 'POST' }),
  share: (id) => request(`/deals/${id}/share`, { method: 'POST' }),

  addComment: (id, text) => request(`/deals/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  deleteComment: (id, commentId) => request(`/deals/${id}/comments/${commentId}`, { method: 'DELETE' }),

  addReview: (id, body) => request(`/deals/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),

  sendMessage: (id, text) => request(`/deals/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
  getMessages: (id) => request(`/deals/${id}/messages`),
};

export const subscriptionAPI = {
  getBalance: () => request('/deals/subscription/balance'),
  initiate: () => request('/deals/subscription/initiate', { method: 'POST' }),
  verify: (reference) => request(`/deals/subscription/verify?reference=${reference}`),
};

