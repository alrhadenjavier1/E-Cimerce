// src/context/CartContext.tsx - Fix updateQuantity
import React, { createContext, useContext, useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../utils/storeConfig';

export interface CartItem extends Product {
  quantity: number;
  cart_item_id?: string;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => Promise<void>;
  removeFromCart: (productId: string, cartItemId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, cartItemId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getCartTotal: () => number;
  getCartCount: () => number;
  getWishlistCount: () => number;
  syncCartWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      syncCartWithServer();
      syncWishlistWithServer();
    } else {
      loadFromLocalStorage();
    }
  }, [user]);

  const loadFromLocalStorage = () => {
    const savedCart = localStorage.getItem('guest_cart');
    const savedWishlist = localStorage.getItem('guest_wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    setLoading(false);
  };

  const saveToLocalStorage = () => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(cart));
      localStorage.setItem('guest_wishlist', JSON.stringify(wishlist));
    }
  };

  const syncCartWithServer = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const serverCart = await databaseService.getCartItems(user.id);
      
      const localCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      
      if (localCart.length > 0) {
        for (const item of localCart) {
          await databaseService.addToCart(user.id, item.id, item.quantity);
        }
        localStorage.removeItem('guest_cart');
        localStorage.removeItem('guest_wishlist');
      }
      
      const formattedCart: CartItem[] = serverCart.map((item: any) => ({
        ...item.product,
        quantity: item.quantity,
        cart_item_id: item.id,
        selectedSize: item.size,
        selectedColor: item.color
      }));
      
      setCart(formattedCart);
    } catch (error) {
      console.error('Failed to sync cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncWishlistWithServer = async () => {
    if (!user) return;
    
    try {
      const serverWishlist = await databaseService.getWishlistItems(user.id);
      const formattedWishlist = serverWishlist.map((item: any) => item.product);
      setWishlist(formattedWishlist);
    } catch (error) {
      console.error('Failed to sync wishlist:', error);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1, size?: string, color?: string) => {
    if (user) {
      await databaseService.addToCart(user.id, product.id, quantity, size, color);
      await syncCartWithServer();
    } else {
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color }];
      });
    }
    saveToLocalStorage();
  };

  const removeFromCart = async (productId: string, cartItemId?: string) => {
    if (user && cartItemId) {
      await databaseService.removeFromCart(cartItemId);
      await syncCartWithServer();
    } else {
      setCart(prev => prev.filter(item => item.id !== productId));
      saveToLocalStorage();
    }
  };

  // FIXED: Update quantity - now uses productId instead of cartItemId for guest cart
  const updateQuantity = async (productId: string, quantity: number, cartItemId?: string) => {
    if (quantity <= 0) {
      await removeFromCart(productId, cartItemId);
      return;
    }

    if (user && cartItemId) {
      await databaseService.updateCartItemQuantity(cartItemId, quantity);
      await syncCartWithServer();
    } else {
      // Guest cart - update by product ID
      setCart(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
      saveToLocalStorage();
    }
  };

  const clearCart = async () => {
    if (user) {
      await databaseService.clearCart(user.id);
      await syncCartWithServer();
    } else {
      setCart([]);
      saveToLocalStorage();
    }
  };

  const addToWishlist = async (product: Product) => {
    if (user) {
      await databaseService.addToWishlist(user.id, product.id);
      await syncWishlistWithServer();
    } else {
      setWishlist(prev => {
        if (prev.some(item => item.id === product.id)) return prev;
        return [...prev, product];
      });
      saveToLocalStorage();
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (user) {
      await databaseService.removeFromWishlist(user.id, productId);
      await syncWishlistWithServer();
    } else {
      setWishlist(prev => prev.filter(item => item.id !== productId));
      saveToLocalStorage();
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getCartTotal,
        getCartCount,
        getWishlistCount,
        syncCartWithServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};