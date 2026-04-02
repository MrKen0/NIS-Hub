"use client";

import { useState } from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import Button from './Button';
import {
  SERVICE_CATEGORIES,
  STEVENAGE_AREAS,
  type ServiceCategory,
  type AvailabilityType,
} from '@/types/content';

export interface ServiceFormData {
  businessName: string;
  category: string;
  subcategory: string;
  description: string;
  serviceAreas: string[];
  whatsapp: string;
  phone: string;
  availabilityType: AvailabilityType;
  expiresAt: string;
}

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  /** Override the submit button label. Defaults to "Post Service". */
  submitLabel?: string;
}

const AVAILABILITY_OPTIONS: { value: AvailabilityType; label: string }[] = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'flexible', label: 'Flexible' },
];

const categoryKeys = Object.keys(SERVICE_CATEGORIES) as ServiceCategory[];

export default function ServiceForm({ defaultValues, onSubmit, submitLabel }: ServiceFormProps) {
  const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  const [formData, setFormData] = useState<ServiceFormData>({
    businessName: defaultValues?.businessName ?? '',
    category: '',
    subcategory: '',
    description: '',
    serviceAreas: defaultValues?.serviceAreas ?? [],
    whatsapp: defaultValues?.whatsapp ?? '',
    phone: defaultValues?.phone ?? '',
    availabilityType: 'flexible',
    expiresAt: defaultExpiry,
    ...defaultValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subcategories = formData.category
    ? (SERVICE_CATEGORIES[formData.category as ServiceCategory] ?? [])
    : [];

  const handleChange = (field: keyof ServiceFormData, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Reset subcategory when category changes
      if (field === 'category') next.subcategory = '';
      return next;
    });
  };

  const toggleArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.businessName.trim() || !formData.category || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!formData.whatsapp && !formData.phone) {
      setError('Please provide at least one contact method.');
      return;
    }
    if (formData.serviceAreas.length === 0) {
      setError('Please select at least one service area.');
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
        label="Business / Service Name"
        value={formData.businessName}
        onChange={(v) => handleChange('businessName', v)}
        placeholder="e.g., Mama's Kitchen, Quick Fix Plumbing"
        required
      />

      <SelectField
        label="Category"
        value={formData.category}
        onChange={(v) => handleChange('category', v)}
        options={categoryKeys}
        required
      />

      {subcategories.length > 0 && (
        <SelectField
          label="Subcategory"
          value={formData.subcategory}
          onChange={(v) => handleChange('subcategory', v)}
          options={subcategories as unknown as string[]}
          placeholder="Select a subcategory"
        />
      )}

      <FormField
        label="Description"
        value={formData.description}
        onChange={(v) => handleChange('description', v)}
        placeholder="Describe your service, what you offer, pricing info..."
        textarea
        rows={4}
        required
      />

      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-700">Service Areas *</span>
        <div className="flex flex-wrap gap-2">
          {STEVENAGE_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleArea(area)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                formData.serviceAreas.includes(area)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-700">Availability</span>
        <div className="flex gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange('availabilityType', opt.value)}
              className={`flex-1 rounded-lg border p-2 text-sm font-medium transition-colors ${
                formData.availabilityType === opt.value
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

      <FormField
        label="Listing Expires On"
        type="date"
        value={formData.expiresAt}
        onChange={(v) => handleChange('expiresAt', v)}
        min={new Date().toISOString().substring(0, 10)}
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Saving...' : (submitLabel ?? 'Post Service')}
      </Button>
    </form>
  );
}
