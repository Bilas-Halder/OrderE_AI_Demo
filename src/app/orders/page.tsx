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
          {orders.map((order) => {
            const orderTotal = order.items.reduce((sum: number, item: any) => sum + item.price, 0);
            return (
              <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                  <div>
                    <p className="text-sm text-gray-400">Order ID: {order.id}</p>
                    <p className="font-medium text-white">Deliver to: {order.details.name} ({order.details.address})</p>
                  </div>
                  <span className="text-green-400 font-bold text-lg">${orderTotal.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.name}</span>
                      <span className="text-gray-500">${item.price.toFixed(2)}</span>
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