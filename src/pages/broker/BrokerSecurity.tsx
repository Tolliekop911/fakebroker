import { useState, useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { History } from "lucide-react";

interface LoginEntry {
  id: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  created_at: string;
  status: string;
}

const BrokerSecurity = () => {
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);

  useEffect(() => {
    const loadLoginHistory = async () => {
      setHistoryLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("login_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setLoginHistory(data);
        }
      }
      setHistoryLoading(false);
    };
    loadLoginHistory();
  }, []);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const maskIP = (ip: string | null) => {
    if (!ip) return "Unknown";
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    return ip;
  };

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Security</h1>
          <p className="text-muted-foreground">View your account security information</p>
        </div>

        {/* Login History */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-6 h-6 text-broker-primary" />
            <h2 className="text-lg font-semibold">Login History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date & Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">IP Address</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Device</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-4 px-4"><div className="h-4 w-32 bg-muted rounded animate-pulse" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-24 bg-muted rounded animate-pulse" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-28 bg-muted rounded animate-pulse" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-16 bg-muted rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No login history available
                    </td>
                  </tr>
                ) : (
                  loginHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50">
                      <td className="py-4 px-4 text-sm">{formatDate(entry.created_at)}</td>
                      <td className="py-4 px-4 text-sm font-mono">{maskIP(entry.ip_address)}</td>
                      <td className="py-4 px-4 text-sm">
                        {entry.browser || "Unknown"} / {entry.os || "Unknown"}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          entry.status === "success"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {entry.status === "success" ? "Success" : entry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerSecurity;
