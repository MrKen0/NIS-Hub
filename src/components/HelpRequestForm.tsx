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

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; surface: string }> = {
  low:    { label: 'Low',    color: '#6B7280', surface: '#F3F4F6' },
  medium: { label: 'Medium', color: '#D97706', surface: '#FEF3C7' },
  high:   { label: 'High',   color: '#DC2626', surface: '#FEE2E2' },
};

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="What do you need?"
        value={formData.text}
        onChange={(v) => handleChange('text', v)}
        placeholder="Describe what you're looking for in as much detail as possible…"
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

      {/* Urgency */}
      <div className="space-y-2">
        <span className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Urgency
        </span>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as const).map((level) => {
            const cfg = urgencyConfig[level];
            const isActive = formData.urgency === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => handleChange('urgency', level)}
                className="flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition-all min-h-[44px]"
                style={{
                  borderColor: isActive ? cfg.color : 'var(--color-border)',
                  background: isActive ? cfg.surface : '#fff',
                  color: isActive ? cfg.color : 'var(--color-muted)',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred contact */}
      <div className="space-y-2">
        <span className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Preferred contact
        </span>
        <div className="flex gap-2">
          {([
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'phone',    label: 'Phone' },
            { value: 'either',   label: 'Either' },
          ] as const).map((opt) => {
            const isActive = formData.preferredContact === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('preferredContact', opt.value)}
                className="flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all min-h-[44px]"
                style={{
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  background: isActive ? 'var(--color-primary-surface)' : '#fff',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <FormField
        label="WhatsApp Number"
        value={formData.whatsapp}
        onChange={(v) => handleChange('whatsapp', v)}
        placeholder="+447123456789"
      />

      <FormField
        label="Phone Number"
        value={formData.phone}
        onChange={(v) => handleChange('phone', v)}
        placeholder="+447123456789"
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? 'Posting…' : 'Post Request'}
      </Button>
    </form>
  );
}
