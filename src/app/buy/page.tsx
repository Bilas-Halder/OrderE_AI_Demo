"use client";
import { useState } from "react";
import { useAppStore } from "@/context/GlobalContext";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function BuyPage() {
  const { cart, removeFromCart, placeOrder, clearCart } = useAppStore();
  const router = useRouter();
  
  // Local form state - could also be moved to GlobalContext if strict AI auto-fill across pages is needed
  const [formData, setFormData] = useState({ name: "", age: "", address: "" });

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleConfirmPurchase = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty!");
    placeOrder(formData);
    router.push('/orders');
  };

  const handleClearForm = () => {
    setFormData({ name: "", age: "", address: "" });
    clearCart();
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Cart Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Your Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Cart is empty. Say "Add burger to cart".</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-sm text-gray-400">${item.price.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <div className="border-t border-gray-700 pt-4 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-400">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Checkout Details</h2>
        <form onSubmit={handleConfirmPurchase} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
            <input 
              type="number" 
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear
            </button>
            <button 
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Confirm Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}