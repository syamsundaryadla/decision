import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Credits to grant per plan after successful payment
const PLAN_CREDITS: Record<string, number> = {
  pay_per_use: 1,   // 1 credit (top-up per analysis)
  plus: 25,         // 25 analyses
  pro: 100,         // 100 analyses
};

const PLAN_STATUS: Record<string, string> = {
  pay_per_use: "pay_per_use",
  plus: "plus",
  pro: "pro",
};

async function verifyAuth(req: NextRequest): Promise<{ uid: string } | null> {
  if (!adminAuth) {
    console.error("[AUTH] adminAuth is null. Check FIREBASE_ADMIN_KEY configuration.");
    if (process.env.NODE_ENV === "development") return { uid: "dev-user" };
    return null;
  }
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.error("[AUTH] Missing or invalid Authorization header");
    return null;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch (error: any) {
    console.error("[AUTH] Token verification failed:", error.message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return NextResponse.json(
        { error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature, plan." },
        { status: 400 }
      );
    }

    // STEP 3: Verify HMAC-SHA256 signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is not configured.");
      return NextResponse.json({ error: "Payment verification configuration error." }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn(`[PAYMENT] Signature mismatch for order ${razorpay_order_id}`);
      return NextResponse.json(
        { error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // Signature verified — now update Firestore
    if (adminDb && authResult.uid !== "dev-user") {
      const db = adminDb;
      const userRef = db.collection("users").doc(authResult.uid);
      const creditsToAdd = PLAN_CREDITS[plan] ?? 0;

      await db.runTransaction(async (transaction) => {
        transaction.update(userRef, {
          credits: FieldValue.increment(creditsToAdd),
          subscriptionStatus: PLAN_STATUS[plan] ?? "free",
          isNewUser: false,
          selectedPlan: plan,
          lastPaymentId: razorpay_payment_id,
          lastOrderId: razorpay_order_id,
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Log the payment transaction
        const txRef = db.collection("credit_transactions").doc();
        transaction.set(txRef, {
          userId: authResult.uid,
          amount: creditsToAdd,
          type: "purchase",
          plan,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          description: `${plan} plan purchase`,
          createdAt: FieldValue.serverTimestamp(),
        });
      });
    }

    console.log(`[PAYMENT] ✓ Payment verified for user ${authResult.uid}, plan: ${plan}`);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      plan,
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Payment verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
