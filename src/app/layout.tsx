import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = "https://decisely.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Decisely — AI-Powered Decision Intelligence",
    template: "%s | Decisely",
  },
  description:
    "Stop relying on gut feelings. Decisely analyzes your choices, simulates outcomes, and calculates risk-to-reward ratios in seconds. Make confident decisions across Career, Finance, Personal, and Business domains.",
  keywords: [
    "decision making tool",
    "AI decision analysis",
    "risk assessment",
    "decision simulator",
    "pros and cons analyzer",
    "Decisely",
    "career decisions",
    "financial decisions",
    "business strategy tool",
  ],
  authors: [{ name: "Risenine Technologies Pvt Ltd" }],
  creator: "Decisely",
  publisher: "Risenine Technologies Pvt Ltd",
  icons: {
    icon: "/decisely.png",
    apple: "/decisely.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Decisely",
    title: "Decisely — AI-Powered Decision Intelligence",
    description:
      "Analyze your choices, simulate outcomes, and make confident decisions backed by data. Free AI decision simulator.",
    images: [
      {
        url: "/decisely.png",
        width: 512,
        height: 512,
        alt: "Decisely — AI Decision Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Decisely — AI-Powered Decision Intelligence",
    description:
      "Analyze your choices, simulate outcomes, and make confident decisions backed by data.",
    images: ["/decisely.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
