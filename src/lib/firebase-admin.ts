import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function initAdmin() {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
  } else {
    const serviceAccountKey = process.env.FIREBASE_ADMIN_KEY;

    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (e) {
        console.error("Failed to parse FIREBASE_ADMIN_KEY:", e);
        return;
      }
    } else {
      // Fallback: initialize with project ID only (works on GCP, limited elsewhere)
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      if (projectId) {
        adminApp = initializeApp({ projectId });
      } else {
        console.warn(
          "Firebase Admin: No FIREBASE_ADMIN_KEY or project ID found. Auth verification will be unavailable."
        );
        return;
      }
    }
  }

  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
}

// Initialize on module load
initAdmin();

export { adminAuth, adminDb };
