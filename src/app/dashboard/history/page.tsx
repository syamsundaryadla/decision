"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Clock, ChevronRight, FileText, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AnalysisResult, OptionInput, DomainParameter } from "@/lib/types";

// Add a type for the document since types.ts doesn't have the firestore doc structure
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
  
  const { setResult, setCurrentStep } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.uid) return;
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
      } catch (error) {
        console.error("Failed to fetch history:", error);
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

  const handleOpenReport = (report: HistoryDoc) => {
    // We only need to restore the result to view the history
    setResult(report.result);
    setCurrentStep("results");
    router.push("/dashboard"); // ResultsScreen mounts in the dashboard
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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

      {reports.length === 0 ? (
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
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => handleOpenReport(report)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-border hover:border-primary/30 hover:shadow-md rounded-2xl transition-all text-left gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground capitalize">
                    {report.domain}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground truncate">
                  {report.scenario}
                </h3>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  Winner: {report.result.recommendedOption}
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium text-sm sm:pl-4 sm:border-l border-border group-hover:translate-x-1 transition-transform">
                View Report <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
