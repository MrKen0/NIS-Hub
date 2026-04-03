/**
 * Moderation Service — admin Firestore reads + writes
 * -----------------------------------------------------
 * Used exclusively by the admin dashboard. Every status/role change
 * is written to the target document AND logged to moderationActions.
 *
 * No Firebase Admin SDK — all operations use client SDK with Firestore
 * security rules enforcing isContributorOrAdmin() / isAdmin().
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { ContentStatus, ServiceListing, ProductListing, CommunityEvent, CommunityNotice, HelpRequest } from '@/types/content';
import type { UserProfile, UserStatus, UserRole } from '@/types/user';
import type { ModerationAction, ModerationActionType, ModerationTargetType } from '@/types/moderation';

// ---------- Firestore helpers (same pattern as browseService) ----------

function toISO(val: unknown): string {
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof val === 'string' ? val : '';
}

function mapDoc<T>(snap: { id: string; data: () => Record<string, unknown> }): T {
  const d = snap.data();
  return {
    ...d,
    id: snap.id,
    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  } as T;
}

function mapUserDoc(snap: { id: string; data: () => Record<string, unknown> }): UserProfile {
  const d = snap.data();
  return {
    uid: (d.uid as string) ?? snap.id,
    email: (d.email as string) ?? '',
    displayName: (d.displayName as string) ?? '',
    phone: (d.phone as string) ?? '',
    area: (d.area as string) ?? '',
    role: (d.role as UserRole) ?? 'member',
    status: (d.status as UserStatus) ?? 'pending',
    // Backward-compat: old docs have intendedUse (string), new docs have intendedUses (array).
    // Invariant: "member" is always present; no duplicates.
    // old "provider"     → ["member", "provider"]
    // old "contributor"  → ["member", "contributor"]
    // old "member"       → ["member"]
    // new array missing "member" → "member" prepended
    intendedUses: Array.from(new Set<UserProfile['intendedUses'][number]>([
      'member',
      ...(Array.isArray(d.intendedUses)
        ? (d.intendedUses as UserProfile['intendedUses'])
        : typeof d.intendedUse === 'string' && d.intendedUse !== 'member'
          ? [d.intendedUse as UserProfile['intendedUses'][number]]
          : []),
    ])),
    rulesAccepted: (d.rulesAccepted as boolean) ?? false,
    rulesAcceptedAt: d.rulesAcceptedAt && typeof d.rulesAcceptedAt === 'object' && 'toDate' in d.rulesAcceptedAt
      ? (d.rulesAcceptedAt as { toDate: () => Date }).toDate()
      : null,
    onboardingComplete: (d.onboardingComplete as boolean) ?? false,
    team: (d.team as string) ?? undefined,
    teamRole: (d.teamRole as 'Lead' | 'Member') ?? undefined,
    createdAt: d.createdAt && typeof d.createdAt === 'object' && 'toDate' in d.createdAt
      ? (d.createdAt as { toDate: () => Date }).toDate()
      : new Date(),
    updatedAt: d.updatedAt && typeof d.updatedAt === 'object' && 'toDate' in d.updatedAt
      ? (d.updatedAt as { toDate: () => Date }).toDate()
      : new Date(),
  };
}

// ---------- Generic content query ----------

async function queryCollection<T>(
  collectionName: string,
  statusFilter?: ContentStatus,
  max = 100,
): Promise<T[]> {
  const constraints = [];
  if (statusFilter) {
    constraints.push(where('status', '==', statusFilter));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(max));

  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<T>(d));
}

// ---------- Content queries (one per type) ----------

export function getServicesForReview(statusFilter?: ContentStatus, max = 100) {
  return queryCollection<ServiceListing>('serviceListings', statusFilter, max);
}

export function getProductsForReview(statusFilter?: ContentStatus, max = 100) {
  return queryCollection<ProductListing>('productListings', statusFilter, max);
}

export function getEventsForReview(statusFilter?: ContentStatus, max = 100) {
  return queryCollection<CommunityEvent>('events', statusFilter, max);
}

export function getNoticesForReview(statusFilter?: ContentStatus, max = 100) {
  return queryCollection<CommunityNotice>('notices', statusFilter, max);
}

export function getRequestsForReview(statusFilter?: ContentStatus, max = 100) {
  return queryCollection<HelpRequest>('requests', statusFilter, max);
}

// ---------- Real-time listeners (onSnapshot variants) ----------

export function subscribeToServicesForReview(
  statusFilter: ContentStatus | undefined,
  onData: (items: ServiceListing[]) => void,
  onError: (err: Error) => void,
  max = 100,
): () => void {
  const constraints = [];
  if (statusFilter) constraints.push(where('status', '==', statusFilter));
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(max));
  const q = query(collection(db, 'serviceListings'), ...constraints);
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapDoc<ServiceListing>(d))), onError);
}

export function subscribeToUsersForReview(
  statusFilter: UserStatus | undefined,
  onData: (users: UserProfile[]) => void,
  onError: (err: Error) => void,
  max = 200,
): () => void {
  const constraints = [];
  if (statusFilter) constraints.push(where('status', '==', statusFilter));
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(max));
  const q = query(collection(db, 'users'), ...constraints);
  return onSnapshot(q, (snap) => onData(snap.docs.map(mapUserDoc)), onError);
}

export function subscribeToProductsForReview(
  statusFilter: ContentStatus | undefined,
  onData: (items: ProductListing[]) => void,
  onError: (err: Error) => void,
  max = 100,
): () => void {
  const constraints = [];
  if (statusFilter) constraints.push(where('status', '==', statusFilter));
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(max));
  const q = query(collection(db, 'productListings'), ...constraints);
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapDoc<ProductListing>(d))), onError);
}

export function subscribeToEventsForReview(
  statusFilter: ContentStatus | undefined,
  onData: (items: CommunityEvent[]) => void,
  onError: (err: Error) => void,
  max = 100,
): () => void {
  const constraints = [];
  if (statusFilter) constraints.push(where('status', '==', statusFilter));
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(max));
  const q = query(collection(db, 'events'), ...constraints);
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapDoc<CommunityEvent>(d))), onError);
}

export function subscribeToRequestsForReview(
  statusFilter: ContentStatus | undefined,
  onData: (items: HelpRequest[]) => void,
  onError: (err: Error) => void,
  max = 100,
): () => void {
  const constraints = [];
  if (statusFilter) constraints.push(where('status', '==', statusFilter));
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(max));
  const q = query(collection(db, 'requests'), ...constraints);
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => mapDoc<HelpRequest>(d))), onError);
}

// ---------- Content status update + audit log ----------

export async function moderateContent(params: {
  collectionName: 'serviceListings' | 'productListings' | 'events' | 'notices' | 'requests';
  docId: string;
  newStatus: ContentStatus;
  previousValue: string;
  targetType: ModerationTargetType;
  moderatorId: string;
  moderatorName: string;
  reason?: string;
}): Promise<void> {
  // 1. Update the content document
  await updateDoc(doc(db, params.collectionName, params.docId), {
    status: params.newStatus,
    updatedAt: serverTimestamp(),
  });

  // 2. Log the moderation action (immutable audit record)
  const actionType: ModerationActionType =
    params.newStatus === 'approved' ? 'approve'
    : params.newStatus === 'rejected' ? 'reject'
    : params.newStatus === 'paused' ? 'pause'
    : params.newStatus === 'archived' ? 'archive'
    : 'restore';

  await addDoc(collection(db, 'moderationActions'), {
    actionType,
    targetType: params.targetType,
    targetId: params.docId,
    fieldChanged: 'status',
    previousValue: params.previousValue,
    newValue: params.newStatus,
    moderatorId: params.moderatorId,
    moderatorName: params.moderatorName,
    reason: params.reason ?? null,
    createdAt: serverTimestamp(),
  });
}

// ---------- User management ----------

export async function getUsersForReview(
  statusFilter?: UserStatus,
  max = 200,
): Promise<UserProfile[]> {
  const constraints = [];
  if (statusFilter) {
    constraints.push(where('status', '==', statusFilter));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(max));

  const q = query(collection(db, 'users'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(mapUserDoc);
}

export async function moderateUser(params: {
  uid: string;
  fieldChanged: 'status' | 'role';
  previousValue: string;
  newValue: string;
  moderatorId: string;
  moderatorName: string;
  reason?: string;
}): Promise<void> {
  // 1. Update the user document
  await updateDoc(doc(db, 'users', params.uid), {
    [params.fieldChanged]: params.newValue,
    updatedAt: serverTimestamp(),
  });

  // 2. Log the moderation action
  const actionType: ModerationActionType =
    params.fieldChanged === 'role' ? 'role_change'
    : params.newValue === 'approved' ? 'approve'
    : params.newValue === 'paused' ? 'pause'
    : params.newValue === 'archived' ? 'archive'
    : 'reject';

  await addDoc(collection(db, 'moderationActions'), {
    actionType,
    targetType: 'user' as ModerationTargetType,
    targetId: params.uid,
    fieldChanged: params.fieldChanged,
    previousValue: params.previousValue,
    newValue: params.newValue,
    moderatorId: params.moderatorId,
    moderatorName: params.moderatorName,
    reason: params.reason ?? null,
    createdAt: serverTimestamp(),
  });
}

// ---------- Pending counts (for tab badges) ----------

export async function getPendingCounts(): Promise<{
  services: number;
  products: number;
  events: number;
  notices: number;
  requests: number;
  members: number;
  history: number;
}> {
  const pending = (collectionName: string) =>
    getDocs(query(
      collection(db, collectionName),
      where('status', '==', 'pending'),
    )).then((snap) => snap.size);

  const [services, products, events, notices, requests, members] = await Promise.all([
    pending('serviceListings'),
    pending('productListings'),
    pending('events'),
    pending('notices'),
    pending('requests'),
    pending('users'),
  ]);

  return { services, products, events, notices, requests, members, history: 0 };
}

// ---------- Team assignment ----------

/**
 * Assign (or remove) a team and teamRole for a member.
 * Admin-only in practice — the UI guards this, and the Firestore rule for
 * user updates requires the caller to be the owner (no role/status changes)
 * or an admin.
 * Logs a 'team_assignment' action in moderationActions for full audit trail.
 */
