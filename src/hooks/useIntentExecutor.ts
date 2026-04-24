import { useRouter } from "next/navigation";
import { useAppStore } from "@/context/GlobalContext";
import { parseIntentWithGemini } from "@/utils/geminiApi";

export const useIntentExecutor = () => {
  const router = useRouter();
  const { addToCart, removeFromCart, clearCart, placeOrder, addLog } = useAppStore();

  const execute = async (transcript: string) => {
    try {
      const parsedJSON = await parseIntentWithGemini(transcript);
      let success = true;

      parsedJSON.intents.forEach((intent: any) => {
        switch (intent.action) {
          case "navigate":
            if (intent.target_page) router.push(`/${intent.target_page === 'home' ? '' : intent.target_page}`);
            break;
          case "add_to_cart":
            if (intent.food_id) addToCart(intent.food_id);
            break;
          case "buy_now":
            if (intent.food_id) {
              addToCart(intent.food_id);
              router.push('/buy');
            }
            break;
          case "remove_from_cart":
            if (intent.food_id) removeFromCart(intent.food_id);
            break;
          case "clear_form": 
            clearCart();
            break;
          case "confirm_purchase":
            placeOrder(intent.form_data || { note: "Voice ordered" });
            router.push('/orders');
            break;
          case "unknown":
            success = false;
            break;
        }
      });

      addLog({ transcript, parsedJSON, success, isCorrect: null });
      return parsedJSON;
    } catch (error) {
      addLog({ transcript, parsedJSON: { error: "Failed to parse" }, success: false, isCorrect: false });
    }
  };

  return { execute };
};