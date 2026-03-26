import React, { createContext, useContext, useMemo, useState } from 'react';
import { useToast } from '../components/ToastContext';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  updateQty: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;
  totalQuantity: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + qty } : p));
      }
      return [...prev, { ...item, quantity: qty }];
    });
    showToast(`Đã thêm ${item.name} vào giỏ hàng`, 'success');
  };

  const updateQty = (id: number, qty: number) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity: qty } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  const removeItem = (id: number) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const { totalQuantity, totalPrice } = useMemo(
    () => ({
      totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem,
    updateQty,
    removeItem,
    clear,
    totalQuantity,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

