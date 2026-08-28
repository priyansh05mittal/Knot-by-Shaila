import api from './api';

export const cartService = {
  getCart: () => api.get('/cart').then((r) => r.data),
  addToCart: (data) => api.post('/cart', data).then((r) => r.data),
  updateItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`).then((r) => r.data),
  clearCart: () => api.delete('/cart').then((r) => r.data),
};

export const orderService = {
  createRazorpayOrder: (amount) => api.post('/orders/razorpay/create', { amount }).then((r) => r.data),
  placeOrder: (data) => api.post('/orders', data).then((r) => r.data),
  getMyOrders: () => api.get('/orders').then((r) => r.data),
  getOrderById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
};

export const customOrderService = {
  create: (formData) =>
    api.post('/custom-orders', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  getMine: () => api.get('/custom-orders').then((r) => r.data),
  getById: (id) => api.get(`/custom-orders/${id}`).then((r) => r.data),
  acceptQuote: (id) => api.put(`/custom-orders/${id}/accept-quote`).then((r) => r.data),
};

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data).then((r) => r.data),
  updateAvatar: (formData) =>
    api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  changePassword: (data) => api.put('/users/change-password', data).then((r) => r.data),
  addAddress: (data) => api.post('/users/addresses', data).then((r) => r.data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`).then((r) => r.data),
  getWishlist: () => api.get('/users/wishlist').then((r) => r.data),
  toggleWishlist: (productId) => api.post(`/users/wishlist/${productId}`).then((r) => r.data),
  getRecentlyViewed: () => api.get('/users/recently-viewed').then((r) => r.data),
  trackRecentlyViewed: (productId) => api.post(`/users/recently-viewed/${productId}`).then((r) => r.data),
};
