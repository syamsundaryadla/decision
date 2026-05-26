import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { verifyAuth } from "@/lib/verifyAuth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const PLAN_AMOUNTS: Record<string, number> = {
  pay_per_use: 500,  // ₹5 in paise
  plus: 9900,        // ₹99 in paise
  pro: 34900,        // ₹349 in paise
};

// [PAY-005 FIX] Singleton Razorpay instance — no need to create per-request
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay | null {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

  if (!keyId || !keySecret) {
    console.error("[RAZORPAY] Missing credentials — KEY_ID:", !!keyId, "KEY_SECRET:", !!keySecret);
    return null;
  }

  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
}

export async function POST(req: NextRequest) {
  try {
    // [PAY-006 FIX] Rate limit: max 5 order creations per minute per IP
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`create-order:${ip}`, {
      maxRequests: 5,
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

    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json({ error: "Payment gateway not configured." }, { status: 500 });
    }

    // [SEC-001 FIX] Use shared verifyAuth
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
