import { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

const GCAL_TOKEN_KEY  = 'gcal_token';
const GCAL_TOKEN_TIME = 'gcal_token_time';
const TOKEN_TTL_MS    = 3500 * 1000; // ~58 min (Google tokens last 1 h)

function saveToken(token: string) {
  sessionStorage.setItem(GCAL_TOKEN_KEY, token);
  sessionStorage.setItem(GCAL_TOKEN_TIME, Date.now().toString());
}

/** セッション内で有効な Google OAuth アクセストークンを返す。期限切れなら null */
export function getGcalToken(): string | null {
  const token = sessionStorage.getItem(GCAL_TOKEN_KEY);
  const ts    = sessionStorage.getItem(GCAL_TOKEN_TIME);
  if (!token || !ts) return null;
  if (Date.now() - parseInt(ts) > TOKEN_TTL_MS) return null;
  return token;
}

function makeProvider() {
  const p = new GoogleAuthProvider();
  p.addScope('https://www.googleapis.com/auth/calendar.events');
  return p;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // リダイレクト後の結果を処理
    getRedirectResult(auth).then(result => {
      if (result?.user) {
        setUser(result.user);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) saveToken(credential.accessToken);
      }
    }).catch(() => {});

    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, makeProvider());
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) saveToken(credential.accessToken);
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, makeProvider());
      } else {
        setError('ログインに失敗しました。もう一度お試しください。');
      }
    }
  };

  /** トークン期限切れ時にポップアップで再取得する */
  const reconnectGcal = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, makeProvider());
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        saveToken(credential.accessToken);
        return true;
      }
    } catch (e) {
      console.error('Google Calendar reconnect failed:', e);
    }
    return false;
  };

  const signOutUser = () => {
    sessionStorage.removeItem(GCAL_TOKEN_KEY);
    sessionStorage.removeItem(GCAL_TOKEN_TIME);
    return signOut(auth);
  };

  return { user, authLoading, error, signInWithGoogle, signOutUser, reconnectGcal };
}
