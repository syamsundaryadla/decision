"use client";

import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  Target, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Clock,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LandingPage() {
  const { user, loading } = useAuth();
  
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden selection:bg-primary/20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/decisely-light.png" alt="Decisely Logo" className="h-10 md:h-16 w-auto object-contain dark:hidden" />
              <img src="/decisely.png" alt="Decisely Logo" className="h-10 md:h-16 w-auto object-contain hidden dark:block" />
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            {loading ? null : user ? (
              <Link 
                href="/dashboard"
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Link 
                  href="/login"
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  Try for Free
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 overflow-hidden">
          {/* Background glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-primary/20 blur-[100px] rounded-full" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">

            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 max-w-4xl mx-auto leading-[1.1] text-balance"
            >
              Decide with confidence. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-500">
                Backed by data.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance"
            >
              Stop relying on gut feelings. Decisely analyzes your choices, simulates outcomes, and calculates risk-to-reward ratios in seconds.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            >
              <Link 
                href={user ? "/dashboard" : "/login"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Try for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-lg border border-border hover:bg-muted/50 transition-colors"
              >
                How it works
              </a>
            </motion.div>

            {/* Product Mockup Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative mx-auto max-w-5xl rounded-xl border border-border/50 bg-background/50 p-2 backdrop-blur-sm shadow-2xl"
            >
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/80" />
                    <div className="h-3 w-3 rounded-full bg-warning/80" />
                    <div className="h-3 w-3 rounded-full bg-success/80" />
                  </div>
                  <div className="ml-4 text-xs font-medium text-muted-foreground">app.decisely.ai/analyze</div>
                </div>
                <div className="p-6 md:p-10 text-left bg-card grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-muted rounded-md animate-pulse" />
                    <div className="h-4 w-full bg-muted/50 rounded-md animate-pulse" />
                    <div className="h-4 w-5/6 bg-muted/50 rounded-md animate-pulse" />
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                        <span className="text-sm font-medium">Option A: Take new offer</span>
                        <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">78% Match</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border border-border rounded-lg opacity-60">
                        <span className="text-sm font-medium">Option B: Stay at current job</span>
                        <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">42% Match</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-center justify-center border-l border-border pl-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-lg" />
                    <Target className="w-16 h-16 text-primary mb-4" />
                    <div className="text-2xl font-bold">Clear Winner</div>
                    <p className="text-sm text-muted-foreground text-center mt-2">Option A aligns 3x better with your long-term growth parameters.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Decision intelligence in three steps.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                We've simplified complex scenario planning into a streamlined, guided process.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-border" />
              {[
                {
                  step: "01",
                  title: "Define the Context",
                  description: "Input your scenario, define the domain (Career, Finance, etc.), and list the options you are considering."
                },
                {
                  step: "02",
                  title: "Set Parameters",
                  description: "Adjust dynamic sliders for risk tolerance, financial impact, and time horizon to align the AI with your priorities."
                },
                {
                  step: "03",
                  title: "Get Clarity",
                  description: "Receive a detailed breakdown of pros, cons, and a data-backed recommendation on the best path forward."
                }
              ].map((item, i) => (
                <div key={i} className="relative bg-card p-8 rounded-2xl border border-border shadow-sm z-10">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Powerful analysis, <br className="hidden sm:block" />beautifully presented.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 - Large */}
              <div className="md:col-span-2 bg-muted/30 border border-border rounded-3xl p-8 md:p-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BrainCircuit className="w-32 h-32" />
                </div>
                <div className="relative z-10 max-w-md">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Deep Cognitive Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Our fine-tuned models don't just list pros and cons. They evaluate second-order effects, emotional impact, and strategic alignment based on your specific context.
                  </p>
                </div>
              </div>

              {/* Feature 2 - Small */}
              <div className="bg-muted/30 border border-border rounded-3xl p-8 md:p-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Risk vs Reward</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get clear probabilities for success and structured risk assessments for every option.
                </p>
              </div>

              {/* Feature 3 - Small */}
              <div className="bg-muted/30 border border-border rounded-3xl p-8 md:p-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Dynamic Variables</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Adjust sliders for risk tolerance and time horizons to see how outcomes shift in real-time.
                </p>
              </div>

              {/* Feature 4 - Large */}
              <div className="md:col-span-2 bg-muted/30 border border-border rounded-3xl p-8 md:p-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheck className="w-32 h-32" />
                </div>
                <div className="relative z-10 max-w-md">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Unbiased & Objective</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Remove emotional blindspots. Decisely looks purely at the variables, providing a neutral, data-driven perspective on highly charged decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Simple, transparent pricing.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Start making better decisions today. Upgrade when you need more power.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="text-2xl font-semibold mb-2">Pay As You Go</h3>
                <p className="text-muted-foreground mb-6">Perfect for occasional important choices.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">₹9</span>
                  <span className="text-muted-foreground"> / analysis</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Full AI analysis report', 'Standard execution speed', 'Basic domains included', 'Email support'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/login"
                  className="w-full inline-flex items-center justify-center py-3 rounded-xl font-medium border border-border hover:bg-muted transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-card border-2 border-primary rounded-3xl p-8 shadow-xl relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  Pro Bundle <Sparkles className="w-5 h-5 text-primary" />
                </h3>
                <p className="text-muted-foreground mb-6">For frequent decision makers.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-primary">₹99</span>
                  <span className="text-muted-foreground"> / 15 analyses</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Everything in Pay As You Go', 'Save 45% per analysis', 'Priority processing queue', 'Advanced AI verbosity controls'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/login"
                  className="w-full inline-flex items-center justify-center py-3 rounded-xl font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Pro Bundle
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto px-6 text-center relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Stop guessing. Start deciding.
            </h2>
            <p className="text-xl text-muted-foreground mb-10 text-balance max-w-2xl mx-auto">
              Join thousands of users who have traded decision fatigue for data-driven confidence.
            </p>
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-primary/20"
            >
              Try for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/decisely-light.png" alt="Decisely Logo" className="h-6 w-auto object-contain dark:hidden" />
            <img src="/decisely.png" alt="Decisely Logo" className="h-6 w-auto object-contain hidden dark:block" />
            <span className="text-sm text-muted-foreground ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="https://twitter.com/decisely" className="hover:text-foreground transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
