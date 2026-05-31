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