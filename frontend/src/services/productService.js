import api from './api';

export const productService = {
  getProducts: (params) => api.get('/products', { params }).then((r) => r.data),
  getProductBySlug: (slug) => api.get(`/products/${slug}`).then((r) => r.data),
  getCollection: (type, params) => api.get(`/products/collections/${type}`, { params }).then((r) => r.data),
  getReviews: (productId, params) => api.get(`/products/${productId}/reviews`, { params }).then((r) => r.data),
  submitReview: (productId, formData) =>
    api
      .post(`/products/${productId}/reviews`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`).then((r) => r.data),
};

export const categoryService = {
  getCategories: () => api.get('/categories').then((r) => r.data),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`).then((r) => r.data),
};

export const bannerService = {
  getBanners: (placement) => api.get('/banners', { params: placement ? { placement } : {} }).then((r) => r.data),
  trackClick: (id) => api.post(`/banners/${id}/click`).then((r) => r.data),
};

export default productService;
