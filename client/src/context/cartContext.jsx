// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import api from '../config/api';

// const CartContext = createContext(null);

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchCart = useCallback(async () => {
//     try {
//       const { data } = await api.get('/api/cart');
//       setCart(data);
//     } catch (err) {
//       console.error(err);
//     }
//   }, []);

//   useEffect(() => { fetchCart(); }, [fetchCart]);

//   const addToCart = async (productId, quantity = 1) => {
//     setLoading(true);
//     try {
//       const { data } = await api.post('/api/cart/add', { productId, quantity });
//       setCart(data.cart);
//       return { success: true };
//     } catch (err) {
//       return { success: false, message: err.response?.data?.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateItem = async (productId, quantity) => {
//     try {
//       const { data } = await api.put(`/api/cart/item/${productId}`, { quantity });
//       setCart(data.cart);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const removeItem = async (productId) => {
//     try {
//       const { data } = await api.delete(`/api/cart/item/${productId}`);
//       setCart(data.cart);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const updateFulfillment = async (options) => {
//     try {
//       const { data } = await api.put('/api/cart/fulfillment', options);
//       setCart(data.cart);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const clearCart = async () => {
//     await api.delete('/api/cart');
//     setCart(null);
//   };

//   const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
//   const cartTotal = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

//   return (
//     <CartContext.Provider value={{
//       cart, loading, fetchCart, addToCart, updateItem,
//       removeItem, updateFulfillment, clearCart, cartCount, cartTotal,
//     }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);


































import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import api from '../utils/api';
import api from '../config/api';
import axios from 'axios';
import {toast} from 'sonner'
const defaultValue = {
  cart: null,
  loading: false,
  cartCount: 0,
  cartTotal: 0,
  fetchCart: async () => {},
  addToCart: async () => ({ success: false, message: 'CartProvider not mounted' }),
  updateItem: async () => {},
  removeItem: async () => {},
  updateFulfillment: async () => {},
  clearCart: async () => {},
};

const CartContext = createContext(defaultValue);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await api.get('/api/cart');
      console.log(data)
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const { data } = await api.post('/add', { productId, quantity });
      setCart(data.cart);
      toast.success('Item added to cart');
      return { success: true };
    } catch (err) {
      toast.error( err.response?.data?.message || 'Failed to add item to cart');
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/api/cart/item/${productId}`, { quantity });
      setCart(data.cart);
      toast.success('Cart updated');
    } catch (err) {
      toast.error( err.response?.data?.message || 'Failed to update cart');
      console.error(err);
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await api.delete(`/api/cart/item/${productId}`);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error( err.response?.data?.message || 'Failed to remove item from cart');
      console.error(err);
    }
  };

  const updateFulfillment = async (options) => {
    try {
      const { data } = await api.put('/api/cart/fulfillment', options);
      setCart(data.cart);
      toast.success('Fulfillment updated');
    } catch (err) {
      toast.error( err.response?.data?.message || 'Failed to update fulfillment');
      console.error(err);
    }
  };

  const clearCart = async () => {
    await api.delete('/cart');
    toast.success('Cart cleared');
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


// Safe hook — works even if CartProvider is not yet mounted
export const useCart = () => useContext(CartContext);






























