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
import { mapDoc } from '@/lib/firebase/mapDoc';
import type { ServiceListing, ProductListing, CommunityEvent, CommunityNotice, HelpRequest } from '@/types/content';

// ---------- helpers ----------

function today() {
  return new Date().toISOString().substring(0, 10);
}

/**
 * Compute the effective "surfaced at" ISO string for freshness sorting.
 * Priority: surfacedAt > lastRepublishedAt > createdAt.
 * This means a boosted listing always appears above un-boosted ones,
 * and a newly created listing starts with its createdAt as the baseline.
 */
function effectiveSurfacedAt(item: ServiceListing | ProductListing): string {
  return item.surfacedAt ?? item.lastRepublishedAt ?? item.createdAt;
}

// ---------- Service Listings ----------

export async function getApprovedServices(max = 50): Promise<ServiceListing[]> {
  // Firestore query unchanged — existing index on (status, expiresAt) still used.
  const q = query(
    collection(db, 'serviceListings'),
    where('status', '==', 'approved'),
    where('expiresAt', '>=', today()),
    orderBy('expiresAt'),
    limit(max),
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => mapDoc<ServiceListing>(d));

  // JS secondary sort: most recently surfaced (boosted or created) first.
  return results.sort((a, b) =>
    effectiveSurfacedAt(b).localeCompare(effectiveSurfacedAt(a)),
  );
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
    limit(max),
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => mapDoc<ProductListing>(d));

  return results.sort((a, b) =>
    effectiveSurfacedAt(b).localeCompare(effectiveSurfacedAt(a)),
  );
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
    limit(max),
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
    limit(max),
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
    limit(max),
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
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<HelpRequest>(d));
}

export async function getRequestById(id: string): Promise<HelpRequest | null> {
  const snap = await getDoc(doc(db, 'requests', id));
  if (!snap.exists()) return null;
  return mapDoc<HelpRequest>(snap);
}
