import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import {
  type UserProfileDocumentStore,
  type UserProfileRecord
} from '@wordflow/core/profile';

function getFirebaseAdminConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey
  };
}

export function hasFirebaseAdminConfig(): boolean {
  return getFirebaseAdminConfig() !== null;
}

export function getFirebaseAdminApp() {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const config = getFirebaseAdminConfig();

  if (!config) {
    throw new Error('Firebase Admin configuration is incomplete.');
  }

  return initializeApp({
    credential: cert(config),
    projectId: config.projectId
  });
}

export function createFirestoreUserProfileStore(): UserProfileDocumentStore {
  const firestore = getFirestore(getFirebaseAdminApp());

  return {
    async get(collection, id) {
      const snapshot = await firestore.collection(collection).doc(id).get();
      return snapshot.exists ? (snapshot.data() as UserProfileRecord) : null;
    },
    async set(collection, id, data) {
      await firestore.collection(collection).doc(id).set(data);
    }
  };
}
