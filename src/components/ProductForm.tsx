"use client";

import { useState } from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import ImageUpload from './ImageUpload';
import Button from './Button';
import { PRODUCT_CATEGORIES } from '@/types/content';

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  priceText: string;
  priceOnRequest: boolean;
  sellerName: string;
  whatsapp: string;
  location: string;
  deliveryAvailable: boolean;
  expiresAt: string;
  images: File[];
}

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export default function ProductForm({ defaultValues, onSubmit }: ProductFormProps) {
  const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    category: '',
    priceText: '',
    priceOnRequest: false,
    sellerName: defaultValues?.sellerName ?? '',
    whatsapp: defaultValues?.whatsapp ?? '',
    location: defaultValues?.location ?? '',
    deliveryAvailable: false,
    expiresAt: defaultExpiry,
    images: [],
    ...defaultValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!formData.priceOnRequest && !formData.priceText.trim()) {
      setError('Please enter a price or select "Price on request".');
      return;
    }
    if (!formData.whatsapp.trim()) {
      setError('WhatsApp number is required.');
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
        label="Product Title"
        value={formData.title}
        onChange={(v) => handleChange('title', v)}
        placeholder="e.g., Homemade Jollof Rice, African Print Dress"
        required
      />

      <FormField
        label="Description"
        value={formData.description}
        onChange={(v) => handleChange('description', v)}
        placeholder="Describe your product, what it includes, sizes available..."
        textarea
        rows={4}
        required
      />

      <SelectField
        label="Category"
        value={formData.category}
        onChange={(v) => handleChange('category', v)}
        options={PRODUCT_CATEGORIES}
        required
      />

      <ImageUpload
        images={formData.images}
        onChange={(files) => setFormData(prev => ({ ...prev, images: files }))}
      />

      <div className="space-y-2">
        <FormField
          label="Price"
          value={formData.priceOnRequest ? '' : formData.priceText}
          onChange={(v) => handleChange('priceText', v)}
          placeholder="e.g., £25, From £10"
          required={!formData.priceOnRequest}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={formData.priceOnRequest}
            onChange={(e) => handleChange('priceOnRequest', e.target.checked)}
            className="rounded border-slate-300"
          />
          Price on request
        </label>
      </div>

      <FormField
        label="Seller Name"
        value={formData.sellerName}
        onChange={(v) => handleChange('sellerName', v)}
        placeholder="Your name or business name"
        required
      />

      <FormField
        label="WhatsApp Number"
        value={formData.whatsapp}
        onChange={(v) => handleChange('whatsapp', v)}
        placeholder="e.g., +447123456789"
        required
      />

      <FormField
        label="Location"
        value={formData.location}
        onChange={(v) => handleChange('location', v)}
        placeholder="e.g., Bedwell, Town Centre"
      />

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={formData.deliveryAvailable}
          onChange={(e) => handleChange('deliveryAvailable', e.target.checked)}
          className="rounded border-slate-300"
        />
        Delivery available
      </label>

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
        {submitting ? 'Uploading...' : 'Post Product'}
      </Button>
    </form>
  );
}