export async function updateMemberTeam(params: {
  uid: string;
  team: string | null;
  teamRole: 'Lead' | 'Member' | null;
  moderatorId: string;
  moderatorName: string;
}): Promise<void> {
  // 1. Write the team fields to the user document
  await updateDoc(doc(db, 'users', params.uid), {
    team: params.team ?? null,
    teamRole: params.teamRole ?? null,
    updatedAt: serverTimestamp(),
  });

  // 2. Log the moderation action (immutable audit record)
  const newValue = params.team
    ? `${params.team}${params.teamRole ? ` (${params.teamRole})` : ''}`
    : 'none';

  await addDoc(collection(db, 'moderationActions'), {
    actionType: 'team_assignment',
    targetType: 'user' as ModerationTargetType,
    targetId: params.uid,
    fieldChanged: 'team_assignment',
    previousValue: '',   // previous team not fetched — kept minimal for audit simplicity
    newValue,
    moderatorId: params.moderatorId,
    moderatorName: params.moderatorName,
    reason: null,
    createdAt: serverTimestamp(),
  });
}

// ---------- Moderation history ----------

export async function getModerationHistory(filters?: {
  actionType?: ModerationActionType;
  targetType?: ModerationTargetType;
}, max = 100): Promise<ModerationAction[]> {
  const constraints = [];

  if (filters?.actionType) {
    constraints.push(where('actionType', '==', filters.actionType));
  }
  if (filters?.targetType) {
    constraints.push(where('targetType', '==', filters.targetType));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(max));

  const q = query(collection(db, 'moderationActions'), ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      actionType: data.actionType,
      targetType: data.targetType,
      targetId: data.targetId,
      fieldChanged: data.fieldChanged,
      previousValue: data.previousValue,
      newValue: data.newValue,
      moderatorId: data.moderatorId,
      moderatorName: data.moderatorName,
      reason: data.reason ?? undefined,
      createdAt: toISO(data.createdAt),
    } as ModerationAction;
  });
}
