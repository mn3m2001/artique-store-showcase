"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, ProductVariant } from "@/types";

export interface CartItem {
  id: string; // unique item key combining product, variant, and custom notes
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
  customNote?: string;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: ProductVariant | null, customNote?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "artique_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
    await Promise.resolve();
    if (!active) return;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setItems(parsed.filter((item) => item && typeof item.id === "string" && item.product && typeof item.product.slug === "string" && Number.isInteger(item.quantity) && item.quantity > 0 && Number.isFinite(item.unitPrice)));
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsHydrated(true);
    }
    };
    void hydrate();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore localStorage quota errors
      }
    }
  }, [items, isHydrated]);

  const addItem = (
    product: Product,
    quantity = 1,
    variant: ProductVariant | null = null,
    customNote = ""
  ) => {
    setItems((prev) => {
      const unitPrice =
        variant?.price_override && variant.price_override > 0
          ? variant.price_override
          : product.base_price;

      const itemKey = `${product.id}__${variant?.id || "default"}__${(customNote || "").trim().toLowerCase()}`;
      const existingIdx = prev.findIndex((i) => i.id === itemKey);

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
        return next;
      }

      return [
        ...prev,
        {
          id: itemKey,
          product,
          variant: variant || null,
          quantity,
          customNote: customNote.trim() || undefined,
          unitPrice,
        },
      ];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
