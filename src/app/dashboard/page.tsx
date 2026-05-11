"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { DecisionSimulator } from "@/components/DecisionSimulator";
import { LogOut, Sun, Moon, Sparkles, Clock, BrainCircuit, Menu, X, Dice5, Layers, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlaygroundMenuOpen, setIsPlaygroundMenuOpen] = useState(false);
  const { userAccount, setUserAccount } = useAppStore();

  const handleSelectPlan = (plan: string) => {
    // Dismiss the modal. Payment integration will be handled in the next stage.
    setUserAccount({ isNewUser: false });
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
                <button 
                  onClick={() => handleSelectPlan('plus')}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Select Plus
                </button>
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
                <button 
                  onClick={() => handleSelectPlan('pro')}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Select Pro
                </button>
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
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border relative">
        <div className="max-w-[900px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/decisely-light.png" alt="Decisely" width={140} height={56} className="h-10 md:h-14 w-auto object-contain dark:hidden" priority />
              <Image src="/decisely.png" alt="Decisely" width={120} height={48} className="h-8 md:h-12 w-auto object-contain hidden dark:block" priority />
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
                onClick={signOut}
                className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                aria-label="Sign out"
                id="sign-out-button"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
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
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b border-border bg-background/95 backdrop-blur-xl p-4 flex flex-col gap-2 shadow-lg z-40 animate-in slide-in-from-top-2 duration-200">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium"
            >
              <BrainCircuit className="w-5 h-5" />
              AI Mode
            </Link>
            
            <div className="flex flex-col">
              <button 
                onClick={() => setIsPlaygroundMenuOpen(!isPlaygroundMenuOpen)}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 text-muted-foreground font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Playground
                </div>
              </button>
              
              {isPlaygroundMenuOpen && (
                <div className="flex flex-col gap-1 pl-12 pr-4 pb-2 animate-in slide-in-from-top-1">
                  <Link href="/random?mode=dice" className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Dice5 className="w-4 h-4 text-primary" />
                    Dice Roll
                  </Link>
                  <Link href="/random?mode=cards" className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Layers className="w-4 h-4 text-primary" />
                    Card Draw
                  </Link>
                </div>
              )}
            </div>
            
            <Link 
              href="/dashboard/history" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 text-muted-foreground font-medium transition-colors"
            >
              <Clock className="w-5 h-5" />
              History
            </Link>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <DecisionSimulator />
      </main>
    </div>
  );
}
