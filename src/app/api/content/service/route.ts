/**
 * POST /api/content/service
 * --------------------------
 * Server-side service listing creation with content safety check.
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

  const businessName      = typeof b.businessName      === 'string' ? b.businessName.trim()      : '';
  const category          = typeof b.category          === 'string' ? b.category.trim()          : '';
  const subcategory       = typeof b.subcategory       === 'string' ? b.subcategory.trim()       : '';
  const description       = typeof b.description       === 'string' ? b.description.trim()       : '';
  const availabilityType  = typeof b.availabilityType  === 'string' ? b.availabilityType.trim()  : '';
  const whatsapp          = typeof b.whatsapp          === 'string' ? b.whatsapp.trim()          : '';
  const phone             = typeof b.phone             === 'string' ? b.phone.trim()             : '';
  const expiresAt         = typeof b.expiresAt         === 'string' ? b.expiresAt.trim()         : '';
  const serviceAreas      = Array.isArray(b.serviceAreas)
    ? (b.serviceAreas as unknown[]).filter((a): a is string => typeof a === 'string' && a.trim() !== '').map(a => a.trim())
    : [];

  if (!businessName)     return NextResponse.json({ error: 'businessName is required' },     { status: 400 });
  if (!category)         return NextResponse.json({ error: 'category is required' },         { status: 400 });
  if (!description)      return NextResponse.json({ error: 'description is required' },      { status: 400 });
  if (!availabilityType) return NextResponse.json({ error: 'availabilityType is required' }, { status: 400 });
  if (!expiresAt)        return NextResponse.json({ error: 'expiresAt is required' },        { status: 400 });
  if (serviceAreas.length === 0) return NextResponse.json({ error: 'at least one serviceArea is required' }, { status: 400 });
  if (businessName.length > 80)  return NextResponse.json({ error: 'businessName exceeds 80 characters' },  { status: 400 });
  if (description.length > 2000) return NextResponse.json({ error: 'description exceeds 2000 characters' }, { status: 400 });

  // ── 4. Content safety check ───────────────────────────────────────────────
  const safety = await checkContentSafety(`${businessName} ${description}`);
  if (safety.blocked) {
    return NextResponse.json({ code: 'CONTENT_BLOCKED' }, { status: 400 });
  }

  // ── 5. Write to Firestore ─────────────────────────────────────────────────
  const ref = await adminDb.collection('serviceListings').add({
    businessName,
    category,
    subcategory,
    description,
    serviceAreas,
    whatsapp,
    phone,
    availabilityType,
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
