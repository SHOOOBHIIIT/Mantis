'use client';

import { useCallback, useRef } from 'react';
import { voiceAPI } from '@/lib/api';

export function useTextToSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const { data } = await voiceAPI.speak(text);
      const url = URL.createObjectURL(data as Blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
    } catch {
      // TTS not configured or failed — silently ignore
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { speak, stop };
}
