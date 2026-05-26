import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * Verify Firebase ID token from the Authorization header.
 * Shared across all authenticated API routes to prevent drift.
 *
 * Returns `{ uid }` on success, or `null` if auth fails.
 * In development without FIREBASE_ADMIN_KEY, returns a dev-user fallback.
 */
export async function verifyAuth(
  req: NextRequest
): Promise<{ uid: string } | null> {
  if (!adminAuth) {
    console.warn(
      "[AUTH] adminAuth is null. Check FIREBASE_ADMIN_KEY configuration."
    );
    if (process.env.NODE_ENV === "development") return { uid: "dev-user" };
    return null;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) return null;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { uid: decodedToken.uid };
  } catch (error: any) {
    console.error("[AUTH] Token verification failed:", error.message);
    return null;
  }
}
