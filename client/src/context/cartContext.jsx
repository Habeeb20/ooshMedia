import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      setCart(data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/item/${productId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/item/${productId}`);
      setCart(data.cart);
    } catch (err) {
      console.error(err);
    }
  };

  const updateFulfillment = async (options) => {
    try {
      const { data } = await api.put('/cart/fulfillment', options);
      setCart(data.cart);
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart(null);
  };

  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart, loading, fetchCart, addToCart, updateItem,
      removeItem, updateFulfillment, clearCart, cartCount, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
