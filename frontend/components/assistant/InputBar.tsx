'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send } from 'lucide-react';
import { VoiceButton } from './VoiceButton';
import { ImageUploadButton } from './ImageUploadButton';
import { VoiceModeDialog } from './VoiceModeDialog';
import { imageAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface InputBarProps {
  onSend: (message: string, inputType: 'text' | 'voice' | 'image', imageUrl?: string) => void;
  disabled?: boolean;
  productId: string;
  uploadedImageUrl: string | null;
  onImageUploaded: (url: string | null) => void;
}

export function InputBar({
  onSend,
  disabled,
  productId,
  uploadedImageUrl,
  onImageUploaded,
}: InputBarProps) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [text]);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { data } = await imageAPI.upload(productId, file);
      onImageUploaded(data.image_url);
      // Pre-fill with AI analysis so user can confirm/edit before sending
      if (data.analysis && !text.trim()) {
        setText(data.analysis);
      }
    } catch {
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !uploadedImageUrl) return;
    if (disabled) return;

    const inputType = uploadedImageUrl ? 'image' : 'text';
    onSend(trimmed, inputType, uploadedImageUrl || undefined);
    setText('');
    onImageUploaded(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border-subtle bg-bg-secondary/80 backdrop-blur-sm">
      {/* Image preview */}
      {uploadedImageUrl && (
        <div className="mb-3 relative inline-block">
          <img
            src={uploadedImageUrl}
            alt="Upload preview"
            className="h-16 w-16 object-cover rounded-xl border border-border-default"
          />
          <button
            onClick={() => onImageUploaded(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error rounded-full flex items-center justify-center text-white text-xs"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Voice button */}
        <VoiceButton
          isRecording={false}
          isProcessing={false}
          onStart={() => setIsVoiceModeOpen(true)}
          onStop={() => {}}
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              uploadedImageUrl
                ? 'Describe what you see or ask about this image…'
                : 'Describe your issue or ask a question…'
            }
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full bg-bg-tertiary border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none transition-all',
              'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-[42px] max-h-[120px]'
            )}
          />
        </div>

        {/* Image upload */}
        <ImageUploadButton
          onUpload={handleImageUpload}
          hasImage={!!uploadedImageUrl}
          onClear={() => onImageUploaded(null)}
          isUploading={isUploading}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!text.trim() && !uploadedImageUrl)}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0',
            'bg-brand-500 text-white shadow-lg shadow-brand-500/20',
            'hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
          )}
        >
          <Send size={16} />
        </button>
      </form>

      <p className="text-[10px] text-text-muted mt-2 text-center">
        Press Enter to send · Shift+Enter for new line · 🎤 for voice · 📷 for image
      </p>

      {/* Voice Mode Overlay */}
      <VoiceModeDialog
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onSendVoice={(transcript) => {
          if (transcript.trim()) {
            onSend(transcript.trim(), 'voice', uploadedImageUrl || undefined);
            onImageUploaded(null);
          }
        }}
      />
    </div>
  );
}
