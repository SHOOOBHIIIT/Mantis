'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Link2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { knowledgeAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface KnowledgeUploaderProps {
  productId: string;
  onUploaded: () => void;
}

type Mode = 'pdf' | 'link';

export function KnowledgeUploader({ productId, onUploaded }: KnowledgeUploaderProps) {
  const [mode, setMode] = useState<Mode>('pdf');
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkType, setLinkType] = useState<'link' | 'video_link'>('link');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          const increment = prev < 50 ? 10 : prev < 80 ? 5 : 1;
          return prev + increment;
        });
      }, 800);
    } else if (status === 'success') {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isUploading, status]);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.pdf$/i, ''));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSubmit = async () => {
    if (!title.trim()) { setErrorMsg('Title is required'); return; }

    setIsUploading(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      if (mode === 'pdf') {
        if (!file) { setErrorMsg('Please select a PDF file'); setIsUploading(false); return; }
        await knowledgeAPI.uploadPDF(productId, file, title.trim());
      } else {
        if (!linkUrl.trim()) { setErrorMsg('URL is required'); setIsUploading(false); return; }
        await knowledgeAPI.addLink(productId, { title: title.trim(), type: linkType, external_url: linkUrl.trim() });
      }
      setStatus('success');
      setTitle('');
      setFile(null);
      setLinkUrl('');
      onUploaded();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setStatus('error');
      setErrorMsg(err?.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-1 p-1 bg-bg-tertiary rounded-xl w-fit">
        {(['pdf', 'link'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              mode === m ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {m === 'pdf' ? <FileText size={14} /> : <Link2 size={14} />}
            {m === 'pdf' ? 'PDF Manual' : 'Link / Video'}
          </button>
        ))}
      </div>

      {mode === 'pdf' ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-border-default hover:border-border-strong',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <Upload size={28} className={cn('mx-auto mb-3', isDragActive ? 'text-brand-400' : 'text-text-muted')} />
          {file ? (
            <div>
              <p className="text-sm font-medium text-text-primary">{file.name}</p>
              <p className="text-xs text-text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-text-secondary">
                {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF, or click to browse'}
              </p>
              <p className="text-xs text-text-muted mt-1">PDF manuals, service guides, specs</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            label="URL"
            placeholder="https://example.com/manual or https://youtube.com/..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <div className="flex gap-2">
            {(['link', 'video_link'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setLinkType(t)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-xs font-medium border transition-all',
                  linkType === t ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' : 'border-border-default text-text-muted hover:text-text-secondary'
                )}
              >
                {t === 'link' ? '🔗 Web Page / Doc' : '▶️ Video Link'}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input
        label="Title"
        placeholder="e.g. Service Manual v2.3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errorMsg && !title ? errorMsg : undefined}
      />

      {errorMsg && title && (
        <div className="flex items-center gap-2 text-xs text-error">
          <AlertCircle size={12} /> {errorMsg}
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2 text-xs text-success">
          <CheckCircle size={12} /> Uploaded! Indexing in background…
        </div>
      )}

      {isUploading && (
        <div className="space-y-1.5 mt-4 mb-2">
          <div className="flex justify-between text-xs text-text-muted">
            <span>Parsing & Vectorizing chunks...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} loading={isUploading} className="w-full">
        <Upload size={14} />
        {isUploading ? 'Processing...' : 'Upload Document'}
      </Button>
    </div>
  );
}
