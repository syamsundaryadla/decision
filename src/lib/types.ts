export type Domain = "career" | "finance" | "personal" | "business";

export interface DomainParameter {
  id: string;
  label: string;
  description: string;
  value: number; // 0-100
}

export const DOMAIN_PARAMETERS: Record<Domain, DomainParameter[]> = {
  career: [
    { id: "risk_tolerance", label: "Risk Tolerance", description: "How much risk can you handle?", value: 50 },
    { id: "growth_vs_stability", label: "Growth vs Stability", description: "Prefer growth or stability?", value: 50 },
    { id: "work_life_balance", label: "Work-Life Balance", description: "How important is work-life balance?", value: 50 },
  ],
  finance: [
    { id: "risk_tolerance", label: "Risk Tolerance", description: "How much financial risk can you take?", value: 50 },
    { id: "time_horizon", label: "Time Horizon", description: "Short-term vs long-term outlook?", value: 50 },
    { id: "liquidity_needs", label: "Liquidity Needs", description: "How quickly might you need access to funds?", value: 50 },
  ],
  personal: [
    { id: "emotional_impact", label: "Emotional Impact", description: "How emotionally significant is this?", value: 50 },
    { id: "reversibility", label: "Reversibility", description: "Can this decision be reversed?", value: 50 },
    { id: "time_horizon", label: "Time Horizon", description: "Short-term vs long-term impact?", value: 50 },
  ],
  business: [
    { id: "financial_pressure", label: "Financial Pressure", description: "Current financial constraints?", value: 50 },
    { id: "strategic_impact", label: "Strategic Impact", description: "How strategic is this decision?", value: 50 },
    { id: "execution_complexity", label: "Execution Complexity", description: "How complex to execute?", value: 50 },
  ],
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  career: "Career",
  finance: "Finance",
  personal: "Personal",
  business: "Business",
};

export const DOMAIN_ICONS: Record<Domain, string> = {
  career: "Briefcase",
  finance: "TrendingUp",
  personal: "Heart",
  business: "Building2",
};

export interface OptionInput {
  id: string;
  text: string;
}

export interface AnalysisOptionResult {
  option: string;
  successProbability: number;
  riskLevel: string;
  rewardLevel: string;
  pros: string[];
  cons: string[];
  detailedAnalysis: string;
}

export interface AnalysisResult {
  recommendation: string;
  recommendedOption: string;
  insight: string;
  whyThisWorks: string;
  options: AnalysisOptionResult[];
}

export interface Report {
  id: string;
  userId: string;
  scenario: string;
  domain: Domain;
  options: { text: string }[];
  parameters: DomainParameter[];
  result: AnalysisResult;
  createdAt: string | null; // ISO string after serialization
}

export interface DecisionQuestion {
  id: string;
  text: string;
  options: string[]; // up to 4 options
}

export interface UserAnswer {
  questionId: string;
  questionText: string;
  answer: string;
}

export interface UserAccount {
  email?: string;
  role?: "user" | "admin" | "super_admin";
  isSuspended?: boolean;
  isNewUser?: boolean;
  credits: number;
  subscriptionStatus: "free" | "pro" | "enterprise";
  lastBilled?: string;
  settings: {
    emailNotifications: boolean;
    aiVerbosity: "concise" | "detailed";
  };
  createdAt?: string | Date;
}

export interface CreditTransaction {
  id?: string;
  userId: string;
  amount: number; // positive or negative
  type: "grant" | "usage" | "admin_adjustment" | "purchase";
  description: string;
  createdAt: any; // Firestore Timestamp
}

export interface DailyStats {
  id?: string; // e.g. "2026-05-10"
  date: string;
  totalRequests: number;
  failedRequests: number;
  freeCreditsUsed: number;
  paidCreditsUsed: number;
  newUsers: number;
}

export interface ErrorLog {
  id?: string;
  userId: string;
  error: string;
  endpoint: string;
  createdAt: any;
}
