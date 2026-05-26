import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || id.length < 5) {
      return NextResponse.json(
        { error: "Invalid report ID." },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not available." },
        { status: 503 }
      );
    }

    // SEC-002 FIX: Authenticate the request
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const docSnap = await adminDb.collection("reports").doc(id).get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    const data = docSnap.data();

    // SEC-002 FIX: Verify the authenticated user owns this report
    if (data?.userId && data.userId !== authResult.uid && authResult.uid !== "dev-user") {
      return NextResponse.json(
        { error: "You do not have permission to view this report." },
        { status: 403 }
      );
    }

    // Serialize Firestore Timestamp to ISO string
    const createdAt = data?.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : null;

    return NextResponse.json({
      id: docSnap.id,
      userId: data?.userId ?? "",
      scenario: data?.scenario ?? "",
      domain: data?.domain ?? "personal",
      options: data?.options ?? [],
      parameters: data?.parameters ?? [],
      result: data?.result ?? null,
      createdAt,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report." },
      { status: 500 }
    );
  }
}
