"use client";
import React, { useState, useEffect } from "react";
import { Mic, MicOff, Send, X, MessageSquare } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useIntentExecutor } from "@/hooks/useIntentExecutor";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const { isListening, transcript, startListening } = useSpeechRecognition();
  const { execute } = useIntentExecutor();

  // Sync voice transcript to input text
  useEffect(() => {
    if (transcript) setInputText(transcript);
  }, [transcript]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToProcess = inputText;
    setInputText(""); // clear immediately for UX
    await execute(textToProcess);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg transition-all"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col z-50">
      <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
        <h3 className="font-semibold text-white">AI Assistant</h3>
        <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
      </div>
      
      <div className="p-4 h-64 overflow-y-auto flex flex-col gap-2">
        <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-200">
          Hi! Try saying: "Add burger to cart and go to checkout."
        </div>
      </div>

      <div className="p-3 bg-gray-900 flex items-center gap-2">
        <button 
          onClick={startListening} 
          className={`p-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-gray-300" />}
        </button>
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type or speak..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button onClick={handleSend} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};