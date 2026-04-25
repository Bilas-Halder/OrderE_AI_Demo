import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = (mode: 'ambient' | 'helping') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; 
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log("[Speech API] Microphone actively listening.");
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          console.log("[Speech API] Captured Text:", current);
          setTranscript(current);
        };

        recognition.onend = () => {
          console.log("[Speech API] Microphone stopped.");
          if (shouldListenRef.current) {
            console.log("[Speech API] Auto-restarting to flush buffer or maintain ambient mode...");
            try { 
              recognition.start(); 
            } catch(e) {
              console.error("[Speech API] Auto-restart failed:", e);
            }
          } else {
            setIsListening(false);
          }
        };

        recognition.onerror = (e: any) => {
          // console.error("[Speech API] Error:", e.error);
          if (e.error === 'not-allowed') {
             shouldListenRef.current = false;
             setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Ensure Ambient Mode starts automatically
  useEffect(() => {
    if (mode === 'ambient') {
      console.log("[Mode Change] Ambient mode selected. Starting mic...");
      startListening();
    } else {
      console.log("[Mode Change] Helping mode selected. Stopping mic...");
      stopListening();
    }
  }, [mode]);

  const startListening = useCallback(() => {
    console.log("[User Action] Manual Start Listening");
    shouldListenRef.current = true;
    setTranscript("");
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log("[User Action] Mic already started.");
    }
  }, []);

  const stopListening = useCallback(() => {
    console.log("[User Action] Manual Stop Listening");
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    setTranscript(""); // Clear transcript on hard stop
  }, []);

  // Flushes the Web Speech internal buffer
  const flushBuffer = useCallback(() => {
    console.log("[System] Flushing buffer for next sentence...");
    setTranscript("");
    recognitionRef.current?.stop(); 
  }, []);

  return { isListening, transcript, startListening, stopListening, flushBuffer, setTranscript };
};