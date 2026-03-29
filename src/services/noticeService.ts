import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { CommunityNotice } from '@/types/content';

type CreateNoticeData = Omit<CommunityNotice, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export async function createNotice(data: CreateNoticeData): Promise<string> {
  const docRef = await addDoc(collection(db, 'notices'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
