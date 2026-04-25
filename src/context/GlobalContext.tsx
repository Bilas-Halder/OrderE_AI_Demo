"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { foods } from "@/data/foods";
import toast from "react-hot-toast";

export type IntentLog = {
  id: string;
  transcript: string;
  parsedJSON: any;
  success: boolean;
  isCorrect: boolean | null; // For manual dashboard evaluation
  timestamp: number;
};

export interface CartItem {
  id: number;
  name: string;
  price: number;
  description: string;
  quantity: number;
}

interface AppState {
  cart: CartItem[];
  orders: any[];
  aiLogs: IntentLog[];
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  decrementFromCart: (id: number) => void;
  clearCart: () => void;
  placeOrder: (details: any) => void;
  addLog: (log: Omit<IntentLog, "id" | "timestamp">) => void;
  toggleLogCorrectness: (id: string, isCorrect: boolean) => void;
}

const GlobalContext = createContext<AppState | null>(null);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<IntentLog[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedOrders = localStorage.getItem("orders");
    const savedLogs = localStorage.getItem("aiLogs");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedLogs) setAiLogs(JSON.parse(savedLogs));
  }, []);

  // Save to localStorage on change
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("aiLogs", JSON.stringify(aiLogs)), [aiLogs]);

  const addToCart = (id: number) => {
    const food = foods.find(f => f.id === id);
    if (!food) return;

    setCart(prev => {
      const existingItem = prev.find(item => item.id === id);
      if (existingItem) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...food, quantity: 1 }];
    });
    toast.success(`${food.name} added!`);
  };

  const decrementFromCart = (id: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });

    toast.error("Item removed from cart");
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
    toast.error("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  const placeOrder = (details: any) => {
    setOrders(prev => [...prev, { id: Date.now(), items: cart, details }]);
    setCart([]);
    toast.success("Purchase completed successfully! 🎉");
  };

  const addLog = (log: Omit<IntentLog, "id" | "timestamp">) => {
    setAiLogs(prev => [{ ...log, id: crypto.randomUUID(), timestamp: Date.now() }, ...prev]);
  };

  const toggleLogCorrectness = (id: string, isCorrect: boolean) => {
    setAiLogs(prev => prev.map(log => log.id === id ? { ...log, isCorrect } : log));
  };

  return (
    <GlobalContext.Provider value={{ cart, orders, aiLogs, addToCart, decrementFromCart, removeFromCart, clearCart, placeOrder, addLog, toggleLogCorrectness }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useAppStore must be used within GlobalProvider");
  return context;
};


