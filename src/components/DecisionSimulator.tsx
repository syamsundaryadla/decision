"use client";

import { useAppStore } from "@/lib/store";
import { InputFlow } from "./InputFlow";
import { ResultsScreen } from "./ResultsScreen";
import { LoadingScreen } from "./LoadingScreen";
import { QuestionnaireView } from "./QuestionnaireView";

export function DecisionSimulator() {
  const { showResults, currentStep, isAnalyzing } = useAppStore();

  if (isAnalyzing) {
    return <LoadingScreen />;
  }

  if (showResults || currentStep === "results") {
    return <ResultsScreen />;
  }

  if (currentStep === "questionnaire") {
    return <QuestionnaireView />;
  }

  return <InputFlow />;
}
