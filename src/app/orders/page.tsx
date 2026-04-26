// "use client";
// import { useAppStore } from "@/context/GlobalContext";

// export default function OrdersPage() {
//   const { orders } = useAppStore();

//   return (
//     <div className="max-w-4xl mx-auto space-y-8">
//       <h1 className="text-3xl font-bold text-white">Order History</h1>
      
//       {orders.length === 0 ? (
//         <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
//           No orders placed yet.
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* Inside orders.map... Replace orderTotal and item mapping with this: */}
//           {orders.map((order) => {
//             const orderTotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
//             return (
//               <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//                 {/* ... keep the order header ... */}
                
//                 <div className="space-y-2">
//                   {order.items.map((item: any, i: number) => (
//                     <div key={i} className="flex justify-between text-sm">
//                       <span className="text-gray-300">{item.quantity}x {item.name}</span>
//                       <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }


// "use client";
// import { useAppStore } from "@/context/GlobalContext";
// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function OrdersPage() {
//   const { orders } = useAppStore(); // Assuming you have an orders array in your store
//   const searchParams = useSearchParams();
//   const isNewOrder = searchParams.get("newOrder") === "true";
  
//   const [highlightFirst, setHighlightFirst] = useState(isNewOrder);

//   // Remove the highlight after a few seconds so it doesn't stay forever
//   useEffect(() => {
//     if (highlightFirst) {
//       const timer = setTimeout(() => setHighlightFirst(false), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [highlightFirst]);

//   return (
//     <div className="p-8 max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold text-white mb-6">Your Orders</h2>
      
//       <div className="space-y-4">
//         {orders.map((order, index) => (
//           <div 
//             key={order.id} 
//             className={`p-4 rounded-xl border transition-all duration-700 ${
//               index === 0 && highlightFirst 
//                 ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" 
//                 : "bg-gray-800 border-gray-700"
//             }`}
//           >
//             {/* Render your order details here */}
//             <div className="space-y-2">
//                   {order.items.map((item: any, i: number) => (
//                     <div key={i} className="flex justify-between text-sm">
//                       <span className="text-gray-300">{item.quantity}x {item.name}</span>
//                       <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
//                     </div>
//                   ))}
//                 </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



// "use client";
// import { useAppStore } from "@/context/GlobalContext";
// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function OrdersPage() {
//   const { orders } = useAppStore(); 
//   const searchParams = useSearchParams();
//   const isNewOrder = searchParams.get("newOrder") === "true";
  
//   const [highlightFirst, setHighlightFirst] = useState(isNewOrder);

//   // Remove the highlight after a few seconds so it doesn't stay forever
//   useEffect(() => {
//     if (highlightFirst) {
//       const timer = setTimeout(() => setHighlightFirst(false), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [highlightFirst]);

//   return (
//     <div className="p-8 max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold text-white mb-6">Your Orders</h2>
      
//       <div className="space-y-6">
//         {/* Create a shallow copy and reverse to show newest first */}
//         {[...orders].reverse().map((order, index) => (
//           <div 
//             key={order.id} 
//             className={`p-6 rounded-xl border transition-all duration-700 ${
//               index === 0 && highlightFirst 
//                 ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" 
//                 : "bg-gray-800 border-gray-700"
//             }`}
//           >
            
//             {/* Customer & Order Details Section */}
//             <div className="mb-4 pb-4 border-b border-gray-700">
//               <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-lg font-semibold text-white">Order Details</h3>
//                 <span className="text-xs text-gray-400 font-mono">ID: {order.id}</span>
//               </div>
              
//               {order.details && (
//                 <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
//                   <p><span className="text-gray-500">Name:</span> {order.details.name}</p>
//                   <p><span className="text-gray-500">Age:</span> {order.details.age}</p>
//                   <p className="col-span-2"><span className="text-gray-500">Address:</span> {order.details.address}</p>
//                 </div>
//               )}
//             </div>

//             {/* Order Items Section */}
//             <div className="space-y-3">
//               <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</h4>
              
//               {order.items.map((item: any, i: number) => {
//                 const qty = item.quantity || 1; // Fallback in case quantity isn't present
                
//                 return (
//                   <div key={i} className="flex justify-between text-sm items-start">
//                     <div className="flex flex-col pr-4">
//                       <span className="text-gray-200">
//                         {item.quantity ? `${item.quantity}x ` : ""}{item.name}
//                       </span>
//                       {item.description && (
//                         <span className="text-xs text-gray-500 mt-0.5">{item.description}</span>
//                       )}
//                     </div>
//                     <span className="text-gray-400 font-medium whitespace-nowrap">
//                       ${(item.price * qty).toFixed(2)}
//                     </span>
//                   </div>
//                 );
//               })}

//               {/* Total Calculation */}
//               <div className="pt-3 mt-3 border-t border-gray-700/50 flex justify-between font-bold text-white">
//                 <span>Total</span>
//                 <span>
//                   ${order.items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)}
//                 </span>
//               </div>
//             </div>

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";
import { Suspense } from "react";
import OrderListContent from "@/components/OrderList";

export default function OrdersPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Your Orders</h2>
      {/* Wrap the component using searchParams in Suspense */}
      <Suspense fallback={<div className="text-white">Loading orders...</div>}>
        <OrderListContent />
      </Suspense>
    </div>
  );
}