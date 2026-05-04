"use client";

import { useEffect } from "react";
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
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userAccount, setUserAccount } = useAppStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
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
          <button className="w-full bg-primary text-primary-foreground text-sm font-medium py-2 rounded-xl hover:opacity-90 transition-opacity">
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
            <div className="p-5 flex items-center justify-between group cursor-pointer hover:bg-muted/30 transition-colors">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-xs text-muted-foreground uppercase tracking-tight">{userAccount.subscriptionStatus}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="p-5 flex items-center justify-between group cursor-pointer hover:bg-muted/30 transition-colors">
              <div>
                <p className="text-sm font-medium">Billing History</p>
                <p className="text-xs text-muted-foreground">View your past invoices</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="p-5">
              <button className="text-sm font-medium text-primary hover:underline">
                Upgrade to Pro →
              </button>
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
    </div>
  );
}
