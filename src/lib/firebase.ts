import { type Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import firebaseConfig from '../../firebase.config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (lazy, only in browser and if supported)
let analyticsInstance: Analytics | null = null;

export const getAnalyticsInstance = async (): Promise<Analytics | null> => {
  if (analyticsInstance) return analyticsInstance;
  const supported = await isSupported();
  if (supported) {
    analyticsInstance = getAnalytics(app);
  }
  return analyticsInstance;
};

// Auto-initialize analytics on load
void getAnalyticsInstance();

export default app;
