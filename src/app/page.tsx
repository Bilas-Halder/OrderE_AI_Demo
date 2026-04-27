"use client";
import Link from "next/link";
import { Mic } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
      <h1 className="text-5xl font-extrabold tracking-tight text-white">
        Next-Gen Food Ordering
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl">
        Experience the future of UI. Navigate, add items to your cart, and checkout entirely via voice commands using our Gemini-powered intent engine.
      </p>
      
      <div className="flex gap-4 mt-8">
        <Link 
          href="/foods" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          View Menu
        </Link>
        <div className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg flex items-center gap-2">
          <Mic className="w-5 h-5 text-blue-400" />
          Say "Show me the menu" in chat.
        </div>
      </div>
    </div>
  );
}