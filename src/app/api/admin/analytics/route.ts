import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminAuth } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const adminToken = await verifyAdminAuth(req);
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
  }

  try {
    // 1. Fetch Daily Stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const statsSnapshot = await adminDb
      .collection("analytics_daily")
      .where("date", ">=", dateStr)
      .orderBy("date", "asc")
      .get();

    const dailyStats = statsSnapshot.docs.map(doc => doc.data());

    // 2. Fetch Aggregate KPIs
    // Total Users
    const usersSnapshot = await adminDb.collection("users").count().get();
    const totalUsers = usersSnapshot.data().count;

    // Calculate aggregated totals from the last 30 days of stats
    let totalRequests30d = 0;
    let totalPaidCredits30d = 0;
    let totalFreeCredits30d = 0;
    
    dailyStats.forEach(stat => {
      totalRequests30d += stat.totalRequests || 0;
      totalPaidCredits30d += stat.paidCreditsUsed || 0;
      totalFreeCredits30d += stat.freeCreditsUsed || 0;
    });

    // We can compute conversion proxy by counting users with "pro" subscription
    // Since count queries on specific fields require an index, we might just do it if we had one.
    // For now, we'll return a rough estimate or fetch it if we want.
    const proUsersSnapshot = await adminDb.collection("users").where("subscriptionStatus", "==", "pro").count().get();
    const proUsers = proUsersSnapshot.data().count;

    return NextResponse.json({
      dailyStats,
      kpis: {
        totalUsers,
        proUsers,
        conversionRate: totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(2) : "0.00",
        totalRequests30d,
        totalPaidCredits30d,
        totalFreeCredits30d
      }
    });
  } catch (error: any) {
    console.error("Failed to fetch admin analytics:", error);
    
    // Specifically handle the "Could not load the default credentials" error in development
    if (error.message?.includes("Could not load the default credentials")) {
      return NextResponse.json({ 
        error: "Firebase Admin Credentials Missing", 
        message: "Please add FIREBASE_ADMIN_KEY to your .env.local to view admin analytics."
      }, { status: 500 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
