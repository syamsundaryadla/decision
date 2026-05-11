import { NextRequest } from "next/server";
import { verifyAuth } from "@/app/api/analyze/route"; // Actually, we can't easily import this if it relies on other things or isn't exported well. Wait, verifyAuth is in route.ts, let's see.

// Since verifyAuth is in api/analyze/route.ts, it's better to move it to a shared lib or just write a generic one for admin.
// Actually, let's implement the admin auth helper.
import { adminDb } from "@/lib/firebase-admin";

export async function verifyAdminAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    // We need firebase-admin auth here
    const { getAuth } = await import("firebase-admin/auth");
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Check if the user's email is in the ADMIN_EMAILS environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    
    // Optional: check role in Firestore if we want
    let isFirestoreAdmin = false;
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
        const userData = userDoc.data();
        if (userDoc.exists && (userData?.role === "admin" || userData?.role === "super_admin")) {
          isFirestoreAdmin = true;
        }
      } catch (dbError) {
        // Suppress warning in dev to keep logs clean
        if (process.env.NODE_ENV !== "development") {
          console.warn("Firestore admin check failed:", (dbError as Error).message);
        }
      }
    }

    const emailMatch = decodedToken.email && adminEmails.includes(decodedToken.email);
    
    if (emailMatch || isFirestoreAdmin) {
      return decodedToken;
    }
    
    return null;
  } catch (error) {
    console.error("Admin auth verification failed:", error);
    return null;
  }
}
