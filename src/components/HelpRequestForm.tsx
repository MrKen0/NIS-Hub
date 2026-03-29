"use client";

import { useState } from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import Button from './Button';
import { REQUEST_CATEGORIES, STEVENAGE_AREAS, type UrgencyLevel, type PreferredContact } from '@/types/content';

export interface HelpRequestFormData {
  text: string;
  category: string;
  location: string;
  urgency: UrgencyLevel;
  preferredContact: PreferredContact;
  whatsapp: string;
  phone: string;
}

interface HelpRequestFormProps {
  defaultValues?: Partial<HelpRequestFormData>;
  onSubmit: (data: HelpRequestFormData) => Promise<void>;
}

export default function HelpRequestForm({ defaultValues, onSubmit }: HelpRequestFormProps) {
  const [formData, setFormData] = useState<HelpRequestFormData>({
    text: '',
    category: '',
    location: defaultValues?.location ?? '',
    urgency: 'medium',
    preferredContact: 'whatsapp',
    whatsapp: defaultValues?.whatsapp ?? '',
    phone: defaultValues?.phone ?? '',
    ...defaultValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof HelpRequestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.text.trim()) {
      setError('Please describe what you need help with.');
      return;
    }
    if (!formData.whatsapp && !formData.phone) {
      setError('Please provide at least one contact method.');
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
        label="What do you need?"
        value={formData.text}
        onChange={(v) => handleChange('text', v)}
        placeholder="Describe what you're looking for..."
        textarea
        rows={4}
        required
      />

      <SelectField
        label="Category"
        value={formData.category}
        onChange={(v) => handleChange('category', v)}
        options={REQUEST_CATEGORIES}
        placeholder="Select a category (optional)"
      />

      <SelectField
        label="Location"
        value={formData.location}
        onChange={(v) => handleChange('location', v)}
        options={STEVENAGE_AREAS}
        placeholder="Select your area"
      />

      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-700">Urgency</span>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleChange('urgency', level)}
              className={`flex-1 rounded-lg border p-2 text-sm font-medium capitalize transition-colors ${
                formData.urgency === level
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-700">Preferred contact</span>
        <div className="flex gap-2">
          {([
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'phone', label: 'Phone' },
            { value: 'either', label: 'Either' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange('preferredContact', opt.value)}
              className={`flex-1 rounded-lg border p-2 text-sm font-medium transition-colors ${
                formData.preferredContact === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <FormField
        label="WhatsApp Number"
        value={formData.whatsapp}
        onChange={(v) => handleChange('whatsapp', v)}
        placeholder="e.g., +447123456789"
      />

      <FormField
        label="Phone Number"
        value={formData.phone}
        onChange={(v) => handleChange('phone', v)}
        placeholder="e.g., +447123456789"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Posting...' : 'Post Request'}
      </Button>
    </form>
  );
}
