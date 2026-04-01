/**
 * seed-rest.mjs — REST-based seed runner (no Firebase client SDK)
 * ---------------------------------------------------------------
 * Identical data to seed-test-data.mjs but uses Firebase REST APIs
 * directly, avoiding Firebase client SDK / Node.js compatibility issues.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-rest.mjs          # seed
 *   node --env-file=.env.local scripts/seed-rest.mjs --clean  # clean
 */

import https from 'https';

const API_KEY     = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT     = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const TEST_EMAIL  = process.env.TEST_USER_EMAIL;
const TEST_PASS   = process.env.TEST_USER_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS  = process.env.ADMIN_PASSWORD;
const IS_CLEAN    = process.argv.includes('--clean');

const PENDING_MEMBER_EMAIL = 'mrkeno+nispendingtest@gmail.com';
const PENDING_MEMBER_PASS  = 'NisPendingTest2026X';

if (!API_KEY || !PROJECT)   { console.error('Missing Firebase env vars'); process.exit(1); }
if (!TEST_EMAIL || !TEST_PASS) { console.error('Missing TEST_USER_EMAIL or TEST_USER_PASSWORD'); process.exit(1); }

// ----------------------------------------------------------------
// HTTP helpers
// ----------------------------------------------------------------

function request(method, hostname, path, body, token) {
  return new Promise((resolve, reject) => {
    const b = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (b) headers['Content-Length'] = Buffer.byteLength(b);
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = https.request({ hostname, path, method, headers }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (b) req.write(b);
    req.end();
  });
}

const fsBase = `/v1/projects/${PROJECT}/databases/(default)/documents/`;

async function fsGet(collection, token) {
  const r = await request('GET', 'firestore.googleapis.com', fsBase + collection + '?pageSize=200', null, token);
  return r.body.documents || [];
}

async function fsPatch(collection, id, fields, token) {
  const r = await request('PATCH', 'firestore.googleapis.com', fsBase + collection + '/' + id, { fields }, token);
  if (!r.body.name) throw new Error('fsPatch failed: ' + JSON.stringify(r.body).substring(0, 200));
  return r.body;
}

async function fsDelete(docName, token) {
  // Firestore list responses return names like "projects/…/documents/…" (no /v1 prefix).
  // REST DELETE requires "/v1/projects/…". Normalise by prepending /v1/ when needed.
  const path = docName.startsWith('/v1/') ? docName : '/v1/' + docName;
  const r = await request('DELETE', 'firestore.googleapis.com', path, null, token);
  return r.status;
}

// ----------------------------------------------------------------
// Auth
// ----------------------------------------------------------------

async function signIn() {
  const r = await request('POST', 'identitytoolkit.googleapis.com',
    '/v1/accounts:signInWithPassword?key=' + API_KEY,
    { email: TEST_EMAIL, password: TEST_PASS, returnSecureToken: true });
  if (!r.body.localId) throw new Error('Sign-in failed: ' + JSON.stringify(r.body));
  console.log(`Signed in as ${r.body.email}`);
  return { uid: r.body.localId, token: r.body.idToken };
}

async function signInAs(email, password) {
  const r = await request('POST', 'identitytoolkit.googleapis.com',
    '/v1/accounts:signInWithPassword?key=' + API_KEY,
    { email, password, returnSecureToken: true });
  if (!r.body.localId) throw new Error('Sign-in failed for ' + email + ': ' + JSON.stringify(r.body).slice(0, 200));
  return { uid: r.body.localId, token: r.body.idToken };
}

async function signUpOrSignInAs(email, password) {
  const r = await request('POST', 'identitytoolkit.googleapis.com',
    '/v1/accounts:signUp?key=' + API_KEY,
    { email, password, returnSecureToken: true });
  if (r.body.localId) return { uid: r.body.localId, token: r.body.idToken };
  if (r.body.error?.message === 'EMAIL_EXISTS') return signInAs(email, password);
  throw new Error('Sign-up failed for ' + email + ': ' + JSON.stringify(r.body).slice(0, 200));
}

async function fsGetDoc(col, id, token) {
  const r = await request('GET', 'firestore.googleapis.com', fsBase + col + '/' + id, null, token);
  return r.status === 200 ? r.body : null;
}

// ----------------------------------------------------------------
// Field helpers
// ----------------------------------------------------------------

const sv  = (v)   => ({ stringValue: String(v) });
const bv  = (v)   => ({ booleanValue: Boolean(v) });
const ts  = (v)   => ({ timestampValue: v });
const arr = (...vals) => ({ arrayValue: { values: vals.map((v) => ({ stringValue: v })) } });
const emptyArr = () => ({ arrayValue: { values: [] } });

// ----------------------------------------------------------------
// Seed definitions  (mirrors seed-test-data.mjs exactly)
// ----------------------------------------------------------------

function buildServices(authorId) {
  const now = new Date().toISOString();
  return [
    {
      businessName: '[TEST] Pending Plumber',
      category: 'Home & Property', subcategory: 'Plumbing',
      description: 'Test seed: pending plumber for moderation approve test.',
      serviceAreas: ['Old Town'], whatsapp: '+447000000001',
      availabilityType: 'flexible', expiresAt: '2026-12-31',
      status: 'pending', authorId, createdAt: now, updatedAt: now,
    },
    {
      businessName: '[TEST] Pending Electrician',
      category: 'Home & Property', subcategory: 'Electrical',
      description: 'Test seed: pending electrician for moderation reject test.',
      serviceAreas: ['Chells'], whatsapp: '+447000000002',
      availabilityType: 'weekdays', expiresAt: '2026-12-31',
      status: 'pending', authorId, createdAt: now, updatedAt: now,
    },
    {
      businessName: '[TEST] Approved Cleaner',
      category: 'Home & Property', subcategory: 'Cleaning',
      description: 'Test seed: approved cleaner for moderation pause test.',
      serviceAreas: ['Old Town'], whatsapp: '+447000000003',
      availabilityType: 'weekdays', expiresAt: '2026-12-31',
      status: 'approved', authorId, createdAt: now, updatedAt: now,
    },
    {
      businessName: '[TEST] Approved Painter',
      category: 'Home & Property', subcategory: 'Painting',
      description: 'Test seed: approved painter for moderation archive test.',
      serviceAreas: ['Broadwater'], whatsapp: '+447000000004',
      availabilityType: 'evenings', expiresAt: '2026-12-31',
      status: 'approved', authorId, createdAt: now, updatedAt: now,
    },
    {
      businessName: '[TEST] Old Town Movers',
      category: 'Transport & Delivery', subcategory: 'Moving Help',
      description: 'Test seed: approved mover for matching test (Help Moving + Old Town).',
      serviceAreas: ['Old Town', 'Town Centre'], whatsapp: '+447000000005',
      availabilityType: 'flexible', expiresAt: '2026-12-31',
      status: 'approved', authorId, createdAt: now, updatedAt: now,
    },
  ];
}

function buildProducts(authorId) {
  const now = new Date().toISOString();
  return [
    {
      title: '[TEST] Jollof Rice Mix',
      category: 'Food & Drinks',
      description: 'Test seed: approved product for filtering test.',
      priceText: '£5.00', priceOnRequest: false,
      sellerName: 'Test Seller', whatsapp: '+447000000010',
      location: 'Old Town', deliveryAvailable: false,
      expiresAt: '2026-12-31', status: 'approved',
      authorId, createdAt: now, updatedAt: now,
    },
  ];
}

// ----------------------------------------------------------------
// Pending member seed / clean
// ----------------------------------------------------------------

async function seedPendingMember() {
  if (!ADMIN_EMAIL || !ADMIN_PASS) {
    console.log('  Skipped — ADMIN_EMAIL/ADMIN_PASSWORD not set');
    return;
  }
  const { uid: memberUid, token: memberToken } = await signUpOrSignInAs(PENDING_MEMBER_EMAIL, PENDING_MEMBER_PASS);
  const { token: adminToken } = await signInAs(ADMIN_EMAIL, ADMIN_PASS);
  const now = new Date().toISOString();

  const existing = await fsGetDoc('users', memberUid, adminToken);
  if (!existing) {
    // Create the doc signed in as the member (satisfies Firestore isOwner create rule)
    await fsPatch('users', memberUid, {
      uid:               sv(memberUid),
      email:             sv(PENDING_MEMBER_EMAIL),
      displayName:       sv('[TEST] Pending Member'),
      phone:             sv(''),
      area:              sv('Old Town'),
      role:              sv('member'),
      status:            sv('pending'),
      intendedUses:      arr('member'),
      rulesAccepted:     bv(true),
      rulesAcceptedAt:   ts(now),
      onboardingComplete: bv(true),
      createdAt:         ts(now),
      updatedAt:         ts(now),
    }, memberToken);
    console.log(`  Created: [TEST] Pending Member (${memberUid})`);
  } else {
    const currentStatus = existing.fields?.status?.stringValue;
    if (currentStatus !== 'pending') {
      // Admin resets status back to pending (partial field update)
      const r = await request('PATCH', 'firestore.googleapis.com',
        fsBase + 'users/' + memberUid + '?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt',
        { fields: { status: sv('pending'), updatedAt: ts(now) } },
        adminToken);
      if (!r.body.name) throw new Error('Status reset failed: ' + JSON.stringify(r.body).slice(0, 200));
      console.log(`  Reset [TEST] Pending Member: ${currentStatus} → pending`);
    } else {
      console.log('  Skipped (already exists and pending): [TEST] Pending Member');
    }
  }
}

async function cleanPendingMember() {
  if (!ADMIN_EMAIL || !ADMIN_PASS) return;
  const { token: adminToken } = await signInAs(ADMIN_EMAIL, ADMIN_PASS);

  // Delete ALL [TEST] user docs — catches orphans from prior runs where
  // the Auth account was removed but the Firestore doc survived (broken fsDelete path).
  const allUsers = await fsGet('users', adminToken);
  const testUsers = allUsers.filter(d => d.fields?.displayName?.stringValue?.startsWith('[TEST]'));
  if (testUsers.length) {
    for (const u of testUsers) {
      await fsDelete(u.name, adminToken);
      console.log('  Deleted user doc: ' + u.fields.displayName.stringValue);
    }
  } else {
    console.log('  No [TEST] user docs found');
  }

  // Delete the Firebase Auth account if it still exists (sign in only — don't create).
  const pendingCreds = await signInAs(PENDING_MEMBER_EMAIL, PENDING_MEMBER_PASS).catch(() => null);
  if (pendingCreds) {
    await request('POST', 'identitytoolkit.googleapis.com',
      '/v1/accounts:delete?key=' + API_KEY,
      { idToken: pendingCreds.token });
    console.log(`  Deleted Auth account: ${PENDING_MEMBER_EMAIL}`);
  } else {
    console.log(`  No active Auth account for ${PENDING_MEMBER_EMAIL}`);
  }
}

// ----------------------------------------------------------------
// Clean
// ----------------------------------------------------------------

async function clean(token) {
  const services = (await fsGet('serviceListings', token))
    .filter((d) => d.fields?.businessName?.stringValue?.startsWith('[TEST]'));
  const products = (await fsGet('productListings', token))
    .filter((d) => d.fields?.title?.stringValue?.startsWith('[TEST]'));

  if (!services.length && !products.length) {
    console.log('No [TEST] data found. Nothing to clean.');
    return;
  }
  for (const d of services) {
    await fsDelete(d.name, token);
    console.log('  Deleted: ' + d.fields.businessName.stringValue);
  }
  for (const d of products) {
    await fsDelete(d.name, token);
    console.log('  Deleted: ' + d.fields.title.stringValue);
  }
  console.log('\nPending member:');
  await cleanPendingMember();

  console.log('Clean complete.');
}

// ----------------------------------------------------------------
// Seed
// ----------------------------------------------------------------

function randomId() { return Math.random().toString(36).slice(2, 18) + Math.random().toString(36).slice(2, 10); }

async function seed(uid, token) {
  const existingNames = new Set(
    (await fsGet('serviceListings', token))
      .filter((d) => d.fields?.businessName?.stringValue?.startsWith('[TEST]'))
      .map((d) => d.fields.businessName.stringValue)
  );
  const existingTitles = new Set(
    (await fsGet('productListings', token))
      .filter((d) => d.fields?.title?.stringValue?.startsWith('[TEST]'))
      .map((d) => d.fields.title.stringValue)
  );

  let created = 0, skipped = 0;

  console.log('Service listings:');
  for (const s of buildServices(uid)) {
    if (existingNames.has(s.businessName)) {
      console.log(`  Skipped (already exists): ${s.businessName}`);
      skipped++;
      continue;
    }
    await fsPatch('serviceListings', randomId(), {
      businessName:     sv(s.businessName),
      category:         sv(s.category),
      subcategory:      sv(s.subcategory),
      description:      sv(s.description),
      serviceAreas:     arr(...s.serviceAreas),
      whatsapp:         sv(s.whatsapp),
      phone:            sv(''),
      availabilityType: sv(s.availabilityType),
      expiresAt:        sv(s.expiresAt),
      status:           sv(s.status),
      authorId:         sv(s.authorId),
      createdAt:        ts(s.createdAt),
      updatedAt:        ts(s.updatedAt),
    }, token);
    console.log(`  Created: ${s.businessName} [${s.status}]`);
    created++;
  }

  console.log('\nProduct listings:');
  for (const p of buildProducts(uid)) {
    if (existingTitles.has(p.title)) {
      console.log(`  Skipped (already exists): ${p.title}`);
      skipped++;
      continue;
    }
    await fsPatch('productListings', randomId(), {
      title:             sv(p.title),
      category:          sv(p.category),
      description:       sv(p.description),
      imageUrls:         emptyArr(),
      priceText:         sv(p.priceText),
      priceOnRequest:    bv(p.priceOnRequest),
      sellerName:        sv(p.sellerName),
      whatsapp:          sv(p.whatsapp),
      location:          sv(p.location),
      deliveryAvailable: bv(p.deliveryAvailable),
      expiresAt:         sv(p.expiresAt),
      status:            sv(p.status),
      authorId:          sv(p.authorId),
      createdAt:         ts(p.createdAt),
      updatedAt:         ts(p.updatedAt),
    }, token);
    console.log(`  Created: ${p.title} [${p.status}]`);
    created++;
  }

  console.log('\nPending member:');
  await seedPendingMember();

  console.log(`\nSeed complete. Created: ${created}, Skipped: ${skipped}.`);
}

// ----------------------------------------------------------------
// Main
// ----------------------------------------------------------------

const { uid, token } = await signIn();
if (IS_CLEAN) {
  await clean(token);
} else {
  console.log('Seeding [TEST] listings...\n');
  await seed(uid, token);
}
process.exit(0);
