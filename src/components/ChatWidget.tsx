"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, X, MessageSquare } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useIntentExecutor } from "@/hooks/useIntentExecutor";
import toast from "react-hot-toast";
import { ToggleLeft, ToggleRight } from "lucide-react";

type Message = { role: "user" | "ai"; text: string };

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isAlwaysOn, setIsAlwaysOn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! Try saying: 'Add burger to cart and checkout.'" }
  ]);

  
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition(isAlwaysOn);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const { execute } = useIntentExecutor();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript]);

  // Sync voice transcript to input text (live preview)
  useEffect(() => {
    if (transcript) setInputText(transcript);
  }, [transcript]);

  // Auto-send when speech recognition stops and transcript exists
  useEffect(() => {
    if (!isListening && transcript) {
      handleSend(transcript);
    }
  }, [isListening, transcript]);

  const handleSend = async (textToProcess: string = inputText) => {
    if (!textToProcess.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", text: textToProcess }]);
    setInputText(""); 

    const parsedJSON = await execute(textToProcess);

    // Use the reply_message from Gemini (Step 1), or fallback to a default
    const aiReply = parsedJSON?.reply_message || "Action completed!";
    // if (!parsedJSON || !parsedJSON.intents || parsedJSON.intents[0]?.action === "unknown") {
    //   aiReply = "I'm sorry, I didn't quite catch that. Could you rephrase?";
    // } else {
    //    const actions = parsedJSON.intents.map((i: any) => i.action.replace(/_/g, ' ')).join(" & ");
    //   aiReply = `Executing: ${actions}`;
    // }
    setMessages(prev => [...prev, { role: "ai", text: aiReply }]);
  };


  const handleToggleMode = () => {
    const newMode = !isAlwaysOn;
    setIsAlwaysOn(newMode);
    
    if (newMode) {
      toast.success("Always-On Listening Enabled");
      startListening();
    } else {
      toast.success("Chat Mode Enabled");
      stopListening();
    }
  };

  // Silence Timer - ONLY triggers in Always-On mode
  useEffect(() => {
    if (isAlwaysOn && transcript) {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);

      silenceTimer.current = setTimeout(() => {
        if (transcript.trim().length > 0) {
          handleSend(transcript);
          setTranscript(""); 
        }
      }, 1500); // 1 seconds pause triggers send
    }
    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
  }, [transcript, isAlwaysOn]);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg transition-all">
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col z-50">
      <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
        <h3 className="font-semibold text-white flex items-center gap-2">
          AI Assistant
          <button onClick={handleToggleMode} className="ml-2 text-blue-400 hover:text-blue-300" title="Toggle Always-On Mode">
            {isAlwaysOn ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
          </button>
        </h3>
        <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
      </div>
      
      {/* Chat History Area */}
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
        {/* Live speech transcription preview */}
        {isListening && inputText && (
          <div className="max-w-[85%] p-3 rounded-xl text-sm bg-blue-600/50 text-blue-100 self-end rounded-br-none animate-pulse">
            {inputText}...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 bg-gray-900 flex items-center gap-2 border-t border-gray-700">
        <button 
          onClick={isListening ? stopListening : startListening} 
          disabled={isAlwaysOn} // Disable manual mic clicks if Always-On is active
          className={`p-2 rounded-full transition-colors ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
          } ${isAlwaysOn ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        <button onClick={() => handleSend()} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};