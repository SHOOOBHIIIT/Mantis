'use client';

import { useEffect, useState } from 'react';
import { Mic, X, Loader } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

interface VoiceModeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoice: (transcript: string) => void;
}

export function VoiceModeDialog({ isOpen, onClose, onSendVoice }: VoiceModeDialogProps) {
  const { isRecording, isProcessing, interimTranscript, startRecording, stopRecording } = useVoiceInput((transcript) => {
    onSendVoice(transcript);
    onClose();
  });

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      setHasStarted(true);
      startRecording();
    } else if (!isOpen) {
      setHasStarted(false);
      if (isRecording) {
        stopRecording();
      }
    }
  }, [isOpen, hasStarted, startRecording, isRecording, stopRecording]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-bg-secondary/90 backdrop-blur-xl border border-border-strong rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl">
        <button
          onClick={() => {
            stopRecording();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-2">Voice Mode</h2>
          <p className="text-sm text-text-muted">
            {isProcessing ? 'Processing your speech...' : 'Listening... Speak your issue.'}
          </p>
        </div>

        {/* Live Transcription Box */}
        <div className="w-full bg-bg-tertiary border border-border-subtle rounded-xl p-4 mb-8 min-h-[80px] max-h-[120px] overflow-y-auto flex items-center justify-center">
          <p className="text-sm text-text-primary text-center italic opacity-80">
            {interimTranscript || (isRecording ? "..." : "")}
          </p>
        </div>

        <div className="relative flex items-center justify-center mb-8">
          {/* Pulsing background effect */}
          {!isProcessing && (
            <>
              <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-0 bg-brand-500/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            </>
          )}

          <button
            onClick={() => {
              if (isRecording) {
                stopRecording();
              }
            }}
            disabled={isProcessing}
            className={cn(
              "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
              isProcessing 
                ? "bg-bg-tertiary border border-border-strong text-text-muted cursor-not-allowed" 
                : "bg-brand-500 text-white hover:bg-brand-600 hover:scale-105 shadow-brand-500/30"
            )}
          >
            {isProcessing ? (
              <Loader size={32} className="animate-spin" />
            ) : (
              <Mic size={32} />
            )}
          </button>
        </div>

        {!isProcessing ? (
          <p className="text-xs text-text-muted text-center animate-pulse">
            Tap the microphone when you are done speaking.
          </p>
        ) : (
          <p className="text-xs text-brand-500 text-center animate-pulse">
            Analyzing your audio...
          </p>
        )}
      </div>
    </div>
  );
}
