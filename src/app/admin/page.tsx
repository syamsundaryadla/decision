"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useState } from "react";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          const err = await res.json();
          setError(err.message || err.error || "Failed to load data");
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setError("An unexpected error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="bg-amber-500/10 text-amber-500 p-4 rounded-full">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Admin Data Unavailable</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
        {error.includes("FIREBASE_ADMIN_KEY") && (
          <div className="bg-muted p-4 rounded-xl border border-border max-w-lg text-sm">
            <p className="font-semibold mb-2">How to fix:</p>
            <ol className="list-decimal ml-4 space-y-1 text-muted-foreground">
              <li>Go to Firebase Console → Project Settings → Service Accounts</li>
              <li>Generate a new Private Key (JSON)</li>
              <li>Paste the contents as <code>FIREBASE_ADMIN_KEY</code> in your <code>.env.local</code></li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  if (!data) return <div>Failed to load data</div>;

  const { kpis, dailyStats } = data;

  const kpiCards = [
    { title: "Total Users", value: kpis.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Pro Conversions", value: `${kpis.conversionRate}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "30d Requests", value: kpis.totalRequests30d, icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Paid Credits Used", value: kpis.totalPaidCredits30d, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Platform analytics and key performance indicators.</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">{kpi.title}</h3>
              <div className={`p-2 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Request Trends */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-6">AI Request Volume (30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" name="Total Requests" dataKey="totalRequests" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" name="Failed" dataKey="failedRequests" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Credit Consumption */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Credit Consumption</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Bar name="Free Credits" dataKey="freeCreditsUsed" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar name="Paid Credits" dataKey="paidCreditsUsed" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
