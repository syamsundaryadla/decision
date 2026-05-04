"use client";

import { useAppStore } from "@/lib/store";
import { DOMAIN_LABELS, type Domain } from "@/lib/types";
import {
  Briefcase,
  TrendingUp,
  Heart,
  Building2,
  Plus,
  X,
  ArrowRight,
  CreditCard,
  Zap as ZapIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const DOMAIN_ICON_MAP: Record<Domain, React.ElementType> = {
  career: Briefcase,
  finance: TrendingUp,
  personal: Heart,
  business: Building2,
};

const LOADING_MESSAGES = [
  "Analyzing your decision...",
  "Evaluating risk vs reward...",
  "Comparing outcomes...",
  "Generating recommendations...",
];

export function InputFlow() {
  const {
    scenario,
    domain,
    options,
    parameters,
    error,
    setScenario,
    setDomain,
    addOption,
    removeOption,
    updateOption,
    updateParameter,
    setIsAnalyzing,
    setLoadingMessage,
    setResult,
    setError,
    userAccount,
    setUserAccount,
  } = useAppStore();

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const isValid =
    scenario.trim().length > 10 &&
    domain !== null &&
    options.filter((o) => o.text.trim().length > 0).length >= 2;

  const handleAnalyze = async () => {
    if (!isValid) return;

    if (userAccount.credits < 2.5) {
      setShowUpgradePrompt(true);
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    // Rotate loading messages
    let messageIndex = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2500);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          domain,
          options: options.filter((o) => o.text.trim().length > 0),
          parameters,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server returned an invalid response (${response.status}). This could be a timeout.`);
      }

      if (!response.ok) {
        throw new Error(data?.error || `Analysis failed with status ${response.status}.`);
      }

      // Deduct credit on success
      setUserAccount({ credits: userAccount.credits - 2.5 });
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network error. Please check your connection.";
      setError(message);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-28 md:pb-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          New Decision
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Describe your scenario and let AI analyze the outcomes.
        </p>
      </div>

      {/* Domain Selection */}
      <section>
        <label className="text-sm font-medium text-foreground block mb-3">
          Domain
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {(Object.keys(DOMAIN_LABELS) as Domain[]).map((d) => {
            const Icon = DOMAIN_ICON_MAP[d];
            const isSelected = domain === d;
            return (
              <button
                key={d}
                onClick={() => setDomain(d)}
                id={`domain-${d}`}
                className={cn(
                  "flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all duration-200 min-h-[48px]",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{DOMAIN_LABELS[d]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Scenario Input */}
      <section>
        <label
          htmlFor="scenario-input"
          className="text-sm font-medium text-foreground block mb-3"
        >
          Describe your scenario
        </label>
        <textarea
          id="scenario-input"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="e.g., I'm considering whether to accept a new job offer that pays 30% more but requires relocating to a different city..."
          rows={4}
          className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all duration-200"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Be specific — the more detail you provide, the better the analysis.
        </p>
      </section>

      {/* Options */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            Options to compare
          </label>
          {options.length < 4 && (
            <button
              onClick={addOption}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 min-h-[44px] px-2"
              id="add-option-button"
            >
              <Plus className="w-3.5 h-3.5" />
              Add option
            </button>
          )}
        </div>
        <div className="space-y-2.5">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
              </div>
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(option.id, e.target.value)}
                placeholder={`Option ${index + 1}`}
                id={`option-input-${index}`}
                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all duration-200 min-h-[48px]"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(option.id)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Parameters */}
      {domain && parameters.length > 0 && (
        <section>
          <label className="text-sm font-medium text-foreground block mb-4">
            Your preferences
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {parameters.map((param) => (
              <div
                key={param.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {param.label}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {param.value}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {param.description}
                </p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={param.value}
                  onChange={(e) =>
                    updateParameter(param.id, parseInt(e.target.value))
                  }
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
                  id={`param-${param.id}`}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">Low</span>
                  <span className="text-[10px] text-muted-foreground">High</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Desktop CTA */}
      <div className="hidden md:block">
        <button
          onClick={handleAnalyze}
          disabled={!isValid}
          id="analyze-button-desktop"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-all duration-200",
            isValid
              ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Analyze Decision
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background/80 backdrop-blur-xl border-t border-border p-4 z-40">
        <button
          onClick={handleAnalyze}
          disabled={!isValid}
          id="analyze-button-mobile"
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-all duration-200 min-h-[48px]",
            isValid
              ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Analyze Decision
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center border-b border-border">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ZapIcon className="w-6 h-6 text-warning" />
              </div>
              <h2 className="text-xl font-bold mb-2">Out of Credits!</h2>
              <p className="text-sm text-muted-foreground">
                Each analysis requires 2.5 credits. You currently have {userAccount.credits}.
                Top up your account to continue making confident decisions.
              </p>
            </div>
            
            <div className="p-6 space-y-4 bg-muted/30">
              {/* Pay Per Use */}
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
                onClick={() => setShowUpgradePrompt(false)}
              >
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Pay Per Use
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">One-time analysis (2.5 credits)</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">₹19</span>
                </div>
              </button>

              {/* Pro Plan */}
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left relative overflow-hidden"
                onClick={() => setShowUpgradePrompt(false)}
              >
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Best Value
                </div>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Pro Plan <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-success" /> 25 Credits included
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">₹99</span>
                </div>
              </button>
            </div>
            
            <div className="p-4 border-t border-border flex justify-center bg-card">
              <button 
                onClick={() => setShowUpgradePrompt(false)}
                className="text-sm text-muted-foreground hover:text-foreground font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SparklesIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  )
}
