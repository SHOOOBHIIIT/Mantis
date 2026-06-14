'use client';

import { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadButtonProps {
  onUpload: (file: File) => void;
  hasImage: boolean;
  onClear: () => void;
  isUploading?: boolean;
  className?: string;
}

export function ImageUploadButton({
  onUpload,
  hasImage,
  onClear,
  isUploading,
  className,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={hasImage ? onClear : () => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border shrink-0',
          hasImage
            ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
            : 'bg-bg-tertiary border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary',
          isUploading && 'opacity-50 cursor-not-allowed',
          className
        )}
        title={hasImage ? 'Remove image' : 'Upload image'}
      >
        {hasImage ? <X size={16} /> : <Camera size={16} />}
      </button>
    </>
  );
}
