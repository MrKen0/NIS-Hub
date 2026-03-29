import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { ServiceListing, ProductListing, CommunityEvent, CommunityNotice, HelpRequest } from '@/types/content';

// ---------- helpers ----------

function today() {
  return new Date().toISOString().substring(0, 10);
}

/** Convert a Firestore Timestamp-like value to an ISO string. */
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

// ---------- Service Listings ----------

export async function getApprovedServices(max = 50): Promise<ServiceListing[]> {
  const q = query(
    collection(db, 'serviceListings'),
    where('status', '==', 'approved'),
    where('expiresAt', '>=', today()),
    orderBy('expiresAt'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<ServiceListing>(d));
}

export async function getServiceById(id: string): Promise<ServiceListing | null> {
  const snap = await getDoc(doc(db, 'serviceListings', id));
  if (!snap.exists()) return null;
  return mapDoc<ServiceListing>(snap);
}

// ---------- Product Listings ----------

export async function getApprovedProducts(max = 50): Promise<ProductListing[]> {
  const q = query(
    collection(db, 'productListings'),
    where('status', '==', 'approved'),
    where('expiresAt', '>=', today()),
    orderBy('expiresAt'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<ProductListing>(d));
}

export async function getProductById(id: string): Promise<ProductListing | null> {
  const snap = await getDoc(doc(db, 'productListings', id));
  if (!snap.exists()) return null;
  return mapDoc<ProductListing>(snap);
}

// ---------- Events ----------

export async function getApprovedEvents(max = 50): Promise<CommunityEvent[]> {
  const q = query(
    collection(db, 'events'),
    where('status', '==', 'approved'),
    where('expiresAt', '>=', today()),
    orderBy('expiresAt'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<CommunityEvent>(d));
}

export async function getEventById(id: string): Promise<CommunityEvent | null> {
  const snap = await getDoc(doc(db, 'events', id));
  if (!snap.exists()) return null;
  return mapDoc<CommunityEvent>(snap);
}

// ---------- Notices ----------

export async function getApprovedNotices(max = 50): Promise<CommunityNotice[]> {
  const q = query(
    collection(db, 'notices'),
    where('status', '==', 'approved'),
    where('expiresAt', '>=', today()),
    orderBy('expiresAt'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<CommunityNotice>(d));
}

export async function getNoticeById(id: string): Promise<CommunityNotice | null> {
  const snap = await getDoc(doc(db, 'notices', id));
  if (!snap.exists()) return null;
  return mapDoc<CommunityNotice>(snap);
}

// ---------- Help Requests ----------

export async function getMyRequests(uid: string, max = 50): Promise<HelpRequest[]> {
  const q = query(
    collection(db, 'requests'),
    where('authorId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<HelpRequest>(d));
}

export async function getApprovedRequests(max = 50): Promise<HelpRequest[]> {
  const q = query(
    collection(db, 'requests'),
    where('status', '==', 'approved'),
    where('expiresAt', '>=', today()),
    orderBy('expiresAt'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<HelpRequest>(d));
}

export async function getRequestById(id: string): Promise<HelpRequest | null> {
  const snap = await getDoc(doc(db, 'requests', id));
  if (!snap.exists()) return null;
  return mapDoc<HelpRequest>(snap);
}
