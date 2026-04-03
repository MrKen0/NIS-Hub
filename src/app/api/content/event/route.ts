/**
 * POST /api/content/event
 * ------------------------
 * Server-side event creation with content safety check.
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

  const title       = typeof b.title       === 'string' ? b.title.trim()       : '';
  const description = typeof b.description === 'string' ? b.description.trim() : '';
  const date        = typeof b.date        === 'string' ? b.date.trim()        : '';
  const time        = typeof b.time        === 'string' ? b.time.trim()        : '';
  const location    = typeof b.location    === 'string' ? b.location.trim()    : '';
  const category    = typeof b.category    === 'string' ? b.category.trim()    : '';
  const organiser   = typeof b.organiser   === 'string' ? b.organiser.trim()   : '';
  const contactLink = typeof b.contactLink === 'string' ? b.contactLink.trim() : '';
  const expiresAt   = typeof b.expiresAt   === 'string' ? b.expiresAt.trim()   : '';

  if (!title)       return NextResponse.json({ error: 'title is required' },       { status: 400 });
  if (!description) return NextResponse.json({ error: 'description is required' }, { status: 400 });
  if (!date)        return NextResponse.json({ error: 'date is required' },        { status: 400 });
  if (!time)        return NextResponse.json({ error: 'time is required' },        { status: 400 });
  if (!location)    return NextResponse.json({ error: 'location is required' },    { status: 400 });
  if (!category)    return NextResponse.json({ error: 'category is required' },    { status: 400 });
  if (!expiresAt)   return NextResponse.json({ error: 'expiresAt is required' },   { status: 400 });
  if (title.length > 120)        return NextResponse.json({ error: 'title exceeds 120 characters' },       { status: 400 });
  if (description.length > 2000) return NextResponse.json({ error: 'description exceeds 2000 characters' }, { status: 400 });
  if (location.length > 200)     return NextResponse.json({ error: 'location exceeds 200 characters' },    { status: 400 });

  // ── 4. Content safety check ───────────────────────────────────────────────
  const safety = await checkContentSafety(`${title} ${description}`);
  if (safety.blocked) {
    return NextResponse.json({ code: 'CONTENT_BLOCKED' }, { status: 400 });
  }

  // ── 5. Write to Firestore ─────────────────────────────────────────────────
  const ref = await adminDb.collection('events').add({
    title,
    description,
    date,
    time,
    location,
    category,
    organiser,
    contactLink,
    expiresAt,
    authorId:   uid,
    status:     'pending',
    rsvpCount:  0,
    flagged:    safety.flagged,
    flagReason: safety.flagged ? 'keyword_policy' : null,
    createdAt:  FieldValue.serverTimestamp(),
    updatedAt:  FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: ref.id }, { status: 200 });
}
