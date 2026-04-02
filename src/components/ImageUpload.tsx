"use client";

import { useRef, useState } from 'react';

interface ImageUploadProps {
  images: File[];
  onChange: (files: File[]) => void;
  /** Pre-existing image URLs (edit mode only) */
  initialUrls?: string[];
  /** Called when the user removes an existing URL thumbnail */
  onInitialUrlsChange?: (urls: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUpload({
  images,
  onChange,
  initialUrls = [],
  onInitialUrlsChange,
  maxImages = 3,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const totalCount = initialUrls.length + images.length;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setError('');

    const newFiles: File[] = [];
    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed.');
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Each image must be under ${maxSizeMB}MB.`);
        return;
      }
      newFiles.push(file);
    }

    const combined = [...images, ...newFiles].slice(0, maxImages - initialUrls.length);
    onChange(combined);
  };

  const removeNewImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const removeInitialUrl = (url: string) => {
    onInitialUrlsChange?.(initialUrls.filter((u) => u !== url));
  };

  return (
    <div className="space-y-2" data-testid="image-upload">
      <span className="text-sm font-medium text-slate-700">
        Photos (up to {maxImages})
      </span>

      {/* Existing URL thumbnails (edit mode) */}
      {initialUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {initialUrls.map((url, i) => (
            <div
              key={url}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Existing photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {onInitialUrlsChange && (
                <button
                  type="button"
                  onClick={() => removeInitialUrl(url)}
                  className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg"
                  aria-label={`Remove existing photo ${i + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New file upload previews */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`New upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg"
                aria-label={`Remove new image ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {totalCount < maxImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm text-slate-500 hover:border-slate-400 transition-colors"
        >
          + Add photo{totalCount > 0 ? ` (${totalCount}/${maxImages})` : ''}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
