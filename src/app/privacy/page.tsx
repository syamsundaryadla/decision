"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </header>

          <section className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly to us when you create an account, use our decision simulator, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Account information (name, email, profile picture)</li>
                <li>Decision scenarios and parameters you input into the simulator</li>
                <li>Payment information (processed securely via Razorpay)</li>
                <li>Communication preferences</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze trends and usage to enhance user experience</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">3. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All decision data is processed using industry-standard encryption, and payment data is handled exclusively by our secure payment provider, Razorpay.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We store the information we collect for as long as is necessary for the purpose for which we originally collected it. You may request to delete your account and associated data at any time through your profile settings or by contacting support.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at support@risenine.tech.
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
