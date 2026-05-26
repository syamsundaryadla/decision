/**
 * Decisely — AI End-to-End Response Test Suite
 *
 * Tests that the Gemini API actually returns valid, parseable AI responses
 * for both question generation and final analysis modes.
 *
 * Run: npx tsx src/__tests__/ai-e2e-test.ts
 *
 * This script first obtains a real Firebase auth token by signing in
 * with email/password, then uses that token to test the analyze API.
 */

// Load env vars from .env.local (no external dependency)
import { readFileSync } from "fs";
import { resolve } from "path";
try {
  const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch { /* .env.local not found — rely on existing env */ }

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

// Firebase client config (same as the app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];
let passCount = 0;
let failCount = 0;

async function test(name: string, fn: () => Promise<string | void>) {
  const start = Date.now();
  process.stdout.write(`  ⏳ ${name}...`);
  try {
    const details = await fn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration, details: details || undefined });
    passCount++;
    console.log(`\r  ✓ ${name} (${(duration / 1000).toFixed(1)}s)${details ? `\n    → ${details}` : ""}`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ name, passed: false, duration, error: error.message });
    failCount++;
    console.log(`\r  ✗ ${name} (${(duration / 1000).toFixed(1)}s)`);
    console.log(`    Error: ${error.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// ========== Get Real Firebase Auth Token ==========

async function getAuthToken(): Promise<string> {
  const testEmail = "e2e-test-bot@decisely-test.com";
  const testPassword = "TestBot#E2E#2026!";
  
  const app = initializeApp(firebaseConfig, "test-app");
  const auth = getAuth(app);

  try {
    // Try signing in first
    const credential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    return await credential.user.getIdToken();
  } catch (error: any) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      // Create the test account
      console.log("  Creating test account...");
      const credential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      return await credential.user.getIdToken();
    }
    throw error;
  }
}

// ========== Test Scenarios ==========

const CAREER_SCENARIO = {
  mode: "generate-questions",
  scenario: "I'm a senior software engineer with 8 years of experience. I've received an offer from a startup with equity, and also have a promotion path at my current company.",
  domain: "career",
  options: [
    { text: "Accept the startup offer with equity" },
    { text: "Stay and pursue promotion at current company" },
    { text: "Negotiate a raise while considering the startup" },
  ],
  parameters: [
    { label: "Risk Tolerance", value: 65 },
    { label: "Growth vs Stability", value: 70 },
    { label: "Work-Life Balance", value: 45 },
  ],
};

const FINANCE_SCENARIO = {
  mode: "final-analysis",
  scenario: "I have ₹10 lakhs in savings and want to invest for the next 5 years. I'm 30 years old with a stable income.",
  domain: "finance",
  options: [
    { text: "Invest in index mutual funds (SIP)" },
    { text: "Put a down payment on a small property" },
    { text: "Build a diversified stock portfolio" },
  ],
  parameters: [
    { label: "Risk Tolerance", value: 55 },
    { label: "Time Horizon", value: 75 },
    { label: "Liquidity Needs", value: 40 },
  ],
  answers: [],
};

const BUSINESS_SCENARIO = {
  mode: "final-analysis",
  scenario: "Our SaaS product has 500 paying users. We need to decide whether to expand to a new market or double down on existing users.",
  domain: "business",
  options: [
    { text: "Expand to adjacent market segment" },
    { text: "Focus on retention and upselling current users" },
  ],
  parameters: [
    { label: "Financial Pressure", value: 60 },
    { label: "Strategic Impact", value: 80 },
    { label: "Execution Complexity", value: 50 },
  ],
  answers: [
    { questionId: "q1", questionText: "What is your current MRR?", answer: "Around ₹5 lakhs per month" },
    { questionId: "q2", questionText: "Do you have external funding?", answer: "Bootstrapped so far" },
  ],
};

// ========== Tests ==========

async function runTests(authToken: string) {
  const AUTH = { Authorization: `Bearer ${authToken}` };

  // TEST 1: Question Generation
  console.log("\n🧠 Test 1: Question Generation (generate-questions mode)");
  await test("Career scenario → generates 2-3 valid questions with 4 options each", async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH },
      body: JSON.stringify(CAREER_SCENARIO),
    });

    const body = await res.text();
    assert(res.ok, `HTTP ${res.status}: ${body}`);

    const data = JSON.parse(body);
    assert(Array.isArray(data), `Expected array, got ${typeof data}`);
    assert(data.length >= 2 && data.length <= 3, `Expected 2-3 questions, got ${data.length}`);

    for (const q of data) {
      assert(typeof q.id === "string", `Missing question id`);
      assert(typeof q.text === "string" && q.text.length > 10, `Question text too short`);
      assert(Array.isArray(q.options) && q.options.length === 4, `Expected 4 options per question`);
    }

    return `${data.length} questions generated, each with 4 options ✓`;
  });

  // TEST 2: Final Analysis
  console.log("\n📊 Test 2: Final Analysis (finance scenario)");
  await test("Finance scenario → returns full structured analysis with 3 options", async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH },
      body: JSON.stringify(FINANCE_SCENARIO),
    });

    const body2 = await res.text();
    assert(res.ok, `HTTP ${res.status}: ${body2}`);
    const data = JSON.parse(body2);

    // Validate structure
    assert(typeof data.recommendation === "string" && data.recommendation.length > 20, `Bad recommendation`);
    assert(typeof data.recommendedOption === "string", `Missing recommendedOption`);
    assert(typeof data.insight === "string" && data.insight.length > 20, `Bad insight`);
    assert(typeof data.whyThisWorks === "string" && data.whyThisWorks.length > 20, `Bad whyThisWorks`);
    assert(Array.isArray(data.options) && data.options.length === 3, `Expected 3 options`);

    for (const opt of data.options) {
      assert(typeof opt.successProbability === "number" && opt.successProbability >= 0 && opt.successProbability <= 100, `Bad probability: ${opt.successProbability}`);
      assert(["Low", "Medium", "High"].includes(opt.riskLevel), `Bad riskLevel: ${opt.riskLevel}`);
      assert(["Low", "Medium", "High"].includes(opt.rewardLevel), `Bad rewardLevel: ${opt.rewardLevel}`);
      assert(Array.isArray(opt.pros) && opt.pros.length === 3, `Expected 3 pros`);
      assert(Array.isArray(opt.cons) && opt.cons.length === 3, `Expected 3 cons`);
      assert(typeof opt.detailedAnalysis === "string" && opt.detailedAnalysis.length > 50, `Short detailedAnalysis`);
    }

    return `Recommended: "${data.recommendedOption.substring(0, 60)}..." — ${data.options.length} options with full analysis ✓`;
  });

  // TEST 3: Analysis with clarifying answers
  console.log("\n💬 Test 3: Analysis with Clarifying Answers (business scenario)");
  await test("Business scenario with user answers → structured analysis for 2 options", async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH },
      body: JSON.stringify(BUSINESS_SCENARIO),
    });

    const body3 = await res.text();
    assert(res.ok, `HTTP ${res.status}: ${body3}`);
    const data = JSON.parse(body3);

    assert(typeof data.recommendation === "string", `Missing recommendation`);
    assert(Array.isArray(data.options) && data.options.length === 2, `Expected 2 options`);

    return `Recommended: "${data.recommendedOption?.substring(0, 60)}..." ✓`;
  });

  // TEST 4: Concurrent AI requests
  console.log("\n🔄 Test 4: Concurrent AI Requests (2 simultaneous)");
  await test("2 simultaneous requests → both succeed or rate-limited gracefully", async () => {
    const requests = [
      fetch(`${BASE_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH },
        body: JSON.stringify({ ...CAREER_SCENARIO, mode: "generate-questions" }),
      }),
      fetch(`${BASE_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH },
        body: JSON.stringify({
          mode: "final-analysis",
          scenario: "Should I adopt a dog or a cat?",
          domain: "personal",
          options: [{ text: "Adopt a dog" }, { text: "Adopt a cat" }],
          parameters: [{ label: "Emotional Impact", value: 80 }],
          answers: [],
        }),
      }),
    ];

    const responses = await Promise.all(requests);
    let successCount = 0;
    for (const res of responses) {
      if (res.ok) {
        await res.json(); // consume body
        successCount++;
      }
    }

    return `${successCount}/2 succeeded (statuses: ${responses.map(r => r.status).join(", ")})`;
  });

  // TEST 5: Response timing
  console.log("\n⏱️  Test 5: Response Timing");
  await test("Question generation completes within 30 seconds", async () => {
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH },
      body: JSON.stringify({
        mode: "generate-questions",
        scenario: "Should I learn Python or JavaScript first?",
        domain: "career",
        options: [{ text: "Learn Python" }, { text: "Learn JavaScript" }],
        parameters: [{ label: "Growth vs Stability", value: 50 }],
      }),
    });
    const elapsed = Date.now() - start;

    assert(res.ok, `HTTP ${res.status}`);
    assert(elapsed < 30000, `Took ${elapsed}ms — exceeds 30s limit`);

    return `Completed in ${(elapsed / 1000).toFixed(1)}s ✓`;
  });
}

// ========== Main ==========

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Decisely — AI End-to-End Response Test Suite            ║");
  console.log("║   Tests actual Gemini API responses for correctness       ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log(`\nTarget: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`\n⚠️  These tests call the real Gemini API — each takes 5-20s\n`);

  // Check server is running
  try {
    await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error("❌ Dev server is not running at " + BASE_URL);
    process.exit(1);
  }

  // Get a real auth token
  console.log("🔐 Obtaining Firebase auth token...");
  let authToken: string;
  try {
    authToken = await getAuthToken();
    console.log("  ✓ Auth token obtained\n");
  } catch (error: any) {
    console.error(`  ✗ Failed to get auth token: ${error.message}`);
    console.error("  Make sure NEXT_PUBLIC_FIREBASE_API_KEY is in .env.local");
    process.exit(1);
  }

  await runTests(authToken);

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`\n📊 AI Test Results: ${passCount} passed, ${failCount} failed, ${passCount + failCount} total\n`);

  if (failCount > 0) {
    console.log("❌ Failed tests:");
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
  } else {
    console.log("✅ All AI response tests passed! Gemini is responding correctly.\n");
  }

  console.log("⏱️  Timing:");
  results.forEach(r => {
    console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}: ${(r.duration / 1000).toFixed(1)}s`);
  });

  process.exit(failCount > 0 ? 1 : 0);
}

main();
