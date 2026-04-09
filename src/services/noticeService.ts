// auth.currentUser is NOT used here — token is passed in from the page layer
import { uploadContentImage } from '@/lib/firebase/uploadContentImage';
import { parseApiError } from '@/lib/apiError';
import type { CommunityNotice } from '@/types/content';

type CreateNoticeData = Omit<CommunityNotice, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export async function uploadNoticeImage(uid: string, file: File): Promise<string> {
  return uploadContentImage(uid, 'notices', file);
}

export async function createNotice(
  data: CreateNoticeData,
  images: File[],
  uid: string,
  token: string,
): Promise<string> {
  if (!token) {
    throw new Error('Authentication error — please sign in again.');
  }

  // Strip server-set fields — authorId and safety fields are set server-side
  const { authorId: _a, flagged: _f, flagReason: _fr, ...bodyData } = data;

  // Upload images before the API call (images are optional for notices)
  const imageUrls = images.length > 0
    ? await Promise.all(images.map((file) => uploadNoticeImage(uid, file)))
    : [];

  const res = await fetch('/api/content/notice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({ ...bodyData, imageUrls }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    if (body.code === 'CONTENT_BLOCKED') {
      throw new Error('Your content could not be posted. Please review and try again.');
    }
    throw new Error(parseApiError(res.status, body, 'Failed to post notice. Please try again.'));
  }

  const { id } = await res.json() as { id: string };
  return id;
}
