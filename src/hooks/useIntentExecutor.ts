import { useAppStore } from "@/context/GlobalContext";
import { useRouter } from "next/navigation";
import { fetchAIIntent } from "@/utils/geminiApi";

export const useIntentExecutor = () => {
  const { addToCart, removeFromCart, placeOrder, clearCart } = useAppStore();
  const router = useRouter();

  const execute = async (text: string, mode: 'ambient' | 'helping') => {
    try {
      const parsedJSON = await fetchAIIntent(text, mode);
      
      if (parsedJSON.intents && Array.isArray(parsedJSON.intents)) {
        parsedJSON.intents.forEach((intent: any) => {
          switch (intent.action) {
            case "navigate":
              router.push(intent.route);
              break;
            case "add_to_cart":
              addToCart(intent.item_id);
              break;
            case "remove_from_cart":
              removeFromCart(intent.item_id);
              break;
            case "clear_cart":
              clearCart();
              break;
            case "checkout":
              router.push('/buy');
              break;
            case "fill_form":
              console.log("Fill form intent received:", intent.details);
              break;
            default:
              console.log("Unknown intent:", intent);
          }
        });
      }
      return parsedJSON;
    } catch (error) {
      console.error("Failed to execute intent:", error);
      return null;
    }
  };

  return { execute };
};