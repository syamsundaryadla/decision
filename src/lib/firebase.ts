import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once, but only if we have an API key
// This prevents build-time crashes on Vercel when env vars are missing
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (typeof window !== "undefined") {
  console.log("Firebase Init: API Key present?", !!apiKey);
}

const app = 
  typeof window !== "undefined" || apiKey
    ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
    : null;

const auth = app ? getAuth(app) : ({} as ReturnType<typeof getAuth>);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
