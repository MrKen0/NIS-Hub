/**
 * Shared Firestore document mapping helpers
 * ------------------------------------------
 * Converts raw Firestore snapshots (which may contain Timestamp objects)
 * into plain objects with all date-like fields normalised to ISO strings.
 *
 * Used by browseService, serviceListingService, productListingService.
 * Each service imports from here rather than maintaining its own copy.
 */

/** Convert a Firestore Timestamp-like value to an ISO string. Returns '' for missing/null values. */
export function toISO(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof val === 'string' ? val : '';
}

/** Convert a nullable Firestore Timestamp-like value to an ISO string, preserving null. */
export function toISOOrNull(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof val === 'string' ? val : null;
}

/**
 * Map a Firestore document snapshot to a typed object.
 * Normalises the standard timestamp fields (createdAt, updatedAt,
 * lastRepublishedAt, surfacedAt) to ISO strings — or null for the
 * optional boost fields that may not be present on older documents.
 */
export function mapDoc<T>(
  snap: { id: string; data: () => Record<string, unknown> },
): T {
  const d = snap.data();
  return {
    ...d,
    id: snap.id,
    createdAt:           toISO(d.createdAt),
    updatedAt:           toISO(d.updatedAt),
    lastRepublishedAt:   toISOOrNull(d.lastRepublishedAt),
    surfacedAt:          toISOOrNull(d.surfacedAt),
  } as T;
}
