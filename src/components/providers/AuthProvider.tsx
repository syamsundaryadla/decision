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
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        const { getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");
        
        // Fetch FIRST to avoid cache race conditions where partial merges hide existing fields
        const snap = await getDoc(userDocRef);
        
        if (!snap.exists()) {
          // Brand new user
          await setDoc(userDocRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            credits: 5,
            subscriptionStatus: "free",
            isNewUser: true,
            role: "user",
            isSuspended: false,
            createdAt: serverTimestamp(),
          });
        } else {
          // Existing user, just update profile info if needed (don't touch credits)
          const data = snap.data();
          if (
            data.email !== firebaseUser.email || 
            data.displayName !== firebaseUser.displayName || 
            data.photoURL !== firebaseUser.photoURL ||
            data.credits === undefined // Safety check for corrupted docs
          ) {
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              ...(data.credits === undefined ? { credits: 5 } : {})
            }, { merge: true });
          }
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
    setShowLogoutModal(true);
  };

  const confirmSignOut = async () => {
    if (!auth || !auth.onAuthStateChanged) return;
    try {
      await firebaseSignOut(auth);
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, signOut }}>
      {children}

      {/* Global Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md overflow-hidden bg-card border border-border rounded-3xl shadow-2xl"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">Sign Out</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Are you sure you want to sign out of your account? You will need to log back in to access your saved decisions and AI history.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="w-full py-3 px-4 rounded-xl border border-border hover:bg-muted font-medium text-sm transition-colors text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSignOut}
                    className="w-full py-3 px-4 rounded-xl bg-destructive hover:opacity-90 font-medium text-sm text-destructive-foreground transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-destructive/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Yes, Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
