"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Sun,
  Moon,
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

type ViewState = "login" | "signup";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewState>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setIsSubmitting(false);
    }
  };

  const handleMainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (view === "login") {
        await signInWithEmail(email, password);
        // On success, the useEffect will redirect
      } else {
        // Signup Flow Step 1: Validate Password Match
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        // Signup Flow Step 1: Request OTP
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send OTP");
        
        setOtpStep(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Step 2: Verify OTP
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP code");

      // Step 3: Create Firebase Account
      await signUpWithEmail(email, password);
      // On success, useEffect redirects to dashboard
    } catch (err: any) {
      setError(err.message || "Verification failed.");
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

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
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center mb-6 hover:opacity-80 transition-opacity">
              <img src="/decisely-light.png" alt="Decisely Logo" className="h-12 w-auto object-contain dark:hidden" />
              <img src="/decisely.png" alt="Decisely Logo" className="h-10 w-auto object-contain hidden dark:block" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
              {otpStep ? "Verify your email" : view === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {otpStep 
                ? `We sent a code to ${email}`
                : view === "login" 
                  ? "Enter your details to access your account." 
                  : "Start making confident, data-backed decisions."}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive leading-relaxed">{error}</p>
              </div>
            )}

            {!otpStep ? (
              <>
                <form onSubmit={handleMainSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email address</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {view === "signup" && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-sm font-medium">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !email || !password || (view === "signup" && !confirmPassword)}
                    className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-[15px] font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isSubmitting ? "Processing..." : view === "login" ? "Sign In" : "Create Account"}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setView(view === "login" ? "signup" : "login"); setError(null); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {view === "login" ? (
                        <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
                      ) : (
                        <>Already have an account? <span className="text-primary font-medium">Log in</span></>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Verification Code</label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-lg tracking-[0.5em] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Please check your spam folder if you don't see it.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length < 6}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-[15px] font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtp(""); setError(null); }}
                  className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
              </form>
            )}

            {!otpStep && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-background border border-border text-foreground rounded-xl px-5 py-3.5 text-[15px] font-medium hover:bg-muted/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
