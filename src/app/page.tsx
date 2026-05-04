import Link from "next/link";
import { Sparkles, ArrowRight, BrainCircuit, Target, Zap, ShieldCheck, BarChart3, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle"; // I need to create this or handle it here. I'll just use the button from the old page for now, or just leave it for the login page and keep landing page static or simple. Actually I will create a ThemeToggle component or just put it in the header.

// Let's create a Client Component wrapper for the theme toggle, or just make the whole landing page a client component for simplicity, but a server component is better for SEO. Let's stick to a Server Component for the landing page where possible, and import a client component for the header.

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden selection:bg-primary/20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">DecisionSimulator</span>
          </div>
          <div className="flex items-center gap-4">
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
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          {/* Background glow effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl -z-10" />
          
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm text-muted-foreground mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Powered by Gemini 2.0 Flash</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 max-w-4xl mx-auto leading-[1.1]">
              Make confident decisions with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">AI precision.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop second-guessing. Simulate outcomes, evaluate risks, and get actionable insights for your career, business, and personal life in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Start Simulating
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-lg border border-border hover:bg-muted/50 transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything you need to decide.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Our AI analyzes your scenario against multiple parameters to provide a comprehensive breakdown of your options.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BrainCircuit,
                  title: "Deep Analysis",
                  description: "Evaluates emotional, financial, and strategic impacts automatically based on your specific context."
                },
                {
                  icon: BarChart3,
                  title: "Risk vs Reward",
                  description: "Get clear probabilities for success and structured pros/cons for every option you're considering."
                },
                {
                  icon: Target,
                  title: "Domain Specific",
                  description: "Tailored parameters for Career, Finance, Business, and Personal domains ensure relevant insights."
                },
                {
                  icon: Clock,
                  title: "Instant Clarity",
                  description: "Transform hours of agonizing over a choice into seconds of clear, data-driven perspective."
                },
                {
                  icon: Zap,
                  title: "Dynamic Parameters",
                  description: "Adjust sliders for risk tolerance, time horizons, and more to see how outcomes shift."
                },
                {
                  icon: ShieldCheck,
                  title: "Unbiased Perspective",
                  description: "Remove emotional blindspots with an objective AI that looks purely at the variables you provide."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-background rounded-3xl p-8 border border-border/50 hover:border-border transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to make better choices?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of users who have stopped guessing and started deciding with confidence.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold text-foreground">DecisionSimulator</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
