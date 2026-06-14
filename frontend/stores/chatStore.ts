import { create } from 'zustand';
import type { Message, SourceCitation } from '@/types';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  diagnosticStep: number;
  sessionToken: string | null;
  isRecording: boolean;
  uploadedImageUrl: string | null;

  addMessage: (message: Message) => void;
  setLoading: (v: boolean) => void;
  setDiagnosticStep: (step: number) => void;
  setSessionToken: (token: string) => void;
  setRecording: (v: boolean) => void;
  setUploadedImageUrl: (url: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  diagnosticStep: 1,
  sessionToken: null,
  isRecording: false,
  uploadedImageUrl: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setLoading: (v) => set({ isLoading: v }),
  setDiagnosticStep: (step) => set({ diagnosticStep: step }),
  setSessionToken: (token) => set({ sessionToken: token }),
  setRecording: (v) => set({ isRecording: v }),
  setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),

  clearChat: () =>
    set({
      messages: [],
      diagnosticStep: 1,
      sessionToken: null,
      uploadedImageUrl: null,
    }),
}));
