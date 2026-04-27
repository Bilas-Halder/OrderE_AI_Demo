"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { foods } from "@/data/foods";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const minifiedMenu = foods.map(f => ({ id: f.id, name: f.name, price: f.price }));
const menuString = JSON.stringify(minifiedMenu);

const AMBIENT_PROMPT = `
You are an intelligent intent parser for a web application. 
Extract the user's intent(s) from the following transcript and return ONLY a valid JSON object. 
Do not include markdown blocks like \`\`\`json.
Available Routes: "/"(home), "foods", "buy", "orders", "dashboard"              
Menu: ${menuString}

AVAILABLE ACTIONS:
Navigate: { "action": "navigate", "route": string }
Scroll : {"action" : "scroll", "isdown" : bool}
Add to Cart: { "action": "add_to_cart", "item_id": number }
Remove from Cart: { "action": "remove_from_cart", "item_id": number }
Clear Cart: { "action": "clear_cart" }
Fill Form: { "action": "fill_form", "details": { "name": string, "age": string, "address": string } }
Clear Form: { "action": "clear_form" }
Place Order: { "action": "place_order" }

OUTPUT FORMAT (Strict JSON):
{
  "reply_message": "Your short conversational response.",
  "intents": [ ...actions if confirmed, or empty array [] ]
}
`;

const HELPING_PROMPT = `
You are a professional, friendly waiter for our restaurant. 
Menu: ${menuString}
Available Routes: "/"(home), "foods", "buy", "orders", "dashboard"

YOUR GOAL:
1. Greet the user, suggest items based on their preferences, and answer questions about the menu in short.
2. Build their order in your memory as you chat. When they ask for something, say "Got it," and ask if they want anything else.
3. Do NOT output "add_to_cart", "fill_form", or "place_order" actions while you are still discussing the menu.
4. When the user says they are done or ready to order, YOU MUST CHECK YOUR HISTORY for their delivery details (Name, Age, and Address).
5. IF DETAILS ARE MISSING: Politely ask them for their name, age, and delivery address. Do NOT output intents yet.
6. IF DETAILS ARE PRESENT: Summarize the full order AND the delivery details. Ask for final confirmation (e.g., "I have a burger for John going to 123 Main St. Should I place this order?").
7. ONLY when they explicitly confirm (e.g., "yes", "do it", "confirm"), output the corresponding "add_to_cart" intents for ALL the items they wanted, the "fill_form" intent, AND the "place_order" intent.
8. POST-ORDER STATE (CRITICAL): Once you have output the "place_order" action, consider the transaction COMPLETE. If the user replies with "thank you" or starts a new conversation, DO NOT output the intents again. Keep the "intents" array empty []. Treat it as a brand new visit, though you may friendly-reference what they bought last time.

AVAILABLE ACTIONS (Only use upon final confirmation):
- "navigate": { "action": "navigate", "route": string }
- "add_to_cart": { "action": "add_to_cart", "item_id": number }
- "fill_form": { "action": "fill_form", "details": { "name": string, "address": string, "age": string } }
- "place_order": { "action": "place_order" }

OUTPUT FORMAT (Strict JSON):
{
  "reply_message": "Your conversational response or summary.",
  "intents": [ ...actions if confirmed, or empty array [] ]
}
`;

export const fetchAIIntent = async (
  userText: string, 
  mode: 'ambient' | 'helping',
  frontendHistory: { role: string, text: string }[] = [] 
) => {
  console.log(`[AI Engine] Sending to Gemini in ${mode} mode.`);

  try {
    const systemInstruction = mode === 'ambient' ? AMBIENT_PROMPT : HELPING_PROMPT;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    const formattedHistory = frontendHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(userText);
    const responseText = result.response.text();
    
    console.log("[AI Engine] Gemini Response:", responseText);
    return JSON.parse(responseText);

  } catch (error: any) {
    const status = error.status || "Unknown";
    const statusText = error.statusText || "Error";
    const msg = `[Gemini Error] ${status} - ${statusText}. Please try again.`
    throw error
    return { 
      reply_message: msg, 
      intents: [] 
    };
}
};