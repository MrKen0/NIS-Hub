/**
 * POST /api/content/product
 * --------------------------
 * Server-side product listing creation with content safety check.
 * Called AFTER the client has pre-checked and uploaded images to Storage.
 * Re-runs the safety check server-side to prevent precheck bypass.
 *
 * Requires a valid Firebase ID token in the Authorization header.
 */

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { checkContentSafety } from '@/services/contentSafetyService';

export async function POST(req: Request) {
  // ── 1. Verify Firebase ID token ──────────────────────────────────────────
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // ── 3. Validate ───────────────────────────────────────────────────────────
  const b = raw as Record<string, unknown>;

  const title             = typeof b.title             === 'string'  ? b.title.trim()             : '';
  const description       = typeof b.description       === 'string'  ? b.description.trim()       : '';
  const category          = typeof b.category          === 'string'  ? b.category.trim()          : '';
  const priceText         = typeof b.priceText         === 'string'  ? b.priceText.trim()         : '';
  const priceOnRequest    = typeof b.priceOnRequest    === 'boolean' ? b.priceOnRequest            : false;
  const sellerName        = typeof b.sellerName        === 'string'  ? b.sellerName.trim()        : '';
  const whatsapp          = typeof b.whatsapp          === 'string'  ? b.whatsapp.trim()          : '';
  const location          = typeof b.location          === 'string'  ? b.location.trim()          : '';
  const deliveryAvailable = typeof b.deliveryAvailable === 'boolean' ? b.deliveryAvailable         : false;
  const expiresAt         = typeof b.expiresAt         === 'string'  ? b.expiresAt.trim()         : '';
  const imageUrls         = Array.isArray(b.imageUrls)
    ? (b.imageUrls as unknown[]).filter((u): u is string => typeof u === 'string' && u.trim() !== '')
    : [];

  if (!title)       return NextResponse.json({ error: 'title is required' },       { status: 400 });
  if (!description) return NextResponse.json({ error: 'description is required' }, { status: 400 });
  if (!category)    return NextResponse.json({ error: 'category is required' },    { status: 400 });
  if (!sellerName)  return NextResponse.json({ error: 'sellerName is required' },  { status: 400 });
  if (!expiresAt)   return NextResponse.json({ error: 'expiresAt is required' },   { status: 400 });
  if (imageUrls.length === 0) return NextResponse.json({ error: 'at least one imageUrl is required' }, { status: 400 });
  if (title.length > 120)        return NextResponse.json({ error: 'title exceeds 120 characters' },        { status: 400 });
  if (description.length > 2000) return NextResponse.json({ error: 'description exceeds 2000 characters' }, { status: 400 });

  // ── 4. Content safety check (always re-run — prevents precheck bypass) ───
  const safety = await checkContentSafety(`${title} ${description}`);
  if (safety.blocked) {
    return NextResponse.json({ code: 'CONTENT_BLOCKED' }, { status: 400 });
  }

  // ── 5. Write to Firestore ─────────────────────────────────────────────────
  const ref = await adminDb.collection('productListings').add({
    title,
    description,
    category,
    imageUrls,
    priceText,
    priceOnRequest,
    sellerName,
    whatsapp,
    location,
    deliveryAvailable,
    expiresAt,
    authorId:    uid,
    status:      'pending',
    surfacedAt:  FieldValue.serverTimestamp(),
    flagged:     safety.flagged,
    flagReason:  safety.flagged ? 'keyword_policy' : null,
    createdAt:   FieldValue.serverTimestamp(),
    updatedAt:   FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: ref.id }, { status: 200 });
}
