import {
  addDoc,
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
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
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `content/${uid}/products/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ---------- Create ----------

export async function createProductListing(
  data: CreateProductListingData,
  images: File[],
  uid: string,
): Promise<string> {
  const imageUrls = await Promise.all(images.map((file) => uploadProductImage(uid, file)));

  const docRef = await addDoc(collection(db, 'productListings'), {
    ...data,
    imageUrls,
    status: 'pending',
    surfacedAt: serverTimestamp(),   // enables freshness sort from day one
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
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
