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
import { doc, onSnapshot } from "firebase/firestore";
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

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
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
        setUserAccount({
          credits: data.credits ?? 0,
          subscriptionStatus: data.subscriptionStatus ?? "free",
        });
      } else {
        // First time user - they'll get credits on first analysis via API
        setUserAccount({ credits: 5, subscriptionStatus: "free" });
      }
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
