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
  Sparkles as SparklesIcon
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userAccount, setUserAccount } = useAppStore();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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
              <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-2xl" />
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
              <h2 className="text-xl font-bold mb-2">Upgrade Your Plan</h2>
              <p className="text-sm text-muted-foreground">
                Choose the plan that fits your decision-making needs.
              </p>
            </div>
            
            <div className="p-6 space-y-4 bg-muted/30">
              {/* Pay As You Go */}
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
                onClick={() => setShowSubscriptionModal(false)}
              >
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Pay As You Go
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">1 analysis (1 credit)</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">₹9</span>
                </div>
              </button>

              {/* Pro Plan */}
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left relative overflow-hidden"
                onClick={() => setShowSubscriptionModal(false)}
              >
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Best Value
                </div>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Pro Plan <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-success" /> 15 Analyses included
                  </p>
                  <p className="text-[10px] text-success mt-0.5 font-medium">Save 45%</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">₹99</span>
                </div>
              </button>
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
    </div>
  );
}
