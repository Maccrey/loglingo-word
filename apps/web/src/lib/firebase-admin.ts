import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import {
  type AIChatMessage,
  type AIChatMessageDocumentStore
} from '@wordflow/ai';
import {
  type AIRecommendationDocumentStore,
  type AIRecommendationRecord
} from '@wordflow/ai/recommendation';
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

export function createFirestoreAIChatStore(): AIChatMessageDocumentStore {
  const firestore = getFirestore(getFirebaseAdminApp());

  return {
    async addMany(messages) {
      const batch = firestore.batch();

      for (const message of messages) {
        const docRef = firestore.collection('chat_messages').doc();
        batch.set(docRef, message);
      }

      await batch.commit();
    },
    async listByUserId(userId) {
      const snapshot = await firestore
        .collection('chat_messages')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'asc')
        .get();

      return snapshot.docs.map((doc) => doc.data() as AIChatMessage);
    }
  };
}

export function createFirestoreAIRecommendationStore(): AIRecommendationDocumentStore {
  const firestore = getFirestore(getFirebaseAdminApp());

  return {
    async get(userId, weekId) {
      const snapshot = await firestore
        .collection('ai_recommendations')
        .doc(`${userId}:${weekId}`)
        .get();

      return snapshot.exists
        ? (snapshot.data() as AIRecommendationRecord)
        : null;
    },
    async set(record) {
      await firestore
        .collection('ai_recommendations')
        .doc(`${record.userId}:${record.weekId}`)
        .set(record);
    }
  };
}
