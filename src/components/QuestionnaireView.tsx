"use client";

import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { BrainCircuit, Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";

const LOADING_MESSAGES = [
  "Synthesizing your context...",
  "Running risk assessments...",
  "Evaluating second-order effects...",
  "Finalizing recommendations...",
];

export function QuestionnaireView() {
  const {
    scenario,
    domain,
    options,
    parameters,
    questions,
    answers,
    setAnswers,
    setResult,
    setCurrentStep,
    userAccount,
    setUserAccount,
    setError,
    setIsAnalyzing,
    setLoadingMessage,
    isAnalyzing
  } = useAppStore();

  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (optionText: string) => {
    setSelectedOption(optionText);
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const newAnswers = {
      ...localAnswers,
      [currentQuestion.id]: selectedOption,
    };
    setLocalAnswers(newAnswers);
    setSelectedOption(null);

    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all questions! Trigger final analysis
      const finalAnswersList = questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        answer: newAnswers[q.id],
      }));
      setAnswers(finalAnswersList);
      
      await runFinalAnalysis(finalAnswersList);
    }
  };

  const runFinalAnalysis = async (finalAnswersList: any[]) => {
    setError(null);
    setIsAnalyzing(true);

    let messageIndex = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2500);

    try {
      // Get the current user's ID token for server-side auth verification
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Please sign in to use the analysis feature.");
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          mode: "final-analysis",
          scenario,
          domain,
          options: options.filter((o) => o.text.trim().length > 0),
          parameters,
          answers: finalAnswersList,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server returned an invalid response (${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(data?.error || `Analysis failed with status ${response.status}.`);
      }

      // Success
      setUserAccount({ credits: userAccount.credits - 1 });
      setResult(data);
      setCurrentStep("results"); // Move to results view

      // Auto-save to Firestore
      if (user?.uid) {
        try {
          await addDoc(collection(db, "reports"), {
            userId: user.uid,
            scenario,
            domain,
            parameters,
            options: options.filter((o) => o.text.trim().length > 0),
            result: data,
            createdAt: serverTimestamp(),
          });
        } catch (saveErr) {
          console.error("Failed to save report to history:", saveErr);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network error. Please check your connection.";
      setError(message);
      setCurrentStep("input"); // Go back to input if failed so they can retry
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return null; // The parent DecisionSimulator handles showing the loading state
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BrainCircuit className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Let's dig a little deeper.
        </h2>
        <p className="text-muted-foreground">
          I need to clarify a few things before providing my final recommendation.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          {/* Progress bar */}
          <div className="flex gap-1.5">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentIndex
                    ? "w-6 bg-primary"
                    : idx < currentIndex
                    ? "w-2 bg-primary/40"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-8 leading-tight">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelectOption(opt)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <span className={cn(
                  "font-medium",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {opt}
                </span>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastQuestion ? "Analyze Decision" : "Next Question"}
            {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
