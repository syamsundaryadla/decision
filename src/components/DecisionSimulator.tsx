"use client";

import { useAppStore } from "@/lib/store";
import { InputFlow } from "./InputFlow";
import { ResultsScreen } from "./ResultsScreen";
import { LoadingScreen } from "./LoadingScreen";

export function DecisionSimulator() {
  const { showResults, isAnalyzing } = useAppStore();

  if (isAnalyzing) {
    return <LoadingScreen />;
  }

  if (showResults) {
    return <ResultsScreen />;
  }

  return <InputFlow />;
}
