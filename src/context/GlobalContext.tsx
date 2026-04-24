"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { foods } from "@/data/foods";

export type IntentLog = {
  id: string;
  transcript: string;
  parsedJSON: any;
  success: boolean;
  isCorrect: boolean | null; // For manual dashboard evaluation
  timestamp: number;
};

interface AppState {
  cart: typeof foods;
  orders: any[];
  aiLogs: IntentLog[];
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  placeOrder: (details: any) => void;
  addLog: (log: Omit<IntentLog, "id" | "timestamp">) => void;
  toggleLogCorrectness: (id: string, isCorrect: boolean) => void;
}

const GlobalContext = createContext<AppState | null>(null);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<typeof foods>([]);
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
    if (food) setCart(prev => [...prev, food]);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);
  
  const placeOrder = (details: any) => {
    setOrders(prev => [...prev, { id: Date.now(), items: cart, details }]);
    clearCart();
  };

  const addLog = (log: Omit<IntentLog, "id" | "timestamp">) => {
    setAiLogs(prev => [{ ...log, id: crypto.randomUUID(), timestamp: Date.now() }, ...prev]);
  };

  const toggleLogCorrectness = (id: string, isCorrect: boolean) => {
    setAiLogs(prev => prev.map(log => log.id === id ? { ...log, isCorrect } : log));
  };

  return (
    <GlobalContext.Provider value={{ cart, orders, aiLogs, addToCart, removeFromCart, clearCart, placeOrder, addLog, toggleLogCorrectness }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useAppStore must be used within GlobalProvider");
  return context;
};