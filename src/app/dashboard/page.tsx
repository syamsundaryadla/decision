"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { DecisionSimulator } from "@/components/DecisionSimulator";
import { LogOut, Sun, Moon, Sparkles, Clock, BrainCircuit, Menu, X, Dice5, Layers, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { RazorpayButton } from "@/components/RazorpayButton";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlaygroundMenuOpen, setIsPlaygroundMenuOpen] = useState(false);
  const { userAccount, setUserAccount } = useAppStore();
  const [paymentMessage, setPaymentMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSelectPlan = async (plan: string) => {
    setUserAccount({ isNewUser: false });
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          isNewUser: false,
          selectedPlan: plan,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error("Error updating user plan status:", error);
      }
    }
  };

  const handlePaymentSuccess = async (plan: string) => {
    setPaymentMessage({ type: "success", text: `Payment successful! Your ${plan} plan is now active.` });
    // Dismiss plan modal — Firestore is updated by the verify endpoint
    setUserAccount({ isNewUser: false });
    setTimeout(() => setPaymentMessage(null), 6000);
  };

  const handlePaymentError = (message: string) => {
    setPaymentMessage({ type: "error", text: message });
    setTimeout(() => setPaymentMessage(null), 6000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Onboarding Plan Selection Modal */}
      {userAccount.isNewUser && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen px-4 py-12 md:py-24 flex flex-col items-center">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Choose your plan
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Select a plan to start making better decisions. You can upgrade or downgrade at any time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Free Tier */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm mb-6">Perfect to try out the simulator.</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹0</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['5 full analyses included', 'Standard execution speed', 'Basic domains included'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleSelectPlan('free')}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl font-medium border border-border hover:bg-muted transition-colors"
                >
                  Select Free
                </button>
              </div>

              {/* Pay per use */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Pay per use</h3>
                <p className="text-muted-foreground text-sm mb-6">For occasional important choices.</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹5</span>
                  <span className="text-muted-foreground text-sm"> / analysis</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Pay only for what you use', 'Standard execution speed', 'Email support'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleSelectPlan('pay_per_use')}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl font-medium border border-border hover:bg-muted transition-colors"
                >
                  Select Plan
                </button>
              </div>

              {/* Plus Tier */}
              <div className="bg-card border-2 border-primary/50 rounded-3xl p-6 shadow-md flex flex-col">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  Plus
                </h3>
                <p className="text-muted-foreground text-sm mb-6">For regular decision makers.</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹99</span>
                  <span className="text-muted-foreground text-sm"> / 25 analyses</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Everything in Pay per use', 'Save 20% per analysis', 'Priority processing queue'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <RazorpayButton
                  plan="plus"
                  label="Get Plus — ₹99"
                  className="w-full py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>

              {/* Pro Tier */}
              <div className="bg-card border-2 border-primary rounded-3xl p-6 shadow-xl relative flex flex-col">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  Pro <Sparkles className="w-4 h-4 text-primary shrink-0" />
                </h3>
                <p className="text-muted-foreground text-sm mb-6">For professionals and teams.</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">₹349</span>
                  <span className="text-muted-foreground text-sm"> / 100 analyses</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Everything in Plus', 'Save 30% per analysis', 'Highest priority queue', 'Advanced AI verbosity controls'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <RazorpayButton
                  plan="pro"
                  label="Get Pro — ₹349"
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            </div>
            
            <div className="mt-12">
              <button 
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
            {/* Payment feedback banner */}
            {paymentMessage && (
              <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${
                paymentMessage.type === "success"
                  ? "bg-emerald-500 text-white"
                  : "bg-destructive text-destructive-foreground"
              }`}>
                {paymentMessage.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border relative">
        <div className="max-w-[900px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/decisely-light.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain dark:hidden" priority />
              <Image src="/decisely.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain hidden dark:block" priority />
            </Link>

            <div className="flex items-center gap-6 flex-1 ml-8">
              <div className="hidden sm:flex bg-muted/50 p-1 rounded-xl">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-background shadow-sm text-foreground"
                >
                  <BrainCircuit className="w-4 h-4 text-primary" />
                  AI Mode
                </Link>
                <Link
                  href="/random"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Playground
                </Link>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/history"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Clock className="w-4 h-4" />
                History
              </Link>
              
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              )}

              {/* User avatar / Profile Link */}
              <Link 
                href="/dashboard/profile"
                className="flex items-center gap-2 pl-2 border-l border-border hover:bg-muted/50 rounded-lg py-1 px-2 transition-colors"
              >
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-7 h-7 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="text-xs text-muted-foreground hidden md:block max-w-[120px] truncate">
                  {user.displayName?.split(" ")[0]}
                </span>
              </Link>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 right-0 border-b border-border bg-background/80 backdrop-blur-2xl p-6 flex flex-col gap-6 shadow-2xl z-40"
            >
              <div className="grid grid-cols-2 gap-y-10 gap-x-6 py-4">
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-3 transition-all active:scale-95"
                >
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-1">
                    <BrainCircuit className="w-7 h-7 text-foreground/80" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">AI Mode</span>
                </Link>

                <Link 
                  href="/random?mode=dice" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-3 transition-all active:scale-95"
                >
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-1">
                    <Dice5 className="w-7 h-7 text-foreground/80" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Dice Roll</span>
                </Link>

                <Link 
                  href="/random?mode=cards" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-3 transition-all active:scale-95"
                >
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-1">
                    <Layers className="w-7 h-7 text-foreground/80" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Card Draw</span>
                </Link>

                <Link 
                  href="/dashboard/history" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-3 transition-all active:scale-95"
                >
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-1">
                    <Clock className="w-7 h-7 text-foreground/80" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">History</span>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <Link 
                  href="/dashboard/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {user.displayName?.[0] || user.email?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.displayName || "My Profile"}</p>
                    <p className="text-xs text-muted-foreground truncate">Settings & Billing</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${isMobileMenuOpen ? "blur-md pointer-events-none opacity-50" : ""} w-full max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8`}>
        <DecisionSimulator />
      </main>
    </div>
  );
}
