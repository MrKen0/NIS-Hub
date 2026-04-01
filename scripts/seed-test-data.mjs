/**
 * Seed Test Data — local development only
 * ========================================
 *
 * Creates predictable [TEST] service listings in Firestore for
 * Playwright E2E tests. Uses the Firebase client SDK and signs in
 * as the test user to respect Firestore security rules.
 *
 * Usage:
 *   node scripts/seed-test-data.mjs                 # seed test data
 *   node scripts/seed-test-data.mjs --clean          # remove [TEST] data only
 *
 * Environment variables required:
 *   TEST_USER_EMAIL    — email of a user who has completed onboarding
 *   TEST_USER_PASSWORD — password for that user
 *
 * This is NOT a production seeding tool. It writes clearly-labelled
 * test data that can be identified and removed with --clean.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

// ---------- Config ----------

const app = initializeApp({
  apiKey: 'AIzaSyBmQzTgNMyweWYep2LCGV845ly3dl5DasA',
  authDomain: 'nis-hub-10ac3.firebaseapp.com',
  projectId: 'nis-hub-10ac3',
  storageBucket: 'nis-hub-10ac3.firebasestorage.app',
  messagingSenderId: '180675150151',
  appId: '1:180675150151:web:3396354ea9d1751118cc62',
});

const auth = getAuth(app);
const db = getFirestore(app);

const TEST_PREFIX = '[TEST]';

// ---------- Seed definitions ----------

function buildSeedListings(authorId) {
  const now = Timestamp.now();
  const futureExpiry = '2026-12-31';

  return [
    {
      businessName: '[TEST] Pending Plumber',
      category: 'Home & Property',
      subcategory: 'Plumbing',
      description: 'Test seed: pending plumber for moderation approve test.',
      serviceAreas: ['Old Town'],
      whatsapp: '+447000000001',
      phone: '',
      availabilityType: 'flexible',
      expiresAt: futureExpiry,
      status: 'pending',
      authorId,
      createdAt: now,
      updatedAt: now,
    },
    {
      businessName: '[TEST] Pending Electrician',
      category: 'Home & Property',
      subcategory: 'Electrical',
      description: 'Test seed: pending electrician for moderation reject test.',
      serviceAreas: ['Chells'],
      whatsapp: '+447000000002',
      phone: '',
      availabilityType: 'weekdays',
      expiresAt: futureExpiry,
      status: 'pending',
      authorId,
      createdAt: now,
      updatedAt: now,
    },
    {
      businessName: '[TEST] Approved Cleaner',
      category: 'Home & Property',
      subcategory: 'Cleaning',
      description: 'Test seed: approved cleaner for moderation pause test.',
      serviceAreas: ['Old Town'],
      whatsapp: '+447000000003',
      phone: '',
      availabilityType: 'weekdays',
      expiresAt: futureExpiry,
      status: 'approved',
      authorId,
      createdAt: now,
      updatedAt: now,
    },
    {
      businessName: '[TEST] Approved Painter',
      category: 'Home & Property',
      subcategory: 'Painting',
      description: 'Test seed: approved painter for moderation archive test.',
      serviceAreas: ['Broadwater'],
      whatsapp: '+447000000004',
      phone: '',
      availabilityType: 'evenings',
      expiresAt: futureExpiry,
      status: 'approved',
      authorId,
      createdAt: now,
      updatedAt: now,
    },
    {
      businessName: '[TEST] Old Town Movers',
      category: 'Transport & Delivery',
      subcategory: 'Moving Help',
      description: 'Test seed: approved mover for matching test (Help Moving + Old Town).',
      serviceAreas: ['Old Town', 'Town Centre'],
      whatsapp: '+447000000005',
      phone: '',
      availabilityType: 'flexible',
      expiresAt: futureExpiry,
      status: 'approved',
      authorId,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function buildSeedProducts(authorId) {
  const now = Timestamp.now();
  const futureExpiry = '2026-12-31';

  return [
    {
      title: '[TEST] Jollof Rice Mix',
      category: 'Food & Drinks',
      description: 'Test seed: approved product for filtering test.',
      imageUrls: [],
      priceText: '£5.00',
      priceOnRequest: false,
      sellerName: 'Test Seller',
      whatsapp: '+447000000010',
      location: 'Old Town',
      deliveryAvailable: false,
      expiresAt: futureExpiry,
      status: 'approved',
      authorId,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// ---------- Helpers ----------

async function signIn() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.error('Missing TEST_USER_EMAIL or TEST_USER_PASSWORD environment variables.');
    console.error('Set them in your shell or in a .env file.');
    process.exit(1);
  }

  console.log(`Signing in as ${email}...`);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log('Signed in successfully.');
  return cred.user;
}

async function getExistingTestListings() {
  const q = query(collection(db, 'serviceListings'));
  const snap = await getDocs(q);
  return snap.docs.filter((d) => {
    const name = d.data().businessName;
    return typeof name === 'string' && name.startsWith(TEST_PREFIX);
  });
}

async function getExistingTestProducts() {
  const q = query(collection(db, 'productListings'));
  const snap = await getDocs(q);
  return snap.docs.filter((d) => {
    const title = d.data().title;
    return typeof title === 'string' && title.startsWith(TEST_PREFIX);
  });
}

// ---------- Clean ----------

async function clean() {
  const existingServices = await getExistingTestListings();
  const existingProducts = await getExistingTestProducts();

  if (existingServices.length === 0 && existingProducts.length === 0) {
    console.log('No [TEST] listings found. Nothing to clean.');
    process.exit(0);
  }

  if (existingServices.length > 0) {
    console.log(`Found ${existingServices.length} [TEST] service listing(s). Deleting...`);
    for (const d of existingServices) {
      const name = d.data().businessName;
      await deleteDoc(doc(db, 'serviceListings', d.id));
      console.log(`  Deleted: ${name} (${d.id})`);
    }
  }

  if (existingProducts.length > 0) {
    console.log(`Found ${existingProducts.length} [TEST] product listing(s). Deleting...`);
    for (const d of existingProducts) {
      const title = d.data().title;
      await deleteDoc(doc(db, 'productListings', d.id));
      console.log(`  Deleted: ${title} (${d.id})`);
    }
  }

  console.log('Clean complete.');
}

// ---------- Seed ----------

async function seed(authorId) {
  // --- Service listings ---
  const existingServices = await getExistingTestListings();
  const existingServiceNames = new Set(existingServices.map((d) => d.data().businessName));

  const listings = buildSeedListings(authorId);
  let created = 0;
  let skipped = 0;

  console.log('Service listings:');
  for (const listing of listings) {
    if (existingServiceNames.has(listing.businessName)) {
      console.log(`  Skipped (already exists): ${listing.businessName}`);
      skipped++;
      continue;
    }

    const ref = await addDoc(collection(db, 'serviceListings'), listing);
    console.log(`  Created: ${listing.businessName} [${listing.status}] (${ref.id})`);
    created++;
  }

  // --- Product listings ---
  const existingProducts = await getExistingTestProducts();
  const existingProductTitles = new Set(existingProducts.map((d) => d.data().title));

  const products = buildSeedProducts(authorId);

  console.log('\nProduct listings:');
  for (const product of products) {
    if (existingProductTitles.has(product.title)) {
      console.log(`  Skipped (already exists): ${product.title}`);
      skipped++;
      continue;
    }

    const ref = await addDoc(collection(db, 'productListings'), product);
    console.log(`  Created: ${product.title} [${product.status}] (${ref.id})`);
    created++;
  }

  console.log(`\nSeed complete. Created: ${created}, Skipped: ${skipped}.`);
}

// ---------- Main ----------

async function main() {
  const isClean = process.argv.includes('--clean');
  const user = await signIn();

  if (isClean) {
    await clean();
  } else {
    console.log('Seeding [TEST] service listings...\n');
    await seed(user.uid);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
