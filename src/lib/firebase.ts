import type { Analytics } from 'firebase/analytics';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, GoogleAuthProvider } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import firebaseConfig from '../../firebase.config.json';

/**
 * The Firebase SDK is by far the heaviest dependency in the app (~1.7 MB of
 * source across app/auth/firestore/analytics) and none of it is needed to paint
 * the first tool. Every accessor below imports its SDK module on first use, so
 * each one lands in its own async chunk instead of the entry bundle.
 *
 * Type-only imports above are erased at compile time and cost nothing at runtime.
 */

let appPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<Auth> | null = null;
let dbPromise: Promise<Firestore> | null = null;
let providerPromise: Promise<GoogleAuthProvider> | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

/** Initialise (once) and return the Firebase app. */
export const getFirebaseApp = (): Promise<FirebaseApp> => {
  appPromise ??= import('firebase/app').then(({ initializeApp }) => initializeApp(firebaseConfig));
  return appPromise;
};

/** Auth instance — loads firebase/auth on first call. */
export const getAuthInstance = (): Promise<Auth> => {
  authPromise ??= Promise.all([import('firebase/auth'), getFirebaseApp()]).then(
    ([{ getAuth }, app]) => getAuth(app)
  );
  return authPromise;
};

/** Firestore instance — loads firebase/firestore on first call. */
export const getDb = (): Promise<Firestore> => {
  dbPromise ??= Promise.all([import('firebase/firestore'), getFirebaseApp()]).then(
    ([{ getFirestore }, app]) => getFirestore(app)
  );
  return dbPromise;
};

/** Google sign-in provider — loads firebase/auth on first call. */
export const getGoogleProvider = (): Promise<GoogleAuthProvider> => {
  providerPromise ??= import('firebase/auth').then(
    ({ GoogleAuthProvider: Provider }) => new Provider()
  );
  return providerPromise;
};

/** Analytics instance, or null when the environment does not support it. */
export const getAnalyticsInstance = (): Promise<Analytics | null> => {
  analyticsPromise ??= (async () => {
    const [{ getAnalytics, isSupported }, app] = await Promise.all([
      import('firebase/analytics'),
      getFirebaseApp(),
    ]);
    if (!(await isSupported())) return null;
    console.info('📊 Analytics enabled');
    return getAnalytics(app);
  })();
  return analyticsPromise;
};
