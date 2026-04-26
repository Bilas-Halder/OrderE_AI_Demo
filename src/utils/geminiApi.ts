"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { foods } from "@/data/foods";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Minify the database for the LLM
const minifiedMenu = foods.map(f => ({ id: f.id, name: f.name, price: f.price }));
const menuString = JSON.stringify(minifiedMenu);

const AMBIENT_PROMPT = `
You are an intent parser for a food ordering app. Your ONLY job is to translate the user's command into strict JSON actions.
You have access to this menu: ${menuString}

AVAILABLE ACTIONS:
- "navigate": { "action": "navigate", "route": "/foods" | "/buy" | "/orders" | "/" }
- "add_to_cart": { "action": "add_to_cart", "item_id": number } (Match the item name to the ID in the menu)
- "remove_from_cart": { "action": "remove_from_cart", "item_id": number }
- "clear_cart": { "action": "clear_cart" }
- "fill_form": { "action": "fill_form", "details": { "name"?: string, "age"?: string, "address"?: string } }
- "checkout": { "action": "checkout" }
- "unknown": { "action": "unknown" }

RULES:
1. Do not ask follow-up questions.
2. If the user asks for multiple things, return multiple intents in the array.
3. Keep the reply_message very brief (e.g., "Navigating to menu", "Added burger to cart").

OUTPUT FORMAT:
{
  "reply_message": "Short status message",
  "intents": [ { ...action object... } ]
}
`;

const HELPING_PROMPT = `
You are a friendly, consultative AI assistant for a food ordering app. 
You have access to this menu: ${menuString}

YOUR GOAL:
Help the user decide what to eat. Ask questions about their cravings. Suggest specific items from the menu based on their answers.

RULES:
1. Be conversational and concise.
2. Do NOT execute actions ("add_to_cart", "checkout") UNLESS the user explicitly confirms they want to buy something.
3. If you are just talking/suggesting, return an empty "intents" array.
4. If the user confirms an order or asks you to do something, include the corresponding actions in the "intents" array.

AVAILABLE ACTIONS (Only use when user confirms):
- "navigate": { "action": "navigate", "route": string }
- "add_to_cart": { "action": "add_to_cart", "item_id": number }
- "checkout": { "action": "checkout" }

OUTPUT FORMAT:
{
  "reply_message": "Your conversational response, questions, or suggestions.",
  "intents": [ ...actions if triggered, or empty array [] ]
}
`;

export const fetchAIIntent = async (userText: string, mode: 'ambient' | 'helping') => {
  console.log(`[AI Engine] Sending to Gemini in ${mode} mode:`, userText);

  try {
    const systemInstruction = mode === 'ambient' ? AMBIENT_PROMPT : HELPING_PROMPT;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(userText);
    const responseText = result.response.text();
    
    console.log("[AI Engine] Gemini Response:", responseText);

    return JSON.parse(responseText);

  } catch (error) {
    console.error("[AI Engine] Gemini API Error:", error);
    return { 
      reply_message: "I'm having trouble connecting to my brain right now. Please try again.", 
      intents: [] 
    };
  }
};