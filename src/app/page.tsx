"use client";

import Link from "next/link";
import Image from "next/image";
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
  ChevronRight,
  Gamepad2
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Decisely",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered decision intelligence platform. Analyze choices, simulate outcomes, and make confident decisions backed by data.",
  url: "https://decisely.vercel.app",
  offers: {
    "@type": "Offer",
    price: "9",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "120",
  },
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden selection:bg-primary/20">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/decisely-light.png" alt="Decisely — AI Decision Intelligence Platform" width={160} height={64} className="h-10 md:h-16 w-auto object-contain dark:hidden" style={{ height: 'auto' }} priority />
              <Image src="/decisely.png" alt="Decisely — AI Decision Intelligence Platform" width={160} height={64} className="h-10 md:h-16 w-auto object-contain hidden dark:block" style={{ height: 'auto' }} priority />
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <nav className="hidden lg:flex items-center gap-8 mr-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/random" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Playground
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </nav>

            {!loading && !user && (
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
          {/* Background decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-[20%] right-[15%] w-[20%] h-[20%] bg-purple-500/10 blur-[80px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Floating Icons for dynamism */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block">
            <motion.div 
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] left-[10%] text-primary/40"
            >
              <BrainCircuit className="w-12 h-12" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[40%] right-[8%] text-blue-500/30"
            >
              <Target className="w-16 h-16" />
            </motion.div>
            <motion.div 
              animate={{ x: [0, 15, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[20%] left-[15%] text-purple-500/30"
            >
              <Zap className="w-10 h-10" />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[60%] left-[5%] text-primary/20"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 md:mb-8 max-w-5xl mx-auto leading-[0.95] text-balance"
            >
              The most intelligent way to <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-purple-600">
                make big decisions.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed text-balance font-light px-4 md:px-0"
            >
              Decisely uses advanced AI to model scenarios, identify blind spots, and simulate outcomes—turning uncertainty into calculated strategy.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
            >
              <Link 
                href={user ? "/dashboard" : "/login"}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-full font-medium text-xl hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-primary/30"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

            </motion.div>

            {/* Product Mockup Preview */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto max-w-5xl rounded-2xl border border-border/50 bg-background/30 p-3 backdrop-blur-xl shadow-[0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_100px_rgba(255,255,255,0.05)]"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 z-[-1]" />
              
              <div className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-inner" />
                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                    <div className="h-3 w-3 rounded-full bg-[#28C840] shadow-inner" />
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase opacity-50">Intelligence Interface</div>
                  <div className="w-12" /> {/* Spacer */}
                </div>
                
                <div className="p-6 md:p-10 text-left grid md:grid-cols-12 gap-8 md:gap-10">
                  <div className="md:col-span-7 space-y-6 md:space-y-8">
                    <div className="space-y-3">
                      <div className="h-8 md:h-10 w-4/5 bg-gradient-to-r from-muted to-muted/30 rounded-lg" />
                      <div className="h-3 md:h-4 w-full bg-muted/40 rounded-md" />
                      <div className="h-3 md:h-4 w-2/3 bg-muted/40 rounded-md" />
                    </div>
                    
                    <div className="grid gap-3 md:gap-4">
                      {[
                        { label: "High Growth Path", score: 88, color: "bg-primary" },
                        { label: "Safety First Strategy", score: 62, color: "bg-blue-500" },
                        { label: "Status Quo", score: 34, color: "bg-muted-foreground/30" }
                      ].map((item, i) => (
                        <div key={i} className="p-3 md:p-4 rounded-xl border border-border bg-background/50 flex items-center justify-between group hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full ${item.color}/10 flex items-center justify-center text-primary`}>
                              {i === 0 ? <Zap className="w-5 h-5 text-primary" /> : <Target className="w-5 h-5 text-muted-foreground" />}
                            </div>
                            <span className="font-semibold">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden hidden sm:block">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                transition={{ duration: 1, delay: 1 + i * 0.2 }}
                                className={`h-full ${item.color}`}
                              />
                            </div>
                            <span className="text-sm font-bold">{item.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:col-span-5 flex flex-col items-center justify-center bg-muted/20 rounded-2xl p-8 border border-border/50 relative overflow-hidden group">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    >
                      <div className="absolute inset-0 border-[40px] border-dashed border-primary rounded-full scale-150" />
                    </motion.div>
                    
                    <div className="relative z-10 text-center">
                      <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10 text-primary shadow-inner">
                        <BrainCircuit className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Optimal Outcome Found</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Based on your 12 unique parameters, the <span className="text-primary font-bold">High Growth Path</span> yields the highest 5-year ROI while maintaining an acceptable risk profile.
                      </p>
                      
                      <div className="mt-8 pt-8 border-t border-border/50 w-full grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="text-left">
                          <div className="text-muted-foreground uppercase mb-1">Risk Score</div>
                          <div className="text-primary font-bold">LOW (14%)</div>
                        </div>
                        <div className="text-left">
                          <div className="text-muted-foreground uppercase mb-1">Confidence</div>
                          <div className="text-primary font-bold">98.4%</div>
                        </div>
                      </div>
                    </div>
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

              {/* Feature 4 - Random */}
              <Link href="/random" className="md:col-span-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-8 md:p-10 overflow-hidden relative group hover:border-primary/50 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Gamepad2 className="w-32 h-32" />
                </div>
                <div className="relative z-10 max-w-md">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                    Instant Decision Playground
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">New</span>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Sometimes you just need to roll the dice. Use our virtual dice, cards, and coin flips for those quick choices that don't need a full AI simulation.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                    Try Playground <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
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

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {/* Free Tier */}
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 className="text-2xl font-semibold mb-2">Free</h3>
                <p className="text-muted-foreground mb-6">Perfect to try out the simulator.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">₹0</span>
                  <span className="text-muted-foreground"></span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['5 full analyses included', 'Standard execution speed', 'Basic domains included'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
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

              {/* Pay per use */}
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 className="text-2xl font-semibold mb-2">Pay per use</h3>
                <p className="text-muted-foreground mb-6">For occasional important choices.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">₹5</span>
                  <span className="text-muted-foreground"> / analysis</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Pay only for what you use', 'Standard execution speed', 'Email support'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
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

              {/* Plus Tier */}
              <div className="bg-card border-2 border-primary/50 rounded-3xl p-8 shadow-md flex flex-col">
                <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  Plus
                </h3>
                <p className="text-muted-foreground mb-6">For regular decision makers.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">₹99</span>
                  <span className="text-muted-foreground"> / 25 analyses</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Everything in Pay per use', 'Save 20% per analysis', 'Priority processing queue'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/login"
                  className="w-full inline-flex items-center justify-center py-3 rounded-xl font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Get Plus
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-card border-2 border-primary rounded-3xl p-8 shadow-xl relative flex flex-col">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  Pro <Sparkles className="w-5 h-5 text-primary shrink-0" />
                </h3>
                <p className="text-muted-foreground mb-6">For professionals and teams.</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-primary">₹349</span>
                  <span className="text-muted-foreground"> / 100 analyses</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Everything in Plus', 'Save 30% per analysis', 'Highest priority queue', 'Advanced AI verbosity controls'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/login"
                  className="w-full inline-flex items-center justify-center py-3 rounded-xl font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Pro
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
            <Image src="/decisely-light.png" alt="Decisely" width={80} height={24} className="h-6 w-auto object-contain dark:hidden" style={{ height: 'auto' }} />
            <Image src="/decisely.png" alt="Decisely" width={80} height={24} className="h-6 w-auto object-contain hidden dark:block" style={{ height: 'auto' }} />
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
