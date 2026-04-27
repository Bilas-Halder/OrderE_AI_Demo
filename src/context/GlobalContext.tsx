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
export type UserFormData = {
  name: string;
  age: string;
  address: string;
};

interface AppState {
  cart: CartItem[];
  orders: any[];
  aiLogs: IntentLog[];
  formData: UserFormData;
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  decrementFromCart: (id: number) => void;
  clearCart: () => void;
  placeOrder: (details?: any, cart?: any[]) => boolean
  setFormData: (data: Partial<UserFormData>) => void;
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

  const addToCart = (itemId: number) => {
    const itemToAdd = foods.find(f => f.id === itemId);
    if (!itemToAdd) return;
    toast.success(`${itemToAdd.name} added to cart!`)
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === itemId);
      if (existingItem) {
        // If it exists, increase quantity
        return prevCart.map(i => 
          i.id === itemId ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      } else {
        // If it's new, add it to the previous state
        return [...prevCart, { ...itemToAdd, quantity: 1 }];
      }
    });
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

 // Accept both override details AND an override cart
  const placeOrder = (overrideDetails?: any, overrideCart?: any[]) : boolean => {
    // Grab the exact data passed in, or fallback to state
    const finalDetails = overrideDetails || formData;
    const finalCart = overrideCart || cart; 

    if (finalCart.length === 0) {
      toast.error("Cart is empty!");
      return false;
    }
    
    if (!finalDetails.name || !finalDetails.address) {
      toast.error("Missing name or address for delivery!");
      return false;
    }

    setOrders(prev => [...prev, { 
      id: Date.now(), 
      items: finalCart, 
      details: finalDetails 
    }]);
    toast.success("Your order is placed!");
    setCart([]); 
    return true;
  };

  const [formData, setFormDataState] = useState<UserFormData>({ name: '', age: "", address: '' });

  const setFormData = (data: Partial<UserFormData>) => {
    console.log(data)
    setFormDataState(prev => ({ ...prev, ...data }));
  };

  const addLog = (log: Omit<IntentLog, "id" | "timestamp">) => {
    setAiLogs(prev => [{ ...log, id: crypto.randomUUID(), timestamp: Date.now() }, ...prev]);
  };

  const toggleLogCorrectness = (id: string, isCorrect: boolean) => {
    setAiLogs(prev => prev.map(log => log.id === id ? { ...log, isCorrect } : log));
  };

  return (
    <GlobalContext.Provider value={{ cart, orders, aiLogs,formData, addToCart, decrementFromCart, removeFromCart, clearCart, placeOrder, setFormData, addLog, toggleLogCorrectness }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useAppStore must be used within GlobalProvider");
  return context;
};


