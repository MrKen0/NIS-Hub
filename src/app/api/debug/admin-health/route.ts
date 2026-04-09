/**
 * GET /api/debug/admin-health
 * ----------------------------
 * Temporary diagnostic endpoint — confirms whether Firebase Admin SDK can
 * initialise and whether verifyIdToken works for a token passed in the
 * Authorization header.  Returns no secrets.  DELETE after debugging.
 */
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function GET(req: Request) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? '(not set)';
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? '(not set)';
  const hasPrivateKey = !!(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  const privateKeyPrefix = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.substring(0, 30) ?? '(not set)';

  let adminInitOk = false;
  let adminInitError = '';
  let verifyResult = '';

  // 1. Try initialising the Admin SDK
  try {
    getAdminAuth();
    adminInitOk = true;
  } catch (e) {
    adminInitError = e instanceof Error ? e.message : String(e);
  }

  // 2. If init OK, try verifying the token from the header
  if (adminInitOk) {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (token) {
      try {
        const decoded = await getAdminAuth().verifyIdToken(token);
        verifyResult = `OK — uid: ${decoded.uid}`;
      } catch (e) {
        verifyResult = `FAILED — ${e instanceof Error ? e.message : String(e)}`;
      }
    } else {
      verifyResult = 'no token supplied';
    }
  }

  return NextResponse.json({
    projectId,
    clientEmail: clientEmail.substring(0, 20) + '…',
    hasPrivateKey,
    privateKeyPrefix,
    adminInitOk,
    adminInitError,
    verifyResult,
  });
}
