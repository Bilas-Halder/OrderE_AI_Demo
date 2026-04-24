import { useState, useEffect, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          setTranscript(event.results[0][0].transcript);
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        setRecognitionInstance(recognition);
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionInstance) {
      setTranscript("");
      setIsListening(true);
      recognitionInstance.start();
    }
  }, [recognitionInstance]);

  return { isListening, transcript, startListening, setTranscript };
};