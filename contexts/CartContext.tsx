import React, { createContext, useContext, useState } from 'react';
import { Car } from '../types/firebase';

interface CartItem {
  car: Car;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (car: Car) => void;
  removeFromCart: (carId: number) => void;
  updateQuantity: (carId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (car: Car) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.car.id === car.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.car.id === car.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { car, quantity: 1 }];
    });
  };

  const removeFromCart = (carId: number) => {
    setItems(prevItems => prevItems.filter(item => item.car.id !== carId));
  };

  const updateQuantity = (carId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(carId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.car.id === carId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + (item.car.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}