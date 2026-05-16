import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analysis Report",
  description: "View your AI-powered decision analysis report on Decisely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
