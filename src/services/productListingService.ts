import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { uploadContentImage } from '@/lib/firebase/uploadContentImage';
import { parseApiError } from '@/lib/apiError';
import { mapDoc } from '@/lib/firebase/mapDoc';
import type { ProductListing } from '@/types/content';

type CreateProductListingData = Omit<
  ProductListing,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'imageUrls' | 'surfacedAt' | 'lastRepublishedAt'
>;

// Fields the owner may change during an edit (excludes protected/timestamp fields)
type UpdateProductListingData = Partial<
  Omit<ProductListing, 'id' | 'authorId' | 'createdAt' | 'status' | 'imageUrls' | 'surfacedAt' | 'lastRepublishedAt'>
>;

// ---------- Storage helpers ----------

export async function uploadProductImage(uid: string, file: File): Promise<string> {
  return uploadContentImage(uid, 'products', file);
}

// ---------- Create ----------

export async function createProductListing(
  data: CreateProductListingData,
  images: File[],
  uid: string,
  token: string,
): Promise<string> {
  if (!token) {
    throw new Error('Authentication error — please sign in again.');
  }

  // ── Step 1: precheck before any image upload ─────────────────────────────
  // Prevents orphaned Storage files when content is blocked.
  const precheckRes = await fetch('/api/content/product/precheck', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({ title: data.title, description: data.description }),
  });

  if (!precheckRes.ok) {
    const precheckBody = await precheckRes.json().catch(() => ({})) as Record<string, unknown>;
    if (precheckBody.code === 'CONTENT_BLOCKED') {
      throw new Error('Your content could not be posted. Please review and try again.');
    }
    throw new Error(parseApiError(precheckRes.status, precheckBody, 'Failed to post product listing. Please try again.'));
  }

  // ── Step 2: upload images (only reached if precheck passed) ──────────────
  const imageUrls = await Promise.all(images.map((file) => uploadProductImage(uid, file)));

  // ── Step 3: create document via API (re-runs safety check server-side) ───
  const { authorId: _a, flagged: _f, flagReason: _fr, ...bodyData } = data;

  const createRes = await fetch('/api/content/product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({ ...bodyData, imageUrls }),
  });

  if (!createRes.ok) {
    const createBody = await createRes.json().catch(() => ({})) as Record<string, unknown>;
    if (createBody.code === 'CONTENT_BLOCKED') {
      throw new Error('Your content could not be posted. Please review and try again.');
    }
    throw new Error(parseApiError(createRes.status, createBody, 'Failed to post product listing. Please try again.'));
  }

  const { id } = await createRes.json() as { id: string };
  return id;
}

// ---------- Owner queries ----------

/**
 * Fetch all product listings authored by the given user, newest first.
 * Requires the composite index: authorId ASC + createdAt DESC.
 */
export async function getMyProductListings(uid: string, max = 50): Promise<ProductListing[]> {
  const q = query(
    collection(db, 'productListings'),
    where('authorId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<ProductListing>(d));
}

// ---------- Owner mutations ----------

/**
 * Edit a product listing the caller owns.
 * Uploads any new images, then combines them with the retained existing URLs.
 * Always forces status back to 'pending' so the listing re-enters moderation.
 */
export async function updateProductListing(
  id: string,
  data: UpdateProductListingData,
  newImages: File[],       // new File objects to upload
  retainedUrls: string[], // existing Storage URLs the user chose to keep
  uid: string,
): Promise<void> {
  const newUrls = await Promise.all(newImages.map((f) => uploadProductImage(uid, f)));
  const imageUrls = [...retainedUrls, ...newUrls];

  await updateDoc(doc(db, 'productListings', id), {
    ...data,
    imageUrls,
    status: 'pending',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Boost a product listing — moves it to the top of freshness-sorted browse.
 * Only updates timestamps; status stays unchanged (must be 'approved').
 */
export async function republishProductListing(id: string): Promise<void> {
  await updateDoc(doc(db, 'productListings', id), {
    lastRepublishedAt: serverTimestamp(),
    surfacedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
