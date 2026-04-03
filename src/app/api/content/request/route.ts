/**
 * POST /api/content/request
 * --------------------------
 * Server-side help request creation with content safety check.
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

  const text             = typeof b.text             === 'string' ? b.text.trim()             : '';
  const category         = typeof b.category         === 'string' ? b.category.trim()         : null;
  const location         = typeof b.location         === 'string' ? b.location.trim()         : '';
  const urgency          = typeof b.urgency          === 'string' ? b.urgency.trim()          : '';
  const preferredContact = typeof b.preferredContact === 'string' ? b.preferredContact.trim() : '';
  const whatsapp         = typeof b.whatsapp         === 'string' ? b.whatsapp.trim()         : '';
  const phone            = typeof b.phone            === 'string' ? b.phone.trim()            : '';
  const expiresAt        = typeof b.expiresAt        === 'string' ? b.expiresAt.trim()        : '';

  if (!text)             return NextResponse.json({ error: 'text is required' },             { status: 400 });
  if (!urgency)          return NextResponse.json({ error: 'urgency is required' },          { status: 400 });
  if (!preferredContact) return NextResponse.json({ error: 'preferredContact is required' }, { status: 400 });
  if (!expiresAt)        return NextResponse.json({ error: 'expiresAt is required' },        { status: 400 });
  if (text.length > 1000) return NextResponse.json({ error: 'text exceeds 1000 characters' }, { status: 400 });

  // ── 4. Content safety check ───────────────────────────────────────────────
  const safety = await checkContentSafety(text);
  if (safety.blocked) {
    return NextResponse.json({ code: 'CONTENT_BLOCKED' }, { status: 400 });
  }

  // ── 5. Write to Firestore ─────────────────────────────────────────────────
  const ref = await adminDb.collection('requests').add({
    text,
    category:         category || null,
    location,
    urgency,
    preferredContact,
    whatsapp,
    phone,
    expiresAt,
    authorId:   uid,
    status:     'pending',
    flagged:    safety.flagged,
    flagReason: safety.flagged ? 'keyword_policy' : null,
    createdAt:  FieldValue.serverTimestamp(),
    updatedAt:  FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: ref.id }, { status: 200 });
}
