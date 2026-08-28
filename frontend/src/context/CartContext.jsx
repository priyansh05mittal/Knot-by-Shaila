import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { cartService } from '../services/userService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const { cart } = await cartService.getCart();
      setCart(cart);
    } catch (err) {
      // silent — cart will just appear empty
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId, quantity = 1, variant) => {
    try {
      const { cart } = await cartService.addToCart({ productId, quantity, variant });
      setCart(cart);
      toast.success('Added to your cart 🧶');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not add to cart.');
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const { cart } = await cartService.updateItem(itemId, quantity);
    setCart(cart);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const { cart } = await cartService.removeItem(itemId);
    setCart(cart);
    toast.success('Removed from cart');
  }, []);

  const clearCart = useCallback(async () => {
    await cartService.clearCart();
    setCart({ items: [] });
  }, []);

  const itemCount = useMemo(
    () => cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [cart.items]
  );

  const subtotal = useMemo(
    () => cart.items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0,
    [cart.items]
  );

  const value = useMemo(
    () => ({ cart, loading, itemCount, subtotal, addToCart, updateItem, removeItem, clearCart, refreshCart }),
    [cart, loading, itemCount, subtotal, addToCart, updateItem, removeItem, clearCart, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartContext;
