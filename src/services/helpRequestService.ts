import { auth } from '@/lib/firebase/client';
import type { HelpRequest } from '@/types/content';

type CreateHelpRequestData = Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'expiresAt'>;

export async function createHelpRequest(data: CreateHelpRequestData): Promise<string> {
  // expiresAt is computed here and sent to the server; safety fields are set server-side
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { authorId: _a, flagged: _f, flagReason: _fr, ...bodyData } = data;

  const token = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/content/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({ ...bodyData, expiresAt }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    if (body.code === 'CONTENT_BLOCKED') {
      throw new Error('Your content could not be posted. Please review and try again.');
    }
    throw new Error('Failed to post request. Please try again.');
  }

  const { id } = await res.json() as { id: string };
  return id;
}
