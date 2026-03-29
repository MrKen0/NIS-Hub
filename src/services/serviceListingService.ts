import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { ServiceListing } from '@/types/content';

type CreateServiceListingData = Omit<ServiceListing, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export async function createServiceListing(data: CreateServiceListingData): Promise<string> {
  const docRef = await addDoc(collection(db, 'serviceListings'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
