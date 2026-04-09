/**
 * Shared image upload helper for community content.
 * Uploads a single file to Firebase Storage and returns the download URL.
 *
 * Storage path: content/{uid}/{contentType}/{timestamp}_{safeName}
 *
 * CLIENT ONLY — do not import from API routes or server components.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './client';

type ContentType = 'products' | 'services' | 'events' | 'notices';

export async function uploadContentImage(
  uid: string,
  contentType: ContentType,
  file: File,
): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `content/${uid}/${contentType}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
