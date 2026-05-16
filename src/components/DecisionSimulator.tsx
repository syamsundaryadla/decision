"use client";

import { useAppStore } from "@/lib/store";
import { InputFlow } from "./InputFlow";
import { ResultsScreen } from "./ResultsScreen";
import { LoadingScreen } from "./LoadingScreen";
import { QuestionnaireView } from "./QuestionnaireView";

export function DecisionSimulator() {
  const showResults = useAppStore((state) => state.showResults);
  const currentStep = useAppStore((state) => state.currentStep);
  const isAnalyzing = useAppStore((state) => state.isAnalyzing);

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
