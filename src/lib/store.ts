import { create } from "zustand";
import type { Domain, DomainParameter, OptionInput, AnalysisResult, DOMAIN_PARAMETERS } from "./types";
import { DOMAIN_PARAMETERS as PARAMS } from "./types";

interface AppState {
  // Input state
  scenario: string;
  domain: Domain | null;
  options: OptionInput[];
  parameters: DomainParameter[];

  // Results state
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  loadingMessage: string;
  error: string | null;

  // View state
  showResults: boolean;

  // Actions
  setScenario: (scenario: string) => void;
  setDomain: (domain: Domain) => void;
  addOption: () => void;
  removeOption: (id: string) => void;
  updateOption: (id: string, text: string) => void;
  updateParameter: (id: string, value: number) => void;
  setResult: (result: AnalysisResult) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setError: (error: string | null) => void;
  setShowResults: (show: boolean) => void;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialOptions: OptionInput[] = [
  { id: generateId(), text: "" },
  { id: generateId(), text: "" },
];

export const useAppStore = create<AppState>((set) => ({
  scenario: "",
  domain: null,
  options: initialOptions,
  parameters: [],
  result: null,
  isAnalyzing: false,
  loadingMessage: "",
  error: null,
  showResults: false,

  setScenario: (scenario) => set({ scenario }),

  setDomain: (domain) =>
    set({
      domain,
      parameters: PARAMS[domain].map((p) => ({ ...p })),
    }),

  addOption: () =>
    set((state) => {
      if (state.options.length >= 4) return state;
      return { options: [...state.options, { id: generateId(), text: "" }] };
    }),

  removeOption: (id) =>
    set((state) => {
      if (state.options.length <= 2) return state;
      return { options: state.options.filter((o) => o.id !== id) };
    }),

  updateOption: (id, text) =>
    set((state) => ({
      options: state.options.map((o) => (o.id === id ? { ...o, text } : o)),
    })),

  updateParameter: (id, value) =>
    set((state) => ({
      parameters: state.parameters.map((p) =>
        p.id === id ? { ...p, value } : p
      ),
    })),

  setResult: (result) => set({ result, showResults: true }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setLoadingMessage: (loadingMessage) => set({ loadingMessage }),
  setError: (error) => set({ error }),
  setShowResults: (show) => set({ showResults: show }),

  reset: () =>
    set({
      scenario: "",
      domain: null,
      options: [
        { id: generateId(), text: "" },
        { id: generateId(), text: "" },
      ],
      parameters: [],
      result: null,
      isAnalyzing: false,
      loadingMessage: "",
      error: null,
      showResults: false,
    }),
}));
