'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import { DiagnosticProgress } from './DiagnosticProgress';
import { useChatStore } from '@/stores/chatStore';
import { assistantAPI, voiceAPI } from '@/lib/api';
import { generateSessionToken } from '@/lib/utils';
import type { Message } from '@/types';

interface AssistantChatProps {
  productId: string;
  productName: string;
}

export function AssistantChat({ productId, productName }: AssistantChatProps) {
  const {
    messages,
    isLoading,
    diagnosticStep,
    sessionToken,
    uploadedImageUrl,
    addMessage,
    setLoading,
    setDiagnosticStep,
    setSessionToken,
    setUploadedImageUrl,
    clearChat,
  } = useChatStore();

  const bottomRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockedAudio, setBlockedAudio] = useState<HTMLAudioElement | null>(null);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);

  // Initialize session and clear on mount
  useEffect(() => {
    clearChat();
    const token = generateSessionToken();
    setSessionToken(token);
  }, [productId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (
    text: string,
    inputType: 'text' | 'voice' | 'image',
    imageUrl?: string
  ) => {
    if (!text && !imageUrl) return;
    setError(null);

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      input_type: inputType,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };

    addMessage(userMessage);
    setLoading(true);

    try {
      const { data } = await assistantAPI.chat({
        session_token: sessionToken!,
        product_id: productId,
        message: text,
        input_type: inputType,
        image_url: imageUrl,
        conversation_history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_reply`,
        role: 'assistant',
        content: data.reply,
        input_type: 'text',
        sources: data.sources,
        retrieval_ms: data.retrieval_ms,
        created_at: new Date().toISOString(),
      };

      addMessage(assistantMessage);
      setDiagnosticStep(data.diagnostic_step);
      setLoading(false); // Stop typing animation immediately

      // Auto-speak reply if user sent a voice message
      if (inputType === 'voice') {
        setIsGeneratingTTS(true);
        try {
          const audioRes = await voiceAPI.speak(data.reply);
          const audioUrl = URL.createObjectURL(audioRes.data as Blob);
          const audio = new Audio(audioUrl);
          audio.play().catch((e) => {
            console.error("Audio playback blocked by browser autoplay policy:", e);
            setBlockedAudio(audio);
          });
        } catch (e) {
          console.error("TTS generation failed:", e);
        } finally {
          setIsGeneratingTTS(false);
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(
        e?.response?.data?.detail || 'Failed to get a response. Please try again.'
      );
      setLoading(false); // Ensure loading is stopped on error too
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Diagnostic step progress */}
      <DiagnosticProgress currentStep={diagnosticStep} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5 text-3xl">
              🔧
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-2">
              Mantis Diagnostic Assistant
            </h3>
            <p className="text-sm text-text-muted max-w-xs leading-relaxed">
              Describe your issue with <span className="text-text-secondary font-medium">{productName}</span> and I&apos;ll guide you through a systematic diagnosis — like having a technician at your side.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-md">
              {[
                { icon: '💬', label: 'Type your problem' },
                { icon: '🎤', label: 'Speak your issue' },
                { icon: '📷', label: 'Upload a photo' },
              ].map((tip) => (
                <div
                  key={tip.label}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 bg-bg-tertiary rounded-xl border border-border-subtle text-xs text-text-muted"
                >
                  <span className="text-xl">{tip.icon}</span>
                  {tip.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm">⚡</span>
            </div>
            <div className="bg-bg-tertiary border border-border-subtle px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* TTS Generating indicator */}
        {isGeneratingTTS && (
          <div className="flex justify-start">
            <div className="bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              Generating voice response...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 px-4 py-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Blocked Audio UI */}
      {blockedAudio && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-brand-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">Tap to play voice reply</span>
          <button 
            onClick={() => {
              blockedAudio.play();
              setBlockedAudio(null);
            }}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors flex items-center justify-center text-lg leading-none"
          >
            ▶
          </button>
        </div>
      )}

      {/* Input bar */}
      <InputBar
        onSend={handleSend}
        disabled={isLoading}
        productId={productId}
        uploadedImageUrl={uploadedImageUrl}
        onImageUploaded={setUploadedImageUrl}
      />
    </div>
  );
}
