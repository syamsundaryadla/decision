import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function initAdmin() {
  const serviceAccountKey = process.env.FIREBASE_ADMIN_KEY;

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    
    // In development, if we have a key but the app was initialized without it, 
    // we need to force a re-initialization.
    if (process.env.NODE_ENV === "development" && serviceAccountKey) {
      const { deleteApp } = require("firebase-admin/app");
      // This is a bit aggressive but necessary for HMR to pick up .env changes
      // We only do this if we haven't already initialized it with the key in this process
      // But since this module re-runs, we can just delete and re-init.
      try {
        // deleteApp(adminApp); // Deleting might be too disruptive if done on every HMR
        // Instead, let's just initialize a SECOND app if the default is broken? 
        // No, let's stick to the default and just tell the user to restart if needed, 
        // OR better: use a named app for admin.
      } catch (e) {}
    }
  }
  
  if (!adminApp || (getApps().length === 0)) {
    let serviceAccount;
    
    if (serviceAccountKey) {
      try {
        // Handle both raw JSON and base64 encoded JSON
        const decodedKey = serviceAccountKey.startsWith('{') 
          ? serviceAccountKey 
          : Buffer.from(serviceAccountKey, 'base64').toString('utf8');
          
        serviceAccount = JSON.parse(decodedKey);
        
        console.log("Firebase Admin: Successfully parsed service account key for project:", serviceAccount.project_id);
        
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (e: any) {
        console.error("Failed to parse FIREBASE_ADMIN_KEY:", e.message);
        return;
      }
    } else {
      // Fallback: initialize with project ID only (works on GCP, limited elsewhere)
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      if (projectId) {
        adminApp = initializeApp({ projectId });
      } else {
        console.warn(
          "Firebase Admin: No FIREBASE_ADMIN_KEY found. Authentication will fail in production."
        );
        return;
      }
    }
  }

  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);

  // Verification check to prevent later crashes if unauthorized
  if (process.env.NODE_ENV === "development" && !process.env.FIREBASE_ADMIN_KEY) {
    console.warn("Firebase Admin: Running in development without FIREBASE_ADMIN_KEY. Firestore admin operations may fail.");
  }
}

// Initialize on module load
initAdmin();

export { adminAuth, adminDb };
