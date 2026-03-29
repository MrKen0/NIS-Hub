export type ListingStatus = 'pending' | 'approved' | 'rejected';

export interface BaseListing {
  id: string;
  title: string;
  description: string;
  whatsapp: string;
  createdAt: string;
  expiresAt: string;
  status: ListingStatus;
  authorId: string;
  isProduct: boolean;
}

export interface ServiceListing extends BaseListing {
  isProduct: false;
  category: string;
  location: string;
  priceRange?: string;
}

export interface ProductListing extends BaseListing {
  isProduct: true;
  imageUrl: string;
  price: number;
  quantity: number;
}

export type Listing = ServiceListing | ProductListing;

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  location: string;
  category: string;
  maxAttendees?: number;
  whatsapp: string;
  createdAt: string;
  expiresAt: string;
  status: ListingStatus;
  authorId: string;
  rsvpCount: number;
}

// Notice types
export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'announcement' | 'alert' | 'opportunity' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  whatsapp?: string;
  createdAt: string;
  expiresAt: string;
  status: ListingStatus;
  authorId: string;
  viewCount: number;
}
