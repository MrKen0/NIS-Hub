"use client";

import { useRef, useState } from 'react';

interface ImageUploadProps {
  images: File[];
  onChange: (files: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUpload({
  images,
  onChange,
  maxImages = 3,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

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

    const combined = [...images, ...newFiles].slice(0, maxImages);
    onChange(combined);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">
        Photos (up to {maxImages})
      </span>

      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-300">
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg"
                aria-label={`Remove image ${i + 1}`}
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm text-slate-500 hover:border-slate-400 transition-colors"
        >
          + Add photo{images.length > 0 ? ` (${images.length}/${maxImages})` : ''}
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
