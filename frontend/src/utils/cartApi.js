// frontend/src/utils/cartApi.js
import api from './api';

export const cartApi = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addItem: async (productId, quantity = 1) => {
    const response = await api.post('/cart/items', {
      productId,
      quantity
    });
    return response.data;
  },

  // Update item quantity
  updateItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  // Complete checkout
  checkout: async () => {
    const response = await api.post('/cart/checkout');
    return response.data;
  },
};

export default cartApi;

