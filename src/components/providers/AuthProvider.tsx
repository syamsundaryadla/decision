"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip if auth is not initialized (placeholder object)
    if (!auth || !auth.onAuthStateChanged) {
      console.warn("AuthProvider: Auth not initialized (missing API key)");
      setLoading(false);
      return;
    }

    console.log("AuthProvider: Initializing listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthProvider: State changed, user:", user?.email || "null");
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !auth.onAuthStateChanged) {
      throw new Error("Firebase Auth is not initialized. Check your environment variables.");
    }
    try {
      console.log("AuthProvider: Starting sign in popup");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("AuthProvider: Sign in successful", result.user.email);
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
