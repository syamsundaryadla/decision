"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ChevronRight, FileText, Loader2, ArrowLeft, AlertCircle, RefreshCw, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AnalysisResult, OptionInput, DomainParameter } from "@/lib/types";

interface HistoryDoc {
  id: string;
  scenario: string;
  domain: string;
  options: OptionInput[];
  parameters: DomainParameter[];
  result: AnalysisResult;
  createdAt: any;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<HistoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.uid) return;
      setError(null);
      try {
        const q = query(
          collection(db, "reports"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HistoryDoc[];
        setReports(docs);
      } catch (err: any) {
        console.error("Failed to fetch history:", err);
        // Common Firestore index error
        if (err?.code === "failed-precondition" || err?.message?.includes("index")) {
          setError("Database index is being built. This usually takes a few minutes. Please try again shortly.");
        } else {
          setError("Failed to load report history. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchHistory();
      }
    }
  }, [user, authLoading, router]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the effect
    window.location.reload();
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" /> Report History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Review your past decisions and AI analyses.</p>
          </div>
        </div>
        {/* Loading skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-card border border-border rounded-2xl animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-16 bg-muted rounded-md" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="h-5 w-3/4 bg-muted rounded mb-2" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> Report History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Review your past decisions and AI analyses.</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-16 bg-card border border-border rounded-3xl">
          <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load History</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 px-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!error && reports.length === 0 && (
        <div className="text-center py-20 bg-card border border-border rounded-3xl">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No reports yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Run an analysis from the dashboard to see your history here.
          </p>
          <Link href="/dashboard" className="inline-block mt-6 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity">
            Create Decision
          </Link>
        </div>
      )}

      {/* Reports list */}
      {!error && reports.length > 0 && (
        <div className="grid gap-4">
          {reports.map((report) => {
            const bestOption = report.result?.recommendedOption;
            const bestProb = report.result?.options?.find(o => o.option === bestOption)?.successProbability;

            return (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-card border border-border hover:border-primary/30 hover:shadow-md rounded-2xl transition-all text-left gap-3 sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground capitalize">
                      {report.domain}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {report.createdAt?.toDate
                        ? new Date(report.createdAt.toDate()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1 text-sm sm:text-base">
                    {report.scenario}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 min-w-0">
                      <Trophy className="w-3.5 h-3.5 text-success flex-shrink-0" />
                      <span className="truncate">{bestOption || "—"}</span>
                    </p>
                    {bestProb !== undefined && (
                      <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-md flex-shrink-0">
                        {bestProb}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary font-medium text-sm sm:pl-4 sm:border-l border-border group-hover:translate-x-1 transition-transform flex-shrink-0">
                  View Report <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
