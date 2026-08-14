import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Bumped from 'tl_cart' when the API moved from Mongo _id strings to integer
// ids. Returning visitors' saved carts hold the old shape, so they are dropped
// rather than posted to an API that no longer understands them.
const CART_STORAGE_KEY = 'tl_cart_v2';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const localData = localStorage.getItem(CART_STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    
    // Trigger success feedback
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 2000);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isToastOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
