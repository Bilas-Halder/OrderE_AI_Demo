import { useAppStore } from "@/context/GlobalContext";
import { useRouter } from "next/navigation";
import { fetchAIIntent } from "@/utils/geminiApi";
import { foods } from "@/data/foods"; // Make sure to import your foods!
import toast from "react-hot-toast";

export const useIntentExecutor = () => {
  // Grab 'cart' so we know what's already in there
  const { cart, formData, addToCart, setFormData, placeOrder } = useAppStore();
  const router = useRouter();

  const execute = async (text: string, mode: 'ambient' | 'helping', history: any[]) => {
    try {
      const parsedJSON = await fetchAIIntent(text, mode, history);
      if (!parsedJSON?.intents) return parsedJSON;

      const intents = parsedJSON.intents;
      const addIntents = intents.filter((i: any) => i.action === 'add_to_cart');
      const formIntent = intents.find((i: any) => i.action === 'fill_form');
      const navIntent = intents.find((i: any) => i.action === 'navigate');
      const placeOrderIntent = intents.find((i: any) => i.action === 'place_order');

      // --- 1. INSTANTLY CALCULATE THE FINAL CART ---
      let calculatedCart = [...cart]; // Start with whatever the user manually added
      
      addIntents.forEach((intent: any) => {
        const item = foods.find(f => f.id === intent.item_id);
        if (item) {
          const existing = calculatedCart.find(i => i.id === item.id);
          if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
          } else {
            calculatedCart.push({ ...item, quantity: 1 });
          }
        }
      });

      // --- 2. INSTANTLY CALCULATE THE FINAL DETAILS ---
      let calculatedDetails = formData;
      if (formIntent && formIntent.details) {
        calculatedDetails = formIntent.details;
        setFormData(calculatedDetails); // Keep the UI in sync for the future
      }

      // --- 3. EXECUTE THE ACTIONS ---
      if (placeOrderIntent) {
        // Because we calculated it instantly, we pass it directly. Zero race conditions.
        const success = placeOrder(calculatedDetails, calculatedCart);
        if (success) {
          router.push('/orders?newOrder=true');
        }
      } else {
        // If we are NOT placing an order, just update the global cart state normally
        addIntents.forEach((i: any) => addToCart(i.item_id));
      }

      // Handle navigation if we aren't ordering
      if (navIntent && !placeOrderIntent) {
        router.push(navIntent.route);
      }

      return parsedJSON;
    } catch (error) {
      console.error("Failed to execute intent:", error);
      return null;
    }
  };

  return { execute };
};