'use client';

import { Mic, MicOff, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function VoiceButton({ isRecording, isProcessing, onStart, onStop, className }: VoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={isRecording ? onStop : onStart}
      disabled={isProcessing}
      className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border shrink-0',
        isRecording
          ? 'bg-error/10 border-error/30 text-error animate-pulse'
          : isProcessing
          ? 'bg-bg-tertiary border-border-default text-text-muted cursor-not-allowed'
          : 'bg-bg-tertiary border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary',
        className
      )}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {isProcessing ? (
        <Loader size={16} className="animate-spin" />
      ) : isRecording ? (
        <MicOff size={16} />
      ) : (
        <Mic size={16} />
      )}
    </button>
  );
}
