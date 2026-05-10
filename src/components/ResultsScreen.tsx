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
  Sparkles,
  Target,
  Download,
  Loader2
} from "lucide-react";
import { useState, useRef } from "react";

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

export function ResultsScreen() {
  const { result, reset, setShowResults } = useAppStore();
  const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  if (!result) return null;

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);

    try {
      // Dynamically import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = pdfRef.current;

      // Temporarily hide the action buttons for the PDF
      const actionButtons = element.querySelector('#action-buttons');
      if (actionButtons) (actionButtons as HTMLElement).style.display = 'none';

      // Resolve CSS custom properties into computed colors for html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        windowWidth: 1200,
        backgroundColor: getComputedStyle(element).backgroundColor || '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Force computed styles on the cloned element so CSS variables resolve
          const clonedEl = clonedDoc.body.querySelector('[data-pdf-root]') || clonedDoc.body;
          clonedEl.querySelectorAll('*').forEach((node) => {
            const el = node as HTMLElement;
            const computed = getComputedStyle(el);
            el.style.color = computed.color;
            el.style.backgroundColor = computed.backgroundColor;
            el.style.borderColor = computed.borderColor;
          });
        },
      });

      // Restore action buttons
      if (actionButtons) (actionButtons as HTMLElement).style.display = 'flex';

      // Generate PDF with proper multi-page support
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10;
      const contentWidth = imgWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = margin;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // First page
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      // Additional pages if content overflows
      while (heightLeft > 0) {
        position = -(pageHeight - margin * 2) * (Math.ceil((imgHeight - heightLeft) / (pageHeight - margin * 2))) + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      pdf.save('decisely-analysis.pdf');
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
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

  const handleNewDecision = () => {
    reset();
  };

  const handleBack = () => {
    setShowResults(false);
  };

  return (
    <div ref={pdfRef} data-pdf-root className="space-y-6 md:space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-background">
      {/* Header Actions */}
      <div id="action-buttons" className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 bg-card hover:bg-muted border border-border px-4 py-2 rounded-xl shadow-sm"
          id="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Inputs
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 text-sm font-medium text-foreground bg-card hover:bg-muted border border-border px-4 py-2 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Save PDF</span>
          </button>
          <button
            onClick={handleNewDecision}
            className="flex items-center gap-2 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-all duration-200 px-4 py-2 rounded-xl shadow-sm shadow-primary/20"
            id="new-decision-button"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">New Decision</span>
          </button>
        </div>
      </div>

      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Analysis <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Complete</span>
        </h1>
        <p className="text-muted-foreground">Based on your parameters and scenario context.</p>
      </div>

      {/* Hero Recommendation Card */}
      <div className="relative overflow-hidden bg-card border-2 border-primary/20 rounded-3xl p-6 md:p-8 shadow-lg shadow-primary/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-1">
                Final Recommendation
              </h2>
              <p className="text-xl md:text-2xl font-semibold text-foreground leading-tight">
                {result.recommendation}
              </p>
            </div>
            
            {result.recommendedOption && (
              <div className="inline-flex items-center gap-2.5 bg-background/50 backdrop-blur border border-border rounded-xl px-4 py-3 shadow-sm">
                <Target className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-foreground">
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
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center border border-info/20">
              <Lightbulb className="w-5 h-5 text-info" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Strategic Insight
            </h3>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {result.insight}
          </p>
        </div>

        {/* Why this works */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20">
              <Sparkles className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Why This Works
            </h3>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {result.whyThisWorks}
          </p>
        </div>
      </div>

      {/* Option Cards */}
      <section className="pt-6 border-t border-border/50">
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          Option Breakdown
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {result.options.map((opt, index) => {
            const isExpanded = expandedOptions.has(index);
            const isRecommended = opt.option === result.recommendedOption;

            return (
              <div
                key={index}
                className={cn(
                  "group relative bg-card border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col",
                  isRecommended
                    ? "border-success/50 shadow-lg shadow-success/5 ring-1 ring-success/20"
                    : "border-border shadow-sm hover:border-primary/30 hover:shadow-md"
                )}
              >
                {/* Recommended Highlight Bar */}
                {isRecommended && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-success to-emerald-400" />
                )}

                <div className="p-5 md:p-8 flex-1">
                  <div className="flex items-start justify-between mb-5 md:mb-6">
                    <div className="flex-1 pr-4">
                      {isRecommended && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 text-success text-[11px] font-bold uppercase tracking-wider mb-3 border border-success/20">
                          <Trophy className="w-3 h-3" /> Best Choice
                        </div>
                      )}
                      <h4 className="text-lg font-bold text-foreground leading-tight">
                        {opt.option}
                      </h4>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 md:mb-8 bg-muted/30 p-4 rounded-2xl border border-border/50">
                    <div>
                      <p className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Success Probability
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-foreground tabular-nums">
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
                    <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4">
                      <div>
                        <p className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk</p>
                        <RiskBadge level={opt.riskLevel} />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Reward</p>
                        <RiskBadge level={opt.rewardLevel} />
                      </div>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-success/5 rounded-2xl p-4 border border-success/10 transition-colors group-hover:bg-success/10">
                      <p className="text-sm font-bold text-success mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Pros
                      </p>
                      <ul className="space-y-3">
                        {opt.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0 shadow-sm" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-destructive/5 rounded-2xl p-4 border border-destructive/10 transition-colors group-hover:bg-destructive/10">
                      <p className="text-sm font-bold text-destructive mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Cons
                      </p>
                      <ul className="space-y-3">
                        {opt.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed">
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
                    className="w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
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
                    <div className="p-6 md:p-8 border-t border-border/50">
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
    </div>
  );
}
