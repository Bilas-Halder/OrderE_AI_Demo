"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/context/GlobalContext";
import { Suspense } from "react";

export default function OrderListContent() {
  const { orders } = useAppStore();
  const searchParams = useSearchParams();
  const isNewOrder = searchParams.get("newOrder") === "true";
  
  const [highlightFirst, setHighlightFirst] = useState(isNewOrder);

  useEffect(() => {
    if (highlightFirst) {
      const timer = setTimeout(() => setHighlightFirst(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [highlightFirst]);

  return (
    <div className="space-y-6">
      {[...orders].reverse().map((order, index) => (
          <div 
            key={order.id} 
            className={`p-6 rounded-xl border transition-all duration-700 ${
              index === 0 && highlightFirst 
                ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" 
                : "bg-gray-800 border-gray-700"
            }`}
          >
            
            {/* Customer & Order Details Section */}
            <div className="mb-4 pb-4 border-b border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">Order Details</h3>
                <span className="text-xs text-gray-400 font-mono">ID: {order.id}</span>
              </div>
              
              {order.details && (
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <p><span className="text-gray-500">Name:</span> {order.details.name}</p>
                  <p><span className="text-gray-500">Age:</span> {order.details.age}</p>
                  <p className="col-span-2"><span className="text-gray-500">Address:</span> {order.details.address}</p>
                </div>
              )}
            </div>

            {/* Order Items Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</h4>
              
              {order.items.map((item: any, i: number) => {
                const qty = item.quantity || 1; // Fallback in case quantity isn't present
                
                return (
                  <div key={i} className="flex justify-between text-sm items-start">
                    <div className="flex flex-col pr-4">
                      <span className="text-gray-200">
                        {item.quantity ? `${item.quantity}x ` : ""}{item.name}
                      </span>
                      {item.description && (
                        <span className="text-xs text-gray-500 mt-0.5">{item.description}</span>
                      )}
                    </div>
                    <span className="text-gray-400 font-medium whitespace-nowrap">
                      ${(item.price * qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}

              {/* Total Calculation */}
              <div className="pt-3 mt-3 border-t border-gray-700/50 flex justify-between font-bold text-white">
                <span>Total</span>
                <span>
                  ${order.items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        ))}
    </div>
  );
}