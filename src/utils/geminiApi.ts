export const parseIntentWithGemini = async (transcript: string) => {
  // Real implementation: fetch to your Next.js API route or Gemini API directly
  /*
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent', { ... })
  */
  
  // Mock logic demonstrating the expected output based on your prompt rules
  console.log("Sending to Gemini:", transcript);
  
  const lowerText = transcript.toLowerCase();
  let intents = [];

  if (lowerText.includes("add burger") || lowerText.includes("buy burger")) {
    intents.push({ action: "add_to_cart", target_page: null, food_id: 1, form_data: null });
  }
  if (lowerText.includes("go to checkout") || lowerText.includes("buy now")) {
    intents.push({ action: "navigate", target_page: "buy", food_id: null, form_data: null });
  }
  if (lowerText.includes("dashboard")) {
    intents.push({ action: "navigate", target_page: "dashboard", food_id: null, form_data: null });
  }
  
  if (intents.length === 0) {
     intents.push({ action: "unknown", target_page: null, food_id: null, form_data: null });
  }

  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return { intents };
};