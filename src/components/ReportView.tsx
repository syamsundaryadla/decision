"use client";

import { cn } from "@/lib/utils";
import type { Report } from "@/lib/types";
import {
  Trophy,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Shield,
  Sparkles,
  Target,
  Download,
  Loader2,
  Share2,
  Link2,
  RotateCcw,
  Calendar,
  Tag,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
    <div className={cn("w-full h-2.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    Low: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
    Medium: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
    High: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
  };
  const style = config[level] || config.Medium;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
        style.bg,
        style.text,
        style.border
      )}
    >
      {level}
    </span>
  );
}

export function ReportView({ report }: { report: Report }) {
  const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const { result } = report;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { generateReportPdf } = await import("@/lib/generatePdf");
      await generateReportPdf(report);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    const reportUrl = `${window.location.origin}/report/${report.id}`;
    const shareText = `I analyzed my decision using Decisely AI. Check out the full report:`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Decisely Analysis",
          text: shareText,
          url: reportUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${reportUrl}`);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 3000);
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

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

  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (!result) return null;

  return (
    <div className="space-y-6 md:space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 bg-card hover:bg-muted border border-border px-4 py-2 rounded-xl shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          New Decision
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-medium text-foreground bg-card hover:bg-muted border border-border px-3 sm:px-4 py-2 rounded-xl shadow-sm transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 text-sm font-medium text-foreground bg-card hover:bg-muted border border-border px-3 sm:px-4 py-2 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Meta */}
      <div className="text-center space-y-3 mb-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Analysis <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Complete</span>
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          {report.domain && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-lg text-xs font-semibold capitalize">
              <Tag className="w-3 h-3" />
              {report.domain}
            </span>
          )}
          {formattedDate && (
            <span className="inline-flex items-center gap-1.5 text-xs">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          )}
        </div>
        {report.scenario && (
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2 px-4 line-clamp-2">
            {report.scenario}
          </p>
        )}
      </div>

      {/* Hero Recommendation Card */}
      <div className="relative overflow-hidden bg-card border-2 border-primary/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg shadow-primary/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
          <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase mb-1">
                Final Recommendation
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground leading-tight">
                {result.recommendation}
              </p>
            </div>

            {result.recommendedOption && (
              <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-background/50 backdrop-blur border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  Target Option: <span className="text-success ml-1">{result.recommendedOption}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Insight Card */}
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-info/10 flex items-center justify-center border border-info/20">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Strategic Insight
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.insight}
          </p>
        </div>

        {/* Why this works */}
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Why This Works
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.whyThisWorks}
          </p>
        </div>
      </div>

      {/* Option Cards */}
      <section className="pt-6 border-t border-border/50">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6 flex items-center gap-2">
          Option Breakdown
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:gap-6">
          {result.options.map((opt, index) => {
            const isExpanded = expandedOptions.has(index);
            const isRecommended = opt.option === result.recommendedOption;

            return (
              <div
                key={index}
                className={cn(
                  "group relative bg-card border rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 flex flex-col",
                  isRecommended
                    ? "border-success/50 shadow-lg shadow-success/5 ring-1 ring-success/20"
                    : "border-border shadow-sm hover:border-primary/30 hover:shadow-md"
                )}
              >
                {/* Recommended Highlight Bar */}
                {isRecommended && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-success to-emerald-400" />
                )}

                <div className="p-4 sm:p-5 md:p-8 flex-1">
                  <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6">
                    <div className="flex-1 pr-4 min-w-0">
                      {isRecommended && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 text-success text-[11px] font-bold uppercase tracking-wider mb-3 border border-success/20">
                          <Trophy className="w-3 h-3" /> Best Choice
                        </div>
                      )}
                      <h4 className="text-base sm:text-lg font-bold text-foreground leading-tight break-words">
                        {opt.option}
                      </h4>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8 bg-muted/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50">
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Success Probability
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-lg sm:text-xl font-bold text-foreground tabular-nums">
                          {opt.successProbability}%
                        </span>
                        <ProgressBar
                          className="flex-1 max-w-[100px]"
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
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk</p>
                      <RiskBadge level={opt.riskLevel} />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Reward</p>
                      <RiskBadge level={opt.rewardLevel} />
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-success/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-success/10 transition-colors group-hover:bg-success/10">
                      <p className="text-sm font-bold text-success mb-2 sm:mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Pros
                      </p>
                      <ul className="space-y-2 sm:space-y-3">
                        {opt.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-foreground/80 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0 shadow-sm" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-destructive/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-destructive/10 transition-colors group-hover:bg-destructive/10">
                      <p className="text-sm font-bold text-destructive mb-2 sm:mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Cons
                      </p>
                      <ul className="space-y-2 sm:space-y-3">
                        {opt.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-foreground/80 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0 shadow-sm" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Expandable Action */}
                <div className="border-t border-border mt-auto">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    {isExpanded ? (
                      <>Hide Deep Analysis <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Read Deep Analysis <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out bg-muted/20",
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="p-4 sm:p-6 md:p-8 border-t border-border/50">
                      <h5 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" /> Evaluation
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {opt.detailedAnalysis}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Share toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl text-sm font-medium bg-foreground text-background animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Report link copied to clipboard!
        </div>
      )}
    </div>
  );
}
