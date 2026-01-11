import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';

import { auth, db, googleProvider } from '@/lib/firebase';
import { useToolStore } from '@/store/tool-store';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const { pinnedToolIds, recentToolIds, theme, setPinnedToolIds, setRecentToolIds, setTheme } =
    useToolStore();

  // Use ref to capture current values for initial sync (avoid stale closure)
  const localDataRef = useRef({ pinnedToolIds, recentToolIds, theme });

  // Update ref when values change
  useEffect(() => {
    localDataRef.current = { pinnedToolIds, recentToolIds, theme };
  }, [pinnedToolIds, recentToolIds, theme]);

  // Listen to auth state changes
  useEffect(() => {
    const handleAuthChange = async (user: User | null) => {
      // Update auth state immediately
      setState({ user, loading: false, error: null });

      // Sync with Firestore in background (don't block auth state)
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.pinnedToolIds) setPinnedToolIds(data.pinnedToolIds as string[]);
            if (data.recentToolIds) setRecentToolIds(data.recentToolIds as string[]);
            if (data.theme) setTheme(data.theme as 'light' | 'dark' | 'system');
          } else {
            // New user - save current local data to Firestore
            const { pinnedToolIds: pinned, recentToolIds: recent, theme: t } = localDataRef.current;
            await setDoc(doc(db, 'users', user.uid), {
              pinnedToolIds: pinned,
              recentToolIds: recent,
              theme: t,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void handleAuthChange(user);
    });

    return () => {
      unsubscribe();
    };
  }, [setPinnedToolIds, setRecentToolIds, setTheme]);

  // Sign in with Google
  const signIn = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  };

  // Sign out
  const signOut = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signOut,
    isAuthenticated: !!state.user,
  };
}

// Sync local changes to Firestore (call this when user data changes)
export async function syncToFirestore(
  userId: string,
  data: {
    pinnedToolIds?: string[];
    recentToolIds?: string[];
    theme?: string;
  }
) {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error syncing to Firestore:', error);
  }
}
