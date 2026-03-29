"use client";

import { useState } from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import Button from './Button';
import { NOTICE_CATEGORIES } from '@/types/content';

export interface NoticeFormData {
  title: string;
  body: string;
  category: string;
  expiresAt: string;
}

interface NoticeFormProps {
  defaultValues?: Partial<NoticeFormData>;
  onSubmit: (data: NoticeFormData) => Promise<void>;
}

export default function NoticeForm({ defaultValues, onSubmit }: NoticeFormProps) {
  const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    body: '',
    category: 'General',
    expiresAt: defaultExpiry,
    ...defaultValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof NoticeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Title and body are required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Notice Title"
        value={formData.title}
        onChange={(v) => handleChange('title', v)}
        placeholder="e.g., Community Meeting This Sunday"
        required
      />

      <FormField
        label="Body"
        value={formData.body}
        onChange={(v) => handleChange('body', v)}
        placeholder="Write your notice content here..."
        textarea
        rows={6}
        required
      />

      <SelectField
        label="Category"
        value={formData.category}
        onChange={(v) => handleChange('category', v)}
        options={NOTICE_CATEGORIES}
        required
      />

      <FormField
        label="Expires On"
        type="date"
        value={formData.expiresAt}
        onChange={(v) => handleChange('expiresAt', v)}
        min={new Date().toISOString().substring(0, 10)}
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Posting...' : 'Post Notice'}
      </Button>
    </form>
  );
}