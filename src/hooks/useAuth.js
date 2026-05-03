import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

async function ensureFirestoreProfile(user) {
  const ref  = doc(db, 'players', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName || user.email,
      email: user.email,
      rating: 1200,
      games: 0, wins: 0, losses: 0, draws: 0,
      updatedAt: serverTimestamp(),
    });
  }
}

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      u => { setUser(u); setLoading(false); },
      err => {
        // Cached token couldn't be refreshed — clear it and let the user
        // sign in fresh instead of getting stuck on auth/internal-error.
        console.warn('Auth restore failed, signing out:', err);
        fbSignOut(auth).catch(() => {});
        setUser(null);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      await ensureFirestoreProfile(result.user);
    } catch (err) {
      console.error('signIn failed:', err.code, err.message, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
    setUser(null);
  }, []);

  return { user, loading, error, signIn, signOut };
}
