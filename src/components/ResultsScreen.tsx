"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Trophy,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

function ProgressBar({
  value,
  className,
  color = "bg-primary",
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  return (
    <div className={cn("w-full h-2 bg-muted rounded-full overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    Low: { bg: "bg-success/10", text: "text-success" },
    Medium: { bg: "bg-warning/10", text: "text-warning" },
    High: { bg: "bg-destructive/10", text: "text-destructive" },
  };
  const style = config[level] || config.Medium;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
        style.bg,
        style.text
      )}
    >
      {level}
    </span>
  );
}

export function ResultsScreen() {
  const { result, reset, setShowResults } = useAppStore();
  const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set());

  if (!result) return null;

  const toggleExpand = (index: number) => {
    setExpandedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleNewDecision = () => {
    reset();
  };

  const handleBack = () => {
    setShowResults(false);
  };

  return (
    <div className="space-y-5 md:space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 min-h-[44px] px-1"
          id="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to inputs
        </button>
        <button
          onClick={handleNewDecision}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80 transition-opacity duration-200 min-h-[44px] px-2"
          id="new-decision-button"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New decision
        </button>
      </div>

      {/* Recommendation card */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recommendation
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI-powered analysis result
            </p>
          </div>
        </div>
        <p className="text-sm text-foreground leading-relaxed mb-4">
          {result.recommendation}
        </p>
        {result.recommendedOption && (
          <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-lg px-3 py-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {result.recommendedOption}
          </div>
        )}
      </div>

      {/* Insight card */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
            <Lightbulb className="w-4.5 h-4.5 text-info" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Key Insight
            </h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.insight}
        </p>
      </div>

      {/* Why this works */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Why This Works
            </h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {result.whyThisWorks}
        </p>
      </div>

      {/* Option cards */}
      <section>
        <h3 className="text-base font-semibold text-foreground mb-4">
          Option Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.options.map((opt, index) => {
            const isExpanded = expandedOptions.has(index);
            const isRecommended = opt.option === result.recommendedOption;

            return (
              <div
                key={index}
                className={cn(
                  "bg-card border rounded-2xl overflow-hidden transition-all duration-200",
                  isRecommended
                    ? "border-success/40 shadow-sm"
                    : "border-border"
                )}
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        {isRecommended && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded-md">
                            Recommended
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-foreground leading-snug">
                        {opt.option}
                      </h4>
                    </div>
                  </div>

                  {/* Success probability */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        Success Probability
                      </span>
                      <span className="text-xs font-semibold text-foreground tabular-nums">
                        {opt.successProbability}%
                      </span>
                    </div>
                    <ProgressBar
                      value={opt.successProbability}
                      color={
                        opt.successProbability >= 70
                          ? "bg-success"
                          : opt.successProbability >= 40
                          ? "bg-warning"
                          : "bg-destructive"
                      }
                    />
                  </div>

                  {/* Risk & Reward badges */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Risk:</span>
                      <RiskBadge level={opt.riskLevel} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Reward:</span>
                      <RiskBadge level={opt.rewardLevel} />
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-xs font-medium text-success mb-2">Pros</p>
                      <ul className="space-y-1.5">
                        {opt.pros.map((pro, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-destructive mb-2">Cons</p>
                      <ul className="space-y-1.5">
                        {opt.cons.map((con, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-xs text-muted-foreground"
                          >
                            <XCircle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Expandable section */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 min-h-[44px]"
                  id={`expand-option-${index}`}
                >
                  {isExpanded ? (
                    <>
                      Hide details <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Show details <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <h5 className="text-xs font-semibold text-foreground mb-2">
                      Detailed Analysis
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {opt.detailedAnalysis}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
