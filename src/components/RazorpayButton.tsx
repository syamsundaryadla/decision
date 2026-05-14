"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayButtonProps {
  plan: "pay_per_use" | "plus" | "pro";
  label: string;
  className?: string;
  onSuccess?: (plan: string) => void;
  onError?: (message: string) => void;
}

const PLAN_LABELS: Record<string, string> = {
  pay_per_use: "Pay per use",
  plus: "Plus — ₹99",
  pro: "Pro — ₹349",
};

const PLAN_AMOUNTS: Record<string, number> = {
  pay_per_use: 500,
  plus: 9900,
  pro: 34900,
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayButton({
  plan,
  label,
  className = "",
  onSuccess,
  onError,
}: RazorpayButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      onError?.("Please sign in to make a payment.");
      return;
    }

    setLoading(true);

    try {
      // Load the Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay checkout. Please check your connection.");
      }

      // Get Firebase ID token for authenticated API call
      const idToken = await user.getIdToken();

      // STEP 1: Create order on the backend
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error ?? "Failed to create payment order.");
      }

      const { order_id, amount, currency } = await orderRes.json();

      // STEP 2: Open Razorpay checkout modal
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!keyId) {
        throw new Error("Razorpay Key ID is missing in frontend. Check Vercel environment variables.");
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Decisely",
        description: PLAN_LABELS[plan] ?? plan,
        order_id,
        prefill: {
          name: user.displayName ?? "",
          email: user.email ?? "",
        },
        theme: {
          color: "#6366f1", // Indigo — matches app primary color
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // STEP 3: Verify payment signature on backend
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error ?? "Payment verification failed.");
            }

            onSuccess?.(plan);
          } catch (verifyError: any) {
            onError?.(verifyError.message ?? "Payment verification failed. Contact support.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Razorpay payment failed:", response.error);
        onError?.(response.error?.description ?? "Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      onError?.(err.message ?? "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`relative inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        label
      )}
    </button>
  );
}
