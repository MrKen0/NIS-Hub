import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { HelpRequest } from '@/types/content';

type CreateHelpRequestData = Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'expiresAt'>;

export async function createHelpRequest(data: CreateHelpRequestData): Promise<string> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const docRef = await addDoc(collection(db, 'requests'), {
    ...data,
    expiresAt,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
