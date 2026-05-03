import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyAljS-ABfr5qRYUzqJ73vFnxhR9CjvvAXQ",
  authDomain: "naprednikrizickruzic.firebaseapp.com",
  projectId: "naprednikrizickruzic",
  storageBucket: "naprednikrizickruzic.firebasestorage.app",
  messagingSenderId: "891874633936",
  appId: "1:891874633936:web:6f07a9e9e0023c674596d5"
};

const app = initializeApp(firebaseConfig);

// ── App Check ─────────────────────────────────────────────────────────────
// In development, enable a debug token so you don't need a valid reCAPTCHA
// while running on localhost. The token will be printed in the console on
// first run; copy it into Firebase Console → App Check → Apps → ⋮ → Manage
// debug tokens.
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-undef
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Replace the value below with your reCAPTCHA v3 site key from
// Firebase Console → App Check → Apps → Web → Register.
// Recommended: put it in a `.env` file as VITE_RECAPTCHA_SITE_KEY.
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'PASTE_YOUR_RECAPTCHA_V3_SITE_KEY_HERE';

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true
});

export const db = getFirestore(app);
export const auth = getAuth(app);
