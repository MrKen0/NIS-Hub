import { auth } from '@/lib/firebase/client';
import type { CommunityEvent } from '@/types/content';

type CreateEventData = Omit<CommunityEvent, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'rsvpCount'>;

export async function createEvent(data: CreateEventData): Promise<string> {
  // Strip server-set fields — authorId, rsvpCount, and safety fields are set server-side
  const { authorId: _a, flagged: _f, flagReason: _fr, ...bodyData } = data;

  const token = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/content/event', {
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
    throw new Error('Failed to post event. Please try again.');
  }

  const { id } = await res.json() as { id: string };
  return id;
}
