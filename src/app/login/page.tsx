"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  const features = [
    {
      icon: BarChart3,
      title: "Data-Driven Analysis",
      desc: "AI evaluates probabilities and risk-reward for every option.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      desc: "Get comprehensive analysis in seconds, not hours.",
    },
    {
      icon: Shield,
      title: "Multi-Domain",
      desc: "Career, Finance, Personal, and Business decisions covered.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Theme toggle */}
      {mounted && (
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[440px] mx-auto">
          {/* Logo / Brand */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-5">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
              Decision Simulator
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Simulate outcomes. Evaluate risks. Make confident decisions with AI.
            </p>
          </div>

          {/* Sign in card */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              id="sign-in-button"
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-xl px-5 py-3.5 text-[15px] font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isSigningIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                  <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors duration-200"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by Gemini AI · Built with Next.js
        </p>
      </footer>
    </div>
  );
}
