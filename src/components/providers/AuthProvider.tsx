"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { useAppStore } from "@/lib/store";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserAccount = useAppStore((state) => state.setUserAccount);

  useEffect(() => {
    // Skip if auth is not initialized
    if (!auth || !auth.onAuthStateChanged) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // On login, ensure the user document exists in Firestore
      // This seeds credits and isNewUser flag so they persist on refresh
      if (firebaseUser && db) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(userDocRef, {
          // Only set these fields if the document doesn't already exist (merge: true)
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          // These fields are only written if missing (handled by merge)
          // The actual credit init is done below with a conditional
        }, { merge: true });

        // Check if doc exists to decide whether to seed credits
        const { getDoc } = await import("firebase/firestore");
        const snap = await getDoc(userDocRef);
        if (!snap.exists() || snap.data()?.credits === undefined) {
          // Brand new user — seed 5 credits
          await setDoc(userDocRef, {
            credits: 5,
            subscriptionStatus: "free",
            isNewUser: true,
            role: "user",
            isSuspended: false,
            createdAt: serverTimestamp(),
          }, { merge: true });
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync user data from Firestore
  useEffect(() => {
    if (!user || !db) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Always read from Firestore — this is the single source of truth
        setUserAccount({
          credits: data.credits ?? 5,
          subscriptionStatus: data.subscriptionStatus ?? "free",
          isNewUser: data.isNewUser ?? false,
        });
      }
      // If doc doesn't exist yet, don't change state — 
      // the onAuthStateChanged above will create it
    });

    return () => unsubscribe();
  }, [user, setUserAccount]);

  const signInWithGoogle = async () => {
    if (!auth || !auth.onAuthStateChanged) {
      throw new Error("Firebase Auth is not initialized. Check your environment variables.");
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("AuthProvider: Sign-in error details:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Auth not initialized");
    await firebaseCreateUserWithEmailAndPassword(auth, email, pass);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Auth not initialized");
    await firebaseSignInWithEmailAndPassword(auth, email, pass);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Auth not initialized");
    await firebaseSendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    if (!auth || !auth.onAuthStateChanged) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
