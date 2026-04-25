"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, X, MessageSquare, ToggleLeft, ToggleRight } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useIntentExecutor } from "@/hooks/useIntentExecutor";
import toast from "react-hot-toast";

type Message = { role: "user" | "ai"; text: string };

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<'ambient' | 'helping'>('helping'); // Default to Helping
  
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! Try saying: 'Add burger to cart and checkout.'" }
  ]);
  
  const { isListening, transcript, startListening, stopListening, flushBuffer } = useSpeechRecognition(mode);
  const { execute } = useIntentExecutor();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false); // Prevents multiple rapid-fire sends


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript]);

  // Silence Timer
  useEffect(() => {
    if (transcript.trim() && !isProcessingRef.current) {
      console.log("[Timer] Speech detected, resetting 2.5s silence timer...");
      if (silenceTimer.current) clearTimeout(silenceTimer.current);

      // Wait 1.5 seconds after the user STOPS talking
      silenceTimer.current = setTimeout(() => {
        console.log("[Timer] Silence detected. Triggering send.");
        handleSend(transcript);
      }, 1500); 
    }
    
    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
  }, [transcript]);

  const handleSend = async (textToProcess: string = inputText) => {
    if (!textToProcess.trim() || isProcessingRef.current) {
      console.log("[HandleSend] Blocked: Empty text or already processing.");
      return;
    }
    
    console.log("[HandleSend] Sending to LLM:", textToProcess);
    isProcessingRef.current = true; // Lock LLM requests
    
    // Add User message to chat
    setMessages(prev => [...prev, { role: "user", text: textToProcess }]);
    setInputText(""); 
    
    // Clear transcript and reset mic instantly
    flushBuffer();

    // Execute intent
    const parsedJSON = await execute(textToProcess);
    console.log("[HandleSend] Received from LLM:", parsedJSON);

    const aiReply = parsedJSON?.reply_message || "Action completed!";
    setMessages(prev => [...prev, { role: "ai", text: aiReply }]);
    
    // Unlock LLM requests
    isProcessingRef.current = false;
    console.log("[HandleSend] Ready for next command.");
  };

  const handleToggleMode = () => {
    const newMode = mode === 'helping' ? 'ambient' : 'helping';
    console.log(`[UI] Toggled mode to: ${newMode}`);
    setMode(newMode);
    toast.success(`${newMode === 'ambient' ? 'Ambient (Always-On)' : 'Helping (Chat)'} Mode Enabled`);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg transition-all z-50">
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col z-50">

      <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex flex-col">
          <h3 className="font-semibold text-white text-lg">
            {mode === 'ambient' ? 'Ambient AI' : 'Helping AI'}
          </h3>
          <span className="text-xs text-gray-400">
            {mode === 'ambient' ? 'Listening to background commands' : 'Click mic to speak'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggleMode} 
            className="text-blue-400 hover:text-blue-300 transition-transform hover:scale-105" 
            title="Toggle: Ambient (Always On) vs Helping (Manual Click)"
          >
            {mode === 'ambient' 
              ? <ToggleRight className="w-8 h-8 text-green-400" /> 
              : <ToggleLeft className="w-8 h-8 text-gray-400" />}
          </button>
          
          <button onClick={() => setIsOpen(false)} title="Close Chat">
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>
      
      {/* CHAT HISTORY */}
      <div className="p-4 h-80 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`max-w-[85%] p-3 rounded-xl text-sm ${
            msg.role === "user" 
              ? "bg-blue-600 text-white self-end rounded-br-none" 
              : "bg-gray-700 text-gray-200 self-start rounded-bl-none"
          }`}>
            {msg.text}
          </div>
        ))}
        {/* Live speech preview */}
        {isListening && transcript && (
          <div className="max-w-[85%] p-3 rounded-xl text-sm bg-blue-600/50 text-blue-100 self-end rounded-br-none animate-pulse">
            {transcript}...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 bg-gray-900 flex items-center gap-2 border-t border-gray-700">
        {/* Mic Button */}
        <button 
          onClick={isListening ? stopListening : startListening} 
          className={`p-3 rounded-full transition-colors ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isListening ? "Stop Listening" : "Start Listening"}
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-gray-300" />}
        </button>
        
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type manually..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        
        <button onClick={() => handleSend()} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};