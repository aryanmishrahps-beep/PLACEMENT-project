import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForPlacementPortal2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'placement-portal.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'placement-portal',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'placement-portal.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:1234567890',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://placement-portal-default-rtdb.firebaseio.com',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-1234567890',
};

let app = null;
let auth = null;
let googleProvider = null;
let db = null;
let storage = null;
let realtimeDb = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  storage = getStorage(app);
  realtimeDb = getDatabase(app);
} catch (e) {
  console.warn('Firebase initialization notice:', e?.message || e);
}

export { auth, googleProvider, db, storage, realtimeDb };
export default app;

