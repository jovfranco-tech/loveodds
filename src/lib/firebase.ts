import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID
};

let app;
let db: Firestore | null = null;

if (apiKey && projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.warn("Firebase credentials not found. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in .env.local to enable Firestore.");
}

export { app, db };
