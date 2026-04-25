"use client";
import { useAppStore } from "@/context/GlobalContext";

export default function OrdersPage() {
  const { orders } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
          No orders placed yet.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Inside orders.map... Replace orderTotal and item mapping with this: */}
          {orders.map((order) => {
            const orderTotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            return (
              <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                {/* ... keep the order header ... */}
                
                <div className="space-y-2">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.quantity}x {item.name}</span>
                      <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}