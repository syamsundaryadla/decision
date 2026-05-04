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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isValid =
    scenario.trim().length > 10 &&
    domain !== null &&
    options.filter((o) => o.text.trim().length > 0).length >= 2;

  const handleAnalyze = async () => {
    if (!isValid) return;

    if (userAccount.credits <= 0) {
      setError("You've run out of credits. Please top up in your profile.");
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
      setUserAccount({ credits: userAccount.credits - 1 });
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
    </div>
  );
}
