"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/lib/store";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  CreditCard, 
  Settings, 
  User, 
  Zap, 
  Bell, 
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles as SparklesIcon,
  LogOut
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { RazorpayButton } from "@/components/RazorpayButton";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { userAccount, setUserAccount } = useAppStore();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePaymentSuccess = (plan: string) => {
    setShowSubscriptionModal(false);
    setPaymentMessage({ type: "success", text: `✓ Payment successful! Your ${plan} plan is now active.` });
    setTimeout(() => setPaymentMessage(null), 6000);
  };

  const handlePaymentError = (message: string) => {
    setPaymentMessage({ type: "error", text: message });
    setTimeout(() => setPaymentMessage(null), 6000);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  const toggleNotifications = () => {
    setUserAccount({
      settings: {
        ...userAccount.settings,
        emailNotifications: !userAccount.settings.emailNotifications,
      }
    });
  };

  const toggleVerbosity = () => {
    setUserAccount({
      settings: {
        ...userAccount.settings,
        aiVerbosity: userAccount.settings.aiVerbosity === "concise" ? "detailed" : "concise",
      }
    });
  };

  return (
    <div className="max-w-[800px] mx-auto py-8 px-4 space-y-8">
      {/* Back button */}
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-2"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
            {user?.photoURL ? (
              <Image src={user.photoURL} alt="Avatar" width={80} height={80} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <User className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {user?.displayName || "User Profile"}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                {userAccount.subscriptionStatus} Plan
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Credits</span>
            </div>
            <span className="text-lg font-bold tabular-nums">{userAccount.credits}</span>
          </div>
          <button 
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full bg-primary text-primary-foreground text-sm font-medium py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Add Credits
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Subscription & Billing */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            Subscription
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-xs text-muted-foreground uppercase tracking-tight">{userAccount.subscriptionStatus}</p>
              </div>
            </div>
            <div 
              onClick={() => setShowSubscriptionModal(true)}
              className="p-5 flex items-center justify-between group cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">Manage Plans & Credits</p>
                <p className="text-xs text-muted-foreground">View available top-up options</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            Settings
          </h2>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-info" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email Alerts</p>
                  <p className="text-xs text-muted-foreground">New analysis results</p>
                </div>
              </div>
              <button 
                onClick={toggleNotifications}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  userAccount.settings.emailNotifications ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  userAccount.settings.emailNotifications ? "left-6" : "left-1"
                )} />
              </button>
            </div>

            {/* AI Verbosity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Detail Level</p>
                  <p className="text-xs text-muted-foreground capitalize">{userAccount.settings.aiVerbosity}</p>
                </div>
              </div>
              <button 
                onClick={toggleVerbosity}
                className="text-xs font-medium bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors"
              >
                Toggle
              </button>
            </div>

            {/* Privacy */}
            <div className="flex items-center gap-3 border-t border-border pt-6">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Data Privacy</p>
                <p className="text-xs text-muted-foreground">Encryption enabled</p>
              </div>
            </div>

            {/* Logout */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">Sign Out</p>
                  <p className="text-xs text-muted-foreground">Log out of your account</p>
                </div>
              </div>
              <button 
                onClick={signOut}
                className="text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center border-b border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Top Up Credits</h2>
              <p className="text-sm text-muted-foreground">
                Choose a plan to add more analyses to your account.
              </p>
            </div>

            <div className="p-6 space-y-3 bg-muted/30">
              {/* Pay per use */}
              <div className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div>
                  <h3 className="font-semibold text-foreground">Pay per use</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">1 analysis credit</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">&#8377;5</span>
                  <RazorpayButton
                    plan="pay_per_use"
                    label="Buy"
                    className="text-xs font-semibold bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg transition-colors"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </div>

              {/* Plus */}
              <div className="w-full flex items-center justify-between p-4 rounded-xl border border-primary/40 bg-primary/5">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                    Plus
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">25 analyses</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">&#8377;99</span>
                  <RazorpayButton
                    plan="plus"
                    label="Buy"
                    className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </div>

              {/* Pro */}
              <div className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Best Value
                </div>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                    Pro <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">100 analyses &middot; Save 30%</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary">&#8377;349</span>
                  <RazorpayButton
                    plan="pro"
                    label="Buy"
                    className="text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-lg transition-opacity"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-center bg-card">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-sm text-muted-foreground hover:text-foreground font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment feedback toast */}
      {paymentMessage && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 whitespace-nowrap ${
          paymentMessage.type === "success"
            ? "bg-emerald-500 text-white"
            : "bg-destructive text-destructive-foreground"
        }`}>
          {paymentMessage.text}
        </div>
      )}
    </div>
  );
}
