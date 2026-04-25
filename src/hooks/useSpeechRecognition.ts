import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = (continuousMode: boolean = false) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const isIntentionalStopRef = useRef(false); 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; 
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };

        // If it stops, check if we are in Always-On mode. If yes, restart it.
        recognition.onend = () => {
          if (continuousMode && !isIntentionalStopRef.current) {
            try { recognition.start(); } catch(e) {}
          } else {
            setIsListening(false);
          }
        };

        recognition.onerror = (e: any) => {
          if (e.error === 'not-allowed') isIntentionalStopRef.current = true;
        };

        recognitionRef.current = recognition;
      }
    }
  }, [continuousMode]);

  const startListening = useCallback(() => {
    isIntentionalStopRef.current = false;
    setTranscript("");
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (e) {}
  }, []);

  const stopListening = useCallback(() => {
    isIntentionalStopRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, startListening, stopListening, setTranscript };
};