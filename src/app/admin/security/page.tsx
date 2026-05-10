"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  AlertTriangle,
  Loader2,
  Clock
} from "lucide-react";

export default function AdminSecurity() {
  const { user } = useAuth();
  const [data, setData] = useState<{securityLogs: any[], apiLogs: any[]} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/security", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch security logs:", error);
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

  const securityLogs = data?.securityLogs || [];
  const apiLogs = data?.apiLogs || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security & Audits</h1>
        <p className="text-muted-foreground mt-1">Monitor rate limits, failed requests, and suspicious activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Rate Limit Violations */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-96">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-lg">Rate Limit Violations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {securityLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No security logs found.</p>
            ) : (
              securityLogs.map((log) => (
                <div key={log.id} className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-amber-600 dark:text-amber-400 capitalize">
                      {log.type.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt?._seconds * 1000).toLocaleString() || "Unknown time"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div><span className="font-medium text-foreground">IP:</span> {log.ip}</div>
                    <div><span className="font-medium text-foreground">Endpoint:</span> {log.endpoint}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Failed API Requests */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-96">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-lg">Failed AI Requests</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {apiLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No failed API requests logged.</p>
            ) : (
              apiLogs.map((log) => (
                <div key={log.id} className="bg-destructive/5 p-4 rounded-xl border border-destructive/20 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-destructive">
                      Error {log.status}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt?._seconds * 1000).toLocaleString() || "Unknown time"}
                    </div>
                  </div>
                  <div className="text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">User:</span> <span className="font-mono text-xs">{log.userId}</span>
                  </div>
                  <div className="bg-background/50 p-2 rounded border border-border/50 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {log.error}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
