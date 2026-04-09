/**
 * POST /api/content/product/precheck
 * ------------------------------------
 * Runs the content safety check on product text fields BEFORE the client
 * uploads images to Firebase Storage. This prevents orphaned Storage files
 * when a product submission is blocked.
 *
 * Returns only { ok: true } or { code: 'CONTENT_BLOCKED' }.
 * Does NOT reveal whether content is flagged (that is server-only state).
 *
 * Requires a valid Firebase ID token in the Authorization header.
 */

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { checkContentSafety } from '@/services/contentSafetyService';

export async function POST(req: Request) {
  // ── 1. Verify Firebase ID token ──────────────────────────────────────────
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await adminAuth.verifyIdToken(token);
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

  if (!title)       return NextResponse.json({ error: 'title is required' },       { status: 400 });
  if (!description) return NextResponse.json({ error: 'description is required' }, { status: 400 });
  if (title.length > 120)        return NextResponse.json({ error: 'title exceeds 120 characters' },        { status: 400 });
  if (description.length > 2000) return NextResponse.json({ error: 'description exceeds 2000 characters' }, { status: 400 });

  // ── 4. Content safety check ───────────────────────────────────────────────
  let safety;
  try {
    safety = await checkContentSafety(`${title} ${description}`);
  } catch {
    return NextResponse.json({ error: 'Safety check unavailable' }, { status: 500 });
  }
  if (safety.blocked) {
    return NextResponse.json({ code: 'CONTENT_BLOCKED' }, { status: 400 });
  }

  // Safe to proceed with image upload
  return NextResponse.json({ ok: true }, { status: 200 });
}
