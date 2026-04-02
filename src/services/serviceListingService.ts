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
import { db } from '@/lib/firebase/client';
import { mapDoc } from '@/lib/firebase/mapDoc';
import type { ServiceListing } from '@/types/content';

// Fields that may not be omitted by the owner on create
type CreateServiceListingData = Omit<
  ServiceListing,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'surfacedAt' | 'lastRepublishedAt'
>;

// Fields the owner may change during an edit
type UpdateServiceListingData = Partial<
  Omit<ServiceListing, 'id' | 'authorId' | 'createdAt' | 'status' | 'surfacedAt' | 'lastRepublishedAt'>
>;

// ---------- Create ----------

export async function createServiceListing(data: CreateServiceListingData): Promise<string> {
  const docRef = await addDoc(collection(db, 'serviceListings'), {
    ...data,
    status: 'pending',
    surfacedAt: serverTimestamp(),   // enables freshness sort from day one
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ---------- Owner queries ----------

/**
 * Fetch all service listings authored by the given user, newest first.
 * Requires the composite index: authorId ASC + createdAt DESC.
 */
export async function getMyServiceListings(uid: string, max = 50): Promise<ServiceListing[]> {
  const q = query(
    collection(db, 'serviceListings'),
    where('authorId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<ServiceListing>(d));
}

// ---------- Owner mutations ----------

/**
 * Edit a service listing the caller owns.
 * Always forces status back to 'pending' so the listing re-enters moderation.
 * The Firestore rule enforces this: owner edits must set status === 'pending'.
 */
export async function updateServiceListing(
  id: string,
  data: UpdateServiceListingData,
): Promise<void> {
  await updateDoc(doc(db, 'serviceListings', id), {
    ...data,
    status: 'pending',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Boost a service listing — moves it to the top of freshness-sorted browse.
 * Only updates timestamps; status stays unchanged (must be 'approved').
 * The Firestore rule enforces: republish writes must not change status.
 */
export async function republishServiceListing(id: string): Promise<void> {
  await updateDoc(doc(db, 'serviceListings', id), {
    lastRepublishedAt: serverTimestamp(),
    surfacedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
