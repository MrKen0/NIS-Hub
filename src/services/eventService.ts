import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { CommunityEvent } from '@/types/content';

type CreateEventData = Omit<CommunityEvent, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'rsvpCount'>;

export async function createEvent(data: CreateEventData): Promise<string> {
  const docRef = await addDoc(collection(db, 'events'), {
    ...data,
    status: 'pending',
    rsvpCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
