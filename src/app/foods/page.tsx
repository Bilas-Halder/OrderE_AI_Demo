"use client";
import { useAppStore } from "@/context/GlobalContext";
import { foods } from "@/data/foods";
import { useRouter } from "next/navigation";

export default function FoodsPage() {
  const { addToCart } = useAppStore();
  const router = useRouter();

  const handleBuyNow = (id: number) => {
    addToCart(id);
    router.push('/buy');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">Our Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {foods.map((food) => (
          <div key={food.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:border-gray-700 transition-colors">
            <div>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-white">{food.name}</h2>
                <span className="text-green-400 font-medium">${food.price.toFixed(2)}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">{food.description}</p>
            </div>
            
            <div className="mt-auto flex gap-3 pt-4">
              <button 
                onClick={() => addToCart(food.id)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add to Cart
              </button>
              <button 
                onClick={() => handleBuyNow(food.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}