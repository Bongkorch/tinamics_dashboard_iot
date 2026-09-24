import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const HISTORY_COLLECTION = 'roomReadingHistory';

function createApp(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // With FIRESTORE_EMULATOR_HOST set, firebase-admin talks to the emulator and needs no credentials.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: projectId ?? 'demo-tinamics' });
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set');
  }
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }),
  });
}

export function getAdminDb() {
  return getFirestore(getApps()[0] ?? createApp());
}
