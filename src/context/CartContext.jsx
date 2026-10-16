import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Bumped from 'tl_cart' when the API moved from Mongo _id strings to integer
// ids. Returning visitors' saved carts hold the old shape, so they are dropped
// rather than posted to an API that no longer understands them.
const CART_STORAGE_KEY = 'tl_cart_v2';

// Quantity a line may hold. Items saved before stockCount was tracked have no
// limit until the catalogue refresh fills it in.
const clampToStock = (quantity, stockCount) =>
  typeof stockCount === 'number' ? Math.min(quantity, stockCount) : quantity;

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
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Private mode or full storage: the cart still works for this visit.
    }
  }, [cart]);

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 2000);
  };

  const addToCart = (product) => {
    if (product.stockCount <= 0) return;

    const existing = cart.find((item) => item.id === product.id);
    if (existing && existing.quantity >= product.stockCount) {
      showToast(`Only ${product.stockCount} available`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, ...product, quantity: clampToStock(item.quantity + 1, product.stockCount) }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    showToast('Item Added to Cart');
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQuantity = clampToStock(Math.max(1, item.quantity + delta), item.stockCount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // The saved cart is a snapshot from whenever the visitor added each piece.
  // Re-reading it against the live catalogue keeps the displayed prices honest
  // (the server prices the order from the database regardless), drops pieces
  // that were deleted or sold out, and trims quantities to what is in stock.
  const syncWithCatalog = useCallback((products) => {
    if (!Array.isArray(products) || products.length === 0) return;
    const byId = new Map(products.map((p) => [p.id, p]));

    setCart((prevCart) => {
      let changed = false;
      const next = [];
      for (const item of prevCart) {
        const live = byId.get(item.id);
        if (!live || live.stockCount <= 0) {
          changed = true;
          continue;
        }
        const quantity = clampToStock(item.quantity, live.stockCount);
        if (
          quantity !== item.quantity ||
          live.price !== item.price ||
          live.stockCount !== item.stockCount ||
          live.name !== item.name ||
          live.images?.[0] !== item.images?.[0]
        ) {
          changed = true;
        }
        next.push({ ...item, ...live, quantity });
      }
      return changed ? next : prevCart;
    });
  }, []);

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
        syncWithCatalog,
        totalItems,
        subtotal,
        isToastOpen,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
