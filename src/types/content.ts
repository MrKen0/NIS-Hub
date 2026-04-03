/**
 * Content Types — shared types for all 5 post types
 * ---------------------------------------------------
 * Used by creation forms, services, and (later) browse/admin pages.
 */

// -------------------------------------------------------
// Shared status for all content
// -------------------------------------------------------
export type ContentStatus = 'pending' | 'approved' | 'rejected' | 'paused' | 'archived';

// -------------------------------------------------------
// Product Listing
// -------------------------------------------------------
export const PRODUCT_CATEGORIES = [
  'Food & Drinks',
  'Clothing & Fashion',
  'Beauty & Skincare',
  'Home & Kitchen',
  'Electronics',
  'Health & Wellness',
  'Kids & Baby',
  'Arts & Crafts',
  'Other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface ProductListing {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  imageUrls: string[];
  priceText: string;
  priceOnRequest: boolean;
  sellerName: string;
  whatsapp: string;
  location: string;
  deliveryAvailable: boolean;
  expiresAt: string;
  status: ContentStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  /** ISO string — set on create, updated on each manual boost */
  surfacedAt?: string | null;
  /** ISO string — set each time the owner manually boosts the listing */
  lastRepublishedAt?: string | null;
  /** Set server-side when content matches a flagged keyword policy. */
  flagged?: boolean;
  /** Always 'keyword_policy' when set — the matched term is never stored. */
  flagReason?: string;
}

// -------------------------------------------------------
// Service Listing
// -------------------------------------------------------
export const SERVICE_CATEGORIES = {
  'Home & Property': ['Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Gardening', 'Handyman', 'Other'],
  'Beauty & Grooming': ['Hair', 'Nails', 'Makeup', 'Barbing', 'Skincare', 'Other'],
  'Food & Catering': ['Home Cooking', 'Catering', 'Baking', 'Meal Prep', 'Other'],
  'Education & Tutoring': ['Maths', 'English', 'Science', 'Music', 'Languages', 'IT', 'Other'],
  'Transport & Delivery': ['Airport Runs', 'Local Delivery', 'Moving Help', 'Other'],
  'Tech & Digital': ['Web Design', 'Phone Repair', 'IT Support', 'Social Media', 'Other'],
  'Events & Entertainment': ['DJ', 'Photography', 'Videography', 'MC', 'Decoration', 'Other'],
  'Health & Wellness': ['Fitness', 'Massage', 'Nutrition', 'Other'],
  'Professional Services': ['Accounting', 'Legal Advice', 'Immigration', 'CV Writing', 'Other'],
  'Other': ['Other'],
} as const;

export type ServiceCategory = keyof typeof SERVICE_CATEGORIES;
export type ServiceSubcategory<C extends ServiceCategory = ServiceCategory> =
  (typeof SERVICE_CATEGORIES)[C][number];

export type AvailabilityType = 'weekdays' | 'weekends' | 'evenings' | 'flexible';

export interface ServiceListing {
  id: string;
  businessName: string;
  category: ServiceCategory;
  subcategory: string;
  description: string;
  serviceAreas: string[];
  whatsapp: string;
  phone: string;
  availabilityType: AvailabilityType;
  expiresAt: string;
  status: ContentStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  /** ISO string — set on create, updated on each manual boost */
  surfacedAt?: string | null;
  /** ISO string — set each time the owner manually boosts the listing */
  lastRepublishedAt?: string | null;
  /** Set server-side when content matches a flagged keyword policy. */
  flagged?: boolean;
  /** Always 'keyword_policy' when set — the matched term is never stored. */
  flagReason?: string;
}

// -------------------------------------------------------
// Help Request
// -------------------------------------------------------
export const REQUEST_CATEGORIES = [
  'Looking for a Service',
  'Need a Product',
  'Help Moving',
  'Childcare',
  'Transport',
  'Advice / Information',
  'Other',
] as const;

export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export type UrgencyLevel = 'low' | 'medium' | 'high';
export type PreferredContact = 'whatsapp' | 'phone' | 'either';

export interface HelpRequest {
  id: string;
  text: string;
  category: RequestCategory | null;
  location: StevenageArea;
  urgency: UrgencyLevel;
  preferredContact: PreferredContact;
  whatsapp: string;
  phone: string;
  expiresAt: string;
  status: ContentStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  /** Set server-side when content matches a flagged keyword policy. */
  flagged?: boolean;
  /** Always 'keyword_policy' when set — the matched term is never stored. */
  flagReason?: string;
}

// -------------------------------------------------------
// Request → Service/Product matching routing
// -------------------------------------------------------
export type RequestMatchRouting =
  | {
      target: 'services';
      categories: ServiceCategory[] | 'any';
    }
  | {
      target: 'products';
    };

export const REQUEST_MATCH_ROUTING: Record<RequestCategory, RequestMatchRouting> = {
  'Looking for a Service': { target: 'services', categories: 'any' },
  'Need a Product':        { target: 'products' },
  'Help Moving':           { target: 'services', categories: ['Transport & Delivery', 'Home & Property'] },
  'Childcare':             { target: 'services', categories: ['Education & Tutoring'] },
  'Transport':             { target: 'services', categories: ['Transport & Delivery'] },
  'Advice / Information':  { target: 'services', categories: ['Professional Services'] },
  'Other':                 { target: 'services', categories: 'any' },
};

// -------------------------------------------------------
// Event
// -------------------------------------------------------
export const EVENT_CATEGORIES = [
  'Community Gathering',
  'Religious Service',
  'Cultural Event',
  'Workshop',
  'Sports',
  'Education',
  'Networking',
  'Celebration',
  'Other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  organiser: string;
  contactLink: string;
  expiresAt: string;
  status: ContentStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  rsvpCount: number;
  /** Set server-side when content matches a flagged keyword policy. */
  flagged?: boolean;
  /** Always 'keyword_policy' when set — the matched term is never stored. */
  flagReason?: string;
}

// -------------------------------------------------------
// Notice
// -------------------------------------------------------
export const NOTICE_CATEGORIES = [
  'Announcement',
  'Alert',
  'Opportunity',
  'General',
] as const;

export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

export interface CommunityNotice {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  expiresAt: string;
  status: ContentStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  /** Set server-side when content matches a flagged keyword policy. */
  flagged?: boolean;
  /** Always 'keyword_policy' when set — the matched term is never stored. */
  flagReason?: string;
}

// -------------------------------------------------------
// Stevenage areas — reused across forms for location fields
// -------------------------------------------------------
export const STEVENAGE_AREAS = [
  'Bedwell',
  'Broadwater',
  'Chells',
  'Great Ashby',
  'Longmeadow',
  'Old Town',
  'Pin Green',
  'Shephall',
  'St Nicholas',
  'Symonds Green',
  'Town Centre',
  'Woodfield',
  'Other',
] as const;

export type StevenageArea = (typeof STEVENAGE_AREAS)[number];
