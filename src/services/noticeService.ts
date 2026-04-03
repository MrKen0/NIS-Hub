import { auth } from '@/lib/firebase/client';
import type { CommunityNotice } from '@/types/content';

type CreateNoticeData = Omit<CommunityNotice, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export async function createNotice(data: CreateNoticeData): Promise<string> {
  // Strip server-set fields — authorId and safety fields are set server-side
  const { authorId: _a, flagged: _f, flagReason: _fr, ...bodyData } = data;

  const token = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/content/notice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    if (body.code === 'CONTENT_BLOCKED') {
      throw new Error('Your content could not be posted. Please review and try again.');
    }
    throw new Error('Failed to post notice. Please try again.');
  }

  const { id } = await res.json() as { id: string };
  return id;
}
