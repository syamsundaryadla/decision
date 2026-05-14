"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12 px-6 md:py-24">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <header className="space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </header>

          <section className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Decisely, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Decisely provides an AI-powered decision simulation and analysis tool. The insights provided are for informational purposes only and do not constitute professional advice (financial, legal, or otherwise).
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">3. Credits and Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some features of Decisely require credits. Credits can be purchased through our secure payment provider. All sales are final, and credits are non-refundable except as required by law.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">4. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to use the service only for lawful purposes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Risenine Technologies Pvt Ltd and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will provide notice of any significant changes by updating the "Last updated" date at the top of these terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
