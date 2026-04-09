"use client";

import { useState } from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import ImageUpload from './ImageUpload';
import Button from './Button';
import { EVENT_CATEGORIES } from '@/types/content';

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organiser: string;
  contactLink: string;
  expiresAt: string;
  linkUrl: string;
  images: File[];
}

interface EventFormProps {
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
}

export default function EventForm({ defaultValues, onSubmit }: EventFormProps) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: tomorrow,
    time: '18:00',
    location: '',
    category: '',
    organiser: defaultValues?.organiser ?? '',
    contactLink: defaultValues?.contactLink ?? '',
    expiresAt: '',
    linkUrl: '',
    images: [],
    ...defaultValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default expiry = event date (set when date changes if expiry is empty or before event)
  const effectiveExpiry = formData.expiresAt || formData.date;

  const handleChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Auto-set expiry to event date if not manually set
      if (field === 'date' && (!prev.expiresAt || prev.expiresAt < value)) {
        next.expiresAt = value;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || !formData.category) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!formData.contactLink.trim()) {
      setError('Please provide a contact link (WhatsApp, phone, or URL).');
      return;
    }
    const linkUrl = formData.linkUrl.trim();
    if (linkUrl && !/^https?:\/\/.+/.test(linkUrl)) {
      setError('Link must start with http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...formData, expiresAt: effectiveExpiry });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Event Title"
        value={formData.title}
        onChange={(v) => handleChange('title', v)}
        placeholder="e.g., Community Prayer Meeting"
        required
      />

      <FormField
        label="Description"
        value={formData.description}
        onChange={(v) => handleChange('description', v)}
        placeholder="Describe the event, what's happening, and any special instructions..."
        textarea
        rows={4}
        required
      />

      <ImageUpload
        images={formData.images}
        onChange={(files) => setFormData(prev => ({ ...prev, images: files }))}
        maxImages={6}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(v) => handleChange('date', v)}
          min={tomorrow}
          required
        />
        <FormField
          label="Time"
          type="time"
          value={formData.time}
          onChange={(v) => handleChange('time', v)}
          required
        />
      </div>

      <FormField
        label="Location"
        value={formData.location}
        onChange={(v) => handleChange('location', v)}
        placeholder="e.g., Stevenage Community Centre, Room 101"
        required
      />

      <SelectField
        label="Category"
        value={formData.category}
        onChange={(v) => handleChange('category', v)}
        options={EVENT_CATEGORIES}
        required
      />

      <FormField
        label="Organiser"
        value={formData.organiser}
        onChange={(v) => handleChange('organiser', v)}
        placeholder="Your name or organisation"
        required
      />

      <FormField
        label="Contact Link"
        value={formData.contactLink}
        onChange={(v) => handleChange('contactLink', v)}
        placeholder="e.g., https://wa.me/447123456789 or phone number"
        required
      />

      <FormField
        label="Listing Expires On"
        type="date"
        value={effectiveExpiry}
        onChange={(v) => handleChange('expiresAt', v)}
        min={formData.date}
        required
      />

      <FormField
        label="Event link"
        value={formData.linkUrl}
        onChange={(v) => handleChange('linkUrl', v)}
        placeholder="https://..."
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Posting...' : 'Post Event'}
      </Button>
    </form>
  );
}
