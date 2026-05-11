"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { DecisionSimulator } from "@/components/DecisionSimulator";
import { LogOut, Sun, Moon, Sparkles, Clock, BrainCircuit, Menu, X, Dice5, Layers } from "lucide-react";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlaygroundMenuOpen, setIsPlaygroundMenuOpen] = useState(false);

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
