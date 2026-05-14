import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { adminAuth } from "@/lib/firebase-admin";

const PLAN_AMOUNTS: Record<string, number> = {
  pay_per_use: 500,  // ₹5 in paise
  plus: 9900,        // ₹99 in paise
  pro: 34900,        // ₹349 in paise
};

async function verifyAuth(req: NextRequest): Promise<{ uid: string } | null> {
  if (!adminAuth) {
    if (process.env.NODE_ENV === "development") return { uid: "dev-user" };
    return null;
  }
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY] Missing credentials — KEY_ID:", !!keyId, "KEY_SECRET:", !!keySecret);
      return NextResponse.json({ error: "Payment gateway not configured." }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !(plan in PLAN_AMOUNTS)) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const amount = PLAN_AMOUNTS[plan];

    if (amount < 100) {
      return NextResponse.json({ error: "Amount must be at least ₹1 (100 paise)." }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${authResult.uid.slice(0, 10)}_${Date.now()}`,
      notes: {
        userId: authResult.uid,
        plan,
      },
    });

    console.log(`[RAZORPAY] Order created: ${order.id} for plan: ${plan}`);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("[RAZORPAY] create-order error:", error?.error ?? error?.message ?? error);
    return NextResponse.json(
      { error: error?.error?.description ?? "Failed to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
