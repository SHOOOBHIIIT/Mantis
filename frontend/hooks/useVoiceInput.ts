'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useVoiceInput(onFinalTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>(''); // Keep exact track for instant manual stop

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop automatically on silence
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          let final = '';
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (interim) {
            setInterimTranscript(interim);
            transcriptRef.current = interim;
          }
          if (final) {
            setIsRecording(false);
            setIsProcessing(true);
            recognition.stop();
            onFinalTranscript(final);
            transcriptRef.current = '';
          }
        };

        recognition.onend = () => {
          if (isRecording) {
            setIsRecording(false);
            const text = transcriptRef.current;
            if (text.trim()) {
              setIsProcessing(true);
              onFinalTranscript(text.trim());
            }
            transcriptRef.current = '';
            setInterimTranscript('');
          }
        };

        recognition.onerror = (e: any) => {
          console.error("Speech recognition error:", e.error);
          setIsRecording(false);
          setIsProcessing(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [isRecording, onFinalTranscript]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
      setInterimTranscript('');
      transcriptRef.current = '';
      setIsRecording(true);
      setIsProcessing(false);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition already started");
      }
    } else {
      alert("Voice recognition is not supported in this browser. Try Chrome or Edge.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      // instantly grab and stop
      const text = transcriptRef.current;
      recognitionRef.current.stop();
      setIsRecording(false);
      if (text.trim()) {
        setIsProcessing(true);
        onFinalTranscript(text.trim());
      }
      transcriptRef.current = '';
      setInterimTranscript('');
    }
  }, [isRecording, onFinalTranscript]);

  return { isRecording, isProcessing, interimTranscript, startRecording, stopRecording };
}
