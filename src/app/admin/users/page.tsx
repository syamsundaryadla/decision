"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useState } from "react";
import { 
  Search, 
  Ban, 
  CheckCircle, 
  Coins,
  Loader2,
  MoreVertical,
  AlertTriangle
} from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
        if (res.ok) {
          const json = await res.json();
          setUsers(json.users);
        } else {
          const err = await res.json();
          setError(err.message || err.error || "Failed to load users");
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleAction = async (action: "suspend_user" | "update_credits", userId: string, payload: any) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action, userId, ...payload })
      });
      if (res.ok) {
        // Refresh users
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch (error) {
      console.error("Action failed:", error);
      alert("Action failed. See console for details.");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    u.id.includes(search)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage accounts, credits, and security.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4 text-right">Credits</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-amber-500/10 text-amber-500 p-3 rounded-full">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold">{error}</p>
                        {error.includes("FIREBASE_ADMIN_KEY") && (
                          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Add your service account key to <code>.env.local</code> to enable user management.
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{u.email || "No Email"}</div>
                      <div className="text-xs text-muted-foreground font-mono">{u.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {u.subscriptionStatus || "free"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      {u.credits ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          <Ban className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            const amt = parseInt(prompt("Amount of credits to add/remove (e.g. 5 or -5):") || "0");
                            if (amt !== 0 && !isNaN(amt)) {
                              handleAction("update_credits", u.id, { amount: amt });
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Modify Credits"
                        >
                          <Coins className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to ${u.isSuspended ? 'reactivate' : 'suspend'} this user?`)) {
                              handleAction("suspend_user", u.id, { isSuspended: !u.isSuspended });
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title={u.isSuspended ? "Reactivate User" : "Suspend User"}
                        >
                          {u.isSuspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
