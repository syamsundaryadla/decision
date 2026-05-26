import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAuth } from "@/lib/verifyAuth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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

// [PAY-005] Singleton Razorpay instance for fetching order details
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay | null {
  if (razorpayInstance) return razorpayInstance;
  const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  if (!keyId || !keySecret) return null;
  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
}

export async function POST(req: NextRequest) {
  try {
    // [PAY-006 FIX] Rate limit: max 10 verify attempts per minute per IP
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`verify-payment:${ip}`, {
      maxRequests: 10,
      windowSeconds: 60,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // [SEC-001 FIX] Use shared verifyAuth
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields (plan is NOT taken from client — see PAY-004 fix below)
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature." },
        { status: 400 }
      );
    }

    // STEP 1: Verify HMAC-SHA256 signature
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

    // [PAY-004 FIX] Get the plan from the Razorpay order (trusted server-side source),
    // NOT from the client request body. This prevents a user from paying ₹5 but claiming "pro".
    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json({ error: "Payment gateway not configured." }, { status: 500 });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const plan = (order.notes as Record<string, string>)?.plan;
    const orderUserId = (order.notes as Record<string, string>)?.userId;

    if (!plan || !(plan in PLAN_CREDITS)) {
      console.error(`[PAYMENT] Invalid plan in order notes: ${plan} for order ${razorpay_order_id}`);
      return NextResponse.json({ error: "Invalid plan associated with this order." }, { status: 400 });
    }

    // Verify the order belongs to the authenticated user
    if (orderUserId && orderUserId !== authResult.uid && authResult.uid !== "dev-user") {
      console.warn(`[PAYMENT] User mismatch: order user ${orderUserId} vs auth user ${authResult.uid}`);
      return NextResponse.json({ error: "Order does not belong to this user." }, { status: 403 });
    }

    // Signature verified — now update Firestore
    if (adminDb && authResult.uid !== "dev-user") {
      const db = adminDb;

      // [PAY-002 FIX] Idempotency check — prevent replay attacks
      // Check if this order_id was already processed before granting credits
      const existingTx = await db.collection("credit_transactions")
        .where("razorpayOrderId", "==", razorpay_order_id)
        .where("type", "==", "purchase")
        .limit(1)
        .get();

      if (!existingTx.empty) {
        console.warn(`[PAYMENT] Duplicate verification attempt for order ${razorpay_order_id}`);
        return NextResponse.json({
          success: true,
          message: "Payment was already verified.",
          plan,
          duplicate: true,
        });
      }

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
