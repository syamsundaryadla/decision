import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminAuth } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const adminToken = await verifyAdminAuth(req);
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
  }

  try {
    // Fetch recent security logs
    const securitySnapshot = await adminDb
      .collection("security_logs")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const securityLogs = securitySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch recent failed API logs
    const apiSnapshot = await adminDb
      .collection("api_logs")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const apiLogs = apiSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ securityLogs, apiLogs });
  } catch (error) {
    console.error("Failed to fetch security logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
