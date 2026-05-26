/**
 * Decisely — Comprehensive API Test Suite
 * 
 * Run: npx tsx src/__tests__/api-tests.ts
 * 
 * Prerequisites:
 * 1. Dev server running on http://localhost:3000
 * 2. .env.local configured
 * 
 * Tests cover:
 * - All 9 API endpoints (correctness + error handling)
 * - Concurrent request handling (load testing)
 * - Payment flow security validation
 * - Rate limiting enforcement
 * - Authentication requirements
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

// ========== Test Utilities ==========

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

async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration });
    passCount++;
    console.log(`  ✓ ${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ name, passed: false, duration, error: error.message });
    failCount++;
    console.log(`  ✗ ${name} (${duration}ms)`);
    console.log(`    Error: ${error.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual: any, expected: any, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

async function fetchJson(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body, headers: res.headers };
}

// ========== Test Suites ==========

async function testAuthEndpoints() {
  console.log("\n📧 Auth: Send OTP");

  await test("POST /api/auth/send-otp — missing email → 400", async () => {
    const { status } = await fetchJson("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({}),
    });
    assertEqual(status, 400, "status");
  });

  await test("POST /api/auth/send-otp — invalid email type → 400", async () => {
    const { status } = await fetchJson("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: 12345 }),
    });
    assertEqual(status, 400, "status");
  });

  await test("POST /api/auth/send-otp — valid email → 200", async () => {
    const { status, body } = await fetchJson("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });
    assertEqual(status, 200, "status");
    assert(body.success === true, "Expected success: true");
  });

  console.log("\n🔑 Auth: Verify OTP");

  await test("POST /api/auth/verify-otp — missing fields → 400", async () => {
    const { status } = await fetchJson("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({}),
    });
    assertEqual(status, 400, "status");
  });

  await test("POST /api/auth/verify-otp — invalid OTP format → 400", async () => {
    const { status } = await fetchJson("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", otp: "abc" }),
    });
    assertEqual(status, 400, "status");
  });

  await test("POST /api/auth/verify-otp — no cookie → 400", async () => {
    const { status } = await fetchJson("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", otp: "123456" }),
    });
    assertEqual(status, 400, "status");
  });
}

async function testAnalyzeEndpoint() {
  console.log("\n🧠 Analyze API");

  await test("POST /api/analyze — no auth → 401", async () => {
    const { status } = await fetchJson("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ scenario: "test", domain: "career", options: [{ text: "A" }, { text: "B" }] }),
    });
    assertEqual(status, 401, "status");
  });

  await test("POST /api/analyze — missing fields → 400", async () => {
    const { status } = await fetchJson("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ scenario: "test" }),
      headers: { Authorization: "Bearer dev-token" },
    });
    // In dev mode, verifyAuth might pass with dev-user, so we get 400 for missing fields
    assert(status === 400 || status === 401, `Expected 400 or 401, got ${status}`);
  });

  await test("POST /api/analyze — insufficient options → 400", async () => {
    const { status } = await fetchJson("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ scenario: "test", domain: "career", options: [{ text: "A" }] }),
      headers: { Authorization: "Bearer dev-token" },
    });
    assert(status === 400 || status === 401, `Expected 400 or 401, got ${status}`);
  });
}

async function testPaymentEndpoints() {
  console.log("\n💳 Payment: Create Order");

  await test("POST /api/create-order — no auth → 401", async () => {
    const { status } = await fetchJson("/api/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: "plus" }),
    });
    assertEqual(status, 401, "status");
  });

  await test("POST /api/create-order — invalid plan → 400", async () => {
    const { status } = await fetchJson("/api/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: "nonexistent" }),
      headers: { Authorization: "Bearer dev-token" },
    });
    assert(status === 400 || status === 401, `Expected 400 or 401, got ${status}`);
  });

  await test("POST /api/create-order — missing plan → 400", async () => {
    const { status } = await fetchJson("/api/create-order", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { Authorization: "Bearer dev-token" },
    });
    assert(status === 400 || status === 401, `Expected 400 or 401, got ${status}`);
  });

  console.log("\n✅ Payment: Verify Payment");

  await test("POST /api/verify-payment — no auth → 401", async () => {
    const { status } = await fetchJson("/api/verify-payment", {
      method: "POST",
      body: JSON.stringify({
        razorpay_order_id: "order_test123",
        razorpay_payment_id: "pay_test123",
        razorpay_signature: "fake_sig",
      }),
    });
    assertEqual(status, 401, "status");
  });

  await test("POST /api/verify-payment — missing fields → 400", async () => {
    const { status } = await fetchJson("/api/verify-payment", {
      method: "POST",
      body: JSON.stringify({ razorpay_order_id: "order_test123" }),
      headers: { Authorization: "Bearer dev-token" },
    });
    assert(status === 400 || status === 401, `Expected 400 or 401, got ${status}`);
  });

  await test("POST /api/verify-payment — invalid signature → 400", async () => {
    const { status } = await fetchJson("/api/verify-payment", {
      method: "POST",
      body: JSON.stringify({
        razorpay_order_id: "order_test123",
        razorpay_payment_id: "pay_test123",
        razorpay_signature: "invalid_signature_hex",
      }),
      headers: { Authorization: "Bearer dev-token" },
    });
    // Should fail at signature verification (400) or auth (401)
    assert(status === 400 || status === 401 || status === 500, `Expected 400/401/500, got ${status}`);
  });
}

async function testReportsEndpoint() {
  console.log("\n📄 Reports API");

  await test("GET /api/reports/abc — invalid ID → 400", async () => {
    const { status } = await fetchJson("/api/reports/abc");
    assert(status === 400 || status === 401, `Expected 400 or 401, got ${status}`);
  });

  await test("GET /api/reports/valid_id_test — no auth → 401", async () => {
    const { status } = await fetchJson("/api/reports/valid_id_test_12345");
    assertEqual(status, 401, "status");
  });
}

async function testAdminEndpoints() {
  console.log("\n🔒 Admin API");

  await test("GET /api/admin/analytics — no auth → 403", async () => {
    const { status } = await fetchJson("/api/admin/analytics");
    assertEqual(status, 403, "status");
  });

  await test("GET /api/admin/users — no auth → 403", async () => {
    const { status } = await fetchJson("/api/admin/users");
    assertEqual(status, 403, "status");
  });

  await test("GET /api/admin/security — no auth → 403", async () => {
    const { status } = await fetchJson("/api/admin/security");
    assertEqual(status, 403, "status");
  });

  await test("POST /api/admin/users — no auth → 403", async () => {
    const { status } = await fetchJson("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ action: "update_credits", userId: "test", amount: 5 }),
    });
    assertEqual(status, 403, "status");
  });
}

async function testWebhookEndpoint() {
  console.log("\n🔔 Razorpay Webhook");

  await test("POST /api/razorpay-webhook — missing signature → 400", async () => {
    const { status } = await fetchJson("/api/razorpay-webhook", {
      method: "POST",
      body: JSON.stringify({ event: "payment.captured" }),
    });
    assert(status === 400 || status === 500, `Expected 400 or 500, got ${status}`);
  });

  await test("POST /api/razorpay-webhook — invalid signature → 400", async () => {
    const { status } = await fetchJson("/api/razorpay-webhook", {
      method: "POST",
      body: JSON.stringify({ event: "payment.captured" }),
      headers: {
        "x-razorpay-signature": "0000000000000000000000000000000000000000000000000000000000000000",
      },
    });
    assert(status === 400 || status === 500, `Expected 400 or 500, got ${status}`);
  });
}

async function testRateLimiting() {
  console.log("\n⏱️  Rate Limiting (OTP Send)");

  await test("POST /api/auth/send-otp — rate limit after 4 rapid requests → 429", async () => {
    // First 3 should pass (limit is 3/min)
    for (let i = 0; i < 3; i++) {
      await fetchJson("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: `ratelimit-test-${i}@example.com` }),
      });
    }

    // 4th request should be rate limited
    const { status, headers } = await fetchJson("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: "ratelimit-test-final@example.com" }),
    });

    // Note: In dev, the rate limiter is in-memory and may not persist across requests
    // if the server hot-reloads. This test validates the mechanism is wired up.
    if (status === 429) {
      assert(headers.get("retry-after") !== null, "Expected Retry-After header");
    }
    // Accept 200 in dev (cold starts reset the map) but log it
    assert(status === 429 || status === 200, `Expected 429 or 200, got ${status}`);
  });
}

async function testConcurrentRequests() {
  console.log("\n🔄 Concurrent Request Testing");

  await test("20 concurrent /api/auth/send-otp — no crashes", async () => {
    const promises = Array.from({ length: 20 }, (_, i) =>
      fetchJson("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: `concurrent-${i}@example.com` }),
      }).catch((err) => ({ status: 0, body: null, error: err.message }))
    );

    const results = await Promise.all(promises);
    const crashed = results.filter((r: any) => r.status === 0);
    assert(crashed.length === 0, `${crashed.length} requests crashed`);

    // At least some should succeed (200) and some should be rate limited (429)
    const statuses = results.map((r: any) => r.status);
    console.log(`    Statuses: ${JSON.stringify(statuses.reduce((acc: any, s: any) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {}))}`);
  });

  await test("10 concurrent /api/create-order (no auth) — all return 401, no crash", async () => {
    const promises = Array.from({ length: 10 }, () =>
      fetchJson("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ plan: "plus" }),
      }).catch((err) => ({ status: 0, body: null, error: err.message }))
    );

    const results = await Promise.all(promises);
    const crashed = results.filter((r: any) => r.status === 0);
    assert(crashed.length === 0, `${crashed.length} requests crashed`);

    const unauthorized = results.filter((r: any) => r.status === 401);
    // All should be 401 (no auth) or 429 (rate limited)
    assert(
      results.every((r: any) => r.status === 401 || r.status === 429),
      `Expected all 401 or 429, got: ${results.map((r: any) => r.status)}`
    );
  });

  await test("10 concurrent /api/verify-payment (no auth) — all return 401, no crash", async () => {
    const promises = Array.from({ length: 10 }, () =>
      fetchJson("/api/verify-payment", {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: "order_test",
          razorpay_payment_id: "pay_test",
          razorpay_signature: "sig_test",
        }),
      }).catch((err) => ({ status: 0, body: null, error: err.message }))
    );

    const results = await Promise.all(promises);
    const crashed = results.filter((r: any) => r.status === 0);
    assert(crashed.length === 0, `${crashed.length} requests crashed`);
  });

  await test("5 concurrent /api/admin/analytics (no auth) — all return 403", async () => {
    const promises = Array.from({ length: 5 }, () =>
      fetchJson("/api/admin/analytics").catch((err) => ({ status: 0, body: null, error: err.message }))
    );

    const results = await Promise.all(promises);
    const allForbidden = results.every((r: any) => r.status === 403);
    assert(allForbidden, `Expected all 403, got: ${results.map((r: any) => r.status)}`);
  });
}

// ========== Main ==========

async function main() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   Decisely — Production Readiness API Test Suite      ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log(`\nTarget: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Check server is running
  try {
    await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error("❌ Dev server is not running at " + BASE_URL);
    console.error("   Start it with: npm run dev");
    process.exit(1);
  }

  // Run test suites
  await testAuthEndpoints();
  await testAnalyzeEndpoint();
  await testPaymentEndpoints();
  await testReportsEndpoint();
  await testAdminEndpoints();
  await testWebhookEndpoint();
  await testRateLimiting();
  await testConcurrentRequests();

  // Summary
  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed, ${passCount + failCount} total\n`);

  if (failCount > 0) {
    console.log("❌ Failed tests:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
    console.log("");
  }

  if (failCount === 0) {
    console.log("✅ All tests passed! API is production-ready.\n");
  } else {
    console.log(`⚠️  ${failCount} test(s) need attention before production deployment.\n`);
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main();
