/**
 * parseApiError — shared helper for client-side service files.
 *
 * Converts an already-parsed response body + status code into a
 * user-facing error message:
 *   400 → surfaces body.error if it is a safe validation string
 *   401 → fixed auth message
 *   5xx → generic fallback (never expose server internals)
 *
 * Usage: read the body once (res.json), check for CONTENT_BLOCKED first,
 * then call parseApiError with the same body + res.status.
 */
export function parseApiError(
  status: number,
  body: Record<string, unknown>,
  fallback: string,
): string {
  if (status === 401) {
    return 'Authentication error — please sign in again.';
  }

  if (status === 400 && typeof body.error === 'string' && body.error.length > 0) {
    return body.error;
  }

  return fallback;
}
