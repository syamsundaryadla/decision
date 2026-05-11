import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const adminToken = await verifyAdminAuth(req);
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
  }

  try {
    // Fetch last 50 users (in a real app, implement pagination)
    const usersSnapshot = await adminDb
      .collection("users")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    
    // Specifically handle the "Could not load the default credentials" error in development
    if (error.message?.includes("Could not load the default credentials")) {
      return NextResponse.json({ 
        error: "Firebase Admin Credentials Missing", 
        message: "Please add FIREBASE_ADMIN_KEY to your .env.local to view user data."
      }, { status: 500 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminToken = await verifyAdminAuth(req);
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
  }

  try {
    const { action, userId, amount, isSuspended } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);

    if (action === "update_credits") {
      if (typeof amount !== "number") return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

      await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error("User not found");

        transaction.update(userRef, { credits: FieldValue.increment(amount) });
        
        const txRef = adminDb!.collection("credit_transactions").doc();
        transaction.set(txRef, {
          userId,
          amount,
          type: "admin_adjustment",
          description: `Admin adjusted credits by ${amount}`,
          createdAt: FieldValue.serverTimestamp()
        });
      });

      return NextResponse.json({ success: true, message: `Credits updated by ${amount}` });
    }

    if (action === "suspend_user") {
      if (typeof isSuspended !== "boolean") return NextResponse.json({ error: "Invalid suspension status" }, { status: 400 });

      await userRef.update({ isSuspended });
      
      // We could also revoke refresh tokens using admin auth
      if (isSuspended) {
        const { getAuth } = await import("firebase-admin/auth");
        try {
          await getAuth().revokeRefreshTokens(userId);
        } catch (dbError) {
          if (process.env.NODE_ENV !== "development") {
            console.warn("Firestore admin check skipped:", (dbError as Error).message);
          }
        }
      }

      return NextResponse.json({ success: true, message: `User suspension status set to ${isSuspended}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to perform user action:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
