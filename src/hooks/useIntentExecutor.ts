import { useAppStore } from "@/context/GlobalContext";
import { useRouter } from "next/navigation";
import { fetchAIIntent } from "@/utils/geminiApi";
import { foods } from "@/data/foods";
import toast from "react-hot-toast";

export const useIntentExecutor = () => {
  const { cart, formData, addToCart, removeFromCart, clearCart, setFormData, placeOrder, addLog } = useAppStore();
  const router = useRouter();

  const execute = async (text: string, mode: 'ambient' | 'helping', history: any[]) => {
    try {
      const parsedJSON = await fetchAIIntent(text, mode, history);
      if (!parsedJSON?.intents) return parsedJSON;

      if (addLog) {
      addLog({
        transcript: text,
        parsedJSON: parsedJSON, 
        success: !!parsedJSON?.intents,
        isCorrect: null 
      })}

      const intents = parsedJSON.intents;

      // Extracting all possible intents
      const addIntents = intents.filter((i: any) => i.action === 'add_to_cart');
      const removeIntents = intents.filter((i: any) => i.action === 'remove_from_cart');
      const scrollIntents = intents.filter((i: any) => i.action === 'scroll');
      const clearCartIntent = intents.find((i: any) => i.action === 'clear_cart');
      const clearFormIntent = intents.find((i: any) => i.action === 'clear_form');
      const formIntent = intents.find((i: any) => i.action === 'fill_form');
      const navIntent = intents.find((i: any) => i.action === 'navigate');
      const placeOrderIntent = intents.find((i: any) => i.action === 'place_order');

      scrollIntents.forEach((intent: any) => {
        window.scrollBy({
          top: intent.isdown ? window.innerHeight / 2 : -window.innerHeight / 2,
          behavior: 'smooth'
        });
      });

      if (clearCartIntent) clearCart();
      if (clearFormIntent) setFormData({ name: '', age: '', address: '' }); // Reset form
      
      removeIntents.forEach((intent: any) => {
        removeFromCart(intent.item_id);
      });
      let calculatedCart = clearCartIntent ? [] : [...cart]; 
      removeIntents.forEach((intent: any) => {
        calculatedCart = calculatedCart.filter(i => i.id !== intent.item_id);
      });
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

      let calculatedDetails = clearFormIntent ? { name: '', age: '', address: '' } : { ...formData };
      
      if (formIntent && formIntent.details) {
        
        calculatedDetails = { ...calculatedDetails, ...formIntent.details };
        setFormData(calculatedDetails); // Sync UI
      }
      if (placeOrderIntent) {
        const success = placeOrder(calculatedDetails, calculatedCart);
        if (success) {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          setTimeout(() => router.push('/orders?newOrder=true'), 300);
        }
      } else {
        addIntents.forEach((i: any) => addToCart(i.item_id));
      }

      if (navIntent && !placeOrderIntent) {
        router.push(navIntent.route);
      }

      return parsedJSON;

    } catch (error: any) {
      // console.error("Failed to execute intent:", error);
      if (addLog) {
        addLog({
          transcript: text,
          parsedJSON: null,
          success: false,
          isCorrect: false // Mark as false since it failed
        });}
      
      const errorMessage = error?.message || error?.toString() || "";

      if (errorMessage.includes("429") || errorMessage.includes("Too Many Requests")) {
        toast.error("Whoa there! AI is receiving too many requests (429). Please wait a few seconds.");
      } else if (errorMessage.includes("503") || errorMessage.includes("Service Unavailable")) {
        toast.error("The AI server is temporarily busy (503). Please try speaking again.");
      } else {
        // toast.error("Could not process your request."); 
      }
      
      return null;
    }
  };

  return { execute };
};