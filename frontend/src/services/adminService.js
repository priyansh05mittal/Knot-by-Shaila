import api from './api';

export const adminService = {
  // Dashboard / Analytics
  getDashboardStats: () => api.get('/admin/analytics/dashboard').then((r) => r.data),
  getSalesAnalytics: (days) => api.get('/admin/analytics/sales', { params: { days } }).then((r) => r.data),
  getProductAnalytics: () => api.get('/admin/analytics/products').then((r) => r.data),
  getUserAnalytics: (days) => api.get('/admin/analytics/users', { params: { days } }).then((r) => r.data),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }).then((r) => r.data),
  createProduct: (formData) =>
    api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  updateProduct: (id, formData) =>
    api.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
  removeProductImage: (id, publicId) =>
    api.delete(`/admin/products/${id}/images/${encodeURIComponent(publicId)}`).then((r) => r.data),

  // Categories
  getCategories: () => api.get('/admin/categories').then((r) => r.data),
  createCategory: (formData) =>
    api.post('/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  updateCategory: (id, formData) =>
    api.put(`/admin/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),

  // Banners
  getBanners: () => api.get('/admin/banners').then((r) => r.data),
  createBanner: (formData) =>
    api.post('/admin/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  updateBanner: (id, formData) =>
    api.put(`/admin/banners/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`).then((r) => r.data),

  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data).then((r) => r.data),

  // Custom Orders
  getCustomOrders: (params) => api.get('/admin/custom-orders', { params }).then((r) => r.data),
  updateCustomOrder: (id, data) => api.put(`/admin/custom-orders/${id}`, data).then((r) => r.data),

  // Reviews
  getReviews: (params) => api.get('/admin/reviews', { params }).then((r) => r.data),
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`).then((r) => r.data),
  rejectReview: (id, reason) => api.put(`/admin/reviews/${id}/reject`, { reason }).then((r) => r.data),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  getUserById: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  blockUser: (id, reason) => api.put(`/admin/users/${id}/block`, { reason }).then((r) => r.data),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`).then((r) => r.data),
};

export default adminService;
