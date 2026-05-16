"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import type { Report } from "@/lib/types";
import { FileText, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { theme } = useTheme();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!reportId) return;

    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("not_found");
          } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to load report.");
          }
          return;
        }
        const data = await res.json();
        setReport(data);
      } catch (err) {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 flex items-center h-16 md:h-20">
            <div className="h-6 md:h-8 w-20 bg-muted rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
          {/* Action bar skeleton */}
          <div className="flex justify-between">
            <div className="h-10 w-32 bg-muted rounded-xl animate-pulse" />
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-muted rounded-xl animate-pulse" />
              <div className="h-10 w-24 bg-muted rounded-xl animate-pulse" />
            </div>
          </div>
          {/* Title skeleton */}
          <div className="text-center space-y-3 py-4">
            <div className="h-10 w-64 bg-muted rounded-xl animate-pulse mx-auto" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto" />
          </div>
          {/* Recommendation card skeleton */}
          <div className="h-40 bg-muted/50 rounded-3xl animate-pulse border border-border" />
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-36 bg-muted/50 rounded-3xl animate-pulse border border-border" />
            <div className="h-36 bg-muted/50 rounded-3xl animate-pulse border border-border" />
          </div>
          {/* Option cards skeleton */}
          <div className="space-y-6 pt-6 border-t border-border/50">
            <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
            <div className="h-72 bg-muted/50 rounded-3xl animate-pulse border border-border" />
            <div className="h-72 bg-muted/50 rounded-3xl animate-pulse border border-border" />
          </div>
        </main>
      </div>
    );
  }

  // 404 state
  if (error === "not_found") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 flex items-center h-16 md:h-20">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              {mounted && (
                <>
                  <Image src="/decisely-light.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain dark:hidden" />
                  <Image src="/decisely.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain hidden dark:block" />
                </>
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md space-y-6">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Report Not Found</h1>
              <p className="text-muted-foreground">
                This report doesn&apos;t exist or may have been removed. Check the URL and try again.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 flex items-center h-16 md:h-20">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              {mounted && (
                <>
                  <Image src="/decisely-light.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain dark:hidden" />
                  <Image src="/decisely.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain hidden dark:block" />
                </>
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md space-y-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Something Went Wrong</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!report) return null;

  // Success — render report with header
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[900px] mx-auto px-4 md:px-6 flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            {mounted && (
              <>
                <Image src="/decisely-light.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain dark:hidden" priority />
                <Image src="/decisely.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain hidden dark:block" priority />
              </>
            )}
          </Link>
          <Link
            href="/dashboard/history"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="w-4 h-4" />
            History
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <ReportView report={report} />
      </main>
    </div>
  );
}
