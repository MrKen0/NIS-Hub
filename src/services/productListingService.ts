import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
import type { ProductListing } from '@/types/content';

type CreateProductListingData = Omit<ProductListing, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'imageUrls'>;

export async function uploadProductImage(uid: string, file: File): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `content/${uid}/products/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function createProductListing(
  data: CreateProductListingData,
  images: File[],
  uid: string
): Promise<string> {
  // Upload images first
  const imageUrls = await Promise.all(
    images.map((file) => uploadProductImage(uid, file))
  );

  const docRef = await addDoc(collection(db, 'productListings'), {
    ...data,
    imageUrls,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
