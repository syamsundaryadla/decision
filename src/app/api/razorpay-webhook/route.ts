import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * PAY-003 FIX: Razorpay Webhook Handler
 * 
 * This endpoint receives server-to-server webhook events from Razorpay.
 * It handles the `payment.captured` event to grant credits even if the
 * client-side verification never fires (e.g., user closes browser after paying).
 * 
 * Setup in Razorpay Dashboard:
 * 1. Go to Settings → Webhooks → Add Webhook
 * 2. URL: https://decisely.vercel.app/api/razorpay-webhook
 * 3. Secret: Set a webhook secret (add as RAZORPAY_WEBHOOK_SECRET in env)
 * 4. Events: payment.captured
 */

// Credits to grant per plan
const PLAN_CREDITS: Record<string, number> = {
  pay_per_use: 1,
  plus: 25,
  pro: 100,
};

const PLAN_STATUS: Record<string, string> = {
  pay_per_use: "pay_per_use",
  plus: "plus",
  pro: "pro",
};

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // If no webhook secret is configured, reject all webhook calls
    if (!webhookSecret) {
      console.error("[WEBHOOK] RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
    }

    // Read the raw body for signature verification
    const rawBody = await req.text();
    const receivedSignature = req.headers.get("x-razorpay-signature");

    if (!receivedSignature) {
      console.warn("[WEBHOOK] Missing x-razorpay-signature header");
      return NextResponse.json({ error: "Missing signature." }, { status: 400 });
    }

    // Verify the webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (!crypto.timingSafeEqual(
      Buffer.from(receivedSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    )) {
      console.warn("[WEBHOOK] Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    // Parse the verified body
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[WEBHOOK] Received event: ${eventType}`);

    // Only handle payment.captured events
    if (eventType !== "payment.captured") {
      // Acknowledge but don't process other events
      return NextResponse.json({ status: "ignored", event: eventType });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment) {
      console.error("[WEBHOOK] Missing payment entity in payload");
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const orderId = payment.order_id;
    const paymentId = payment.id;
    const notes = payment.notes || {};
    const userId = notes.userId;
    const plan = notes.plan;

    if (!userId || !plan || !orderId || !paymentId) {
      console.error("[WEBHOOK] Missing required fields in payment notes:", { userId, plan, orderId, paymentId });
      return NextResponse.json({ error: "Missing payment metadata." }, { status: 400 });
    }

    if (!(plan in PLAN_CREDITS)) {
      console.error(`[WEBHOOK] Unknown plan: ${plan}`);
      return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
    }

    // Process the payment in Firestore
    if (!adminDb) {
      console.error("[WEBHOOK] Firestore admin not available");
      return NextResponse.json({ error: "Database not available." }, { status: 500 });
    }

    const db = adminDb;

    // Idempotency check — don't double-grant if already processed
    const existingTx = await db.collection("credit_transactions")
      .where("razorpayOrderId", "==", orderId)
      .where("type", "==", "purchase")
      .limit(1)
      .get();

    if (!existingTx.empty) {
      console.log(`[WEBHOOK] Order ${orderId} already processed — skipping`);
      return NextResponse.json({ status: "already_processed" });
    }

    // Grant credits
    const userRef = db.collection("users").doc(userId);
    const creditsToAdd = PLAN_CREDITS[plan];

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        // Create the user document if it doesn't exist (edge case)
        transaction.set(userRef, {
          credits: creditsToAdd,
          subscriptionStatus: PLAN_STATUS[plan] ?? "free",
          isNewUser: false,
          selectedPlan: plan,
          lastPaymentId: paymentId,
          lastOrderId: orderId,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        transaction.update(userRef, {
          credits: FieldValue.increment(creditsToAdd),
          subscriptionStatus: PLAN_STATUS[plan] ?? "free",
          isNewUser: false,
          selectedPlan: plan,
          lastPaymentId: paymentId,
          lastOrderId: orderId,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      // Log the transaction
      const txRef = db.collection("credit_transactions").doc();
      transaction.set(txRef, {
        userId,
        amount: creditsToAdd,
        type: "purchase",
        plan,
        source: "webhook",
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        description: `${plan} plan purchase (webhook)`,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    console.log(`[WEBHOOK] ✓ Credits granted: ${creditsToAdd} for user ${userId}, plan: ${plan}`);

    return NextResponse.json({ status: "processed", plan, credits: creditsToAdd });
  } catch (error: any) {
    console.error("[WEBHOOK] Error processing webhook:", error);
    // Return 200 to prevent Razorpay from retrying on application errors
    // Only return non-200 for signature/auth failures
    return NextResponse.json({ error: "Internal processing error." }, { status: 500 });
  }
}
