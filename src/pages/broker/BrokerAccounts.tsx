import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, Eye, Archive, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  equity: number;
  leverage: string | null;
  status: string;
  created_at: string;
}

const BrokerAccounts = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = useMemo(() => {
    if (location.pathname.includes("/archived")) return "archived";
    if (location.pathname.includes("/demo")) return "demo";
    return "live";
  }, [location.pathname]);

  const onTabChange = (value: string) => {
    navigate(`/accounts/${value}`);
  };

  useEffect(() => {
    let mounted = true;

    const loadAccounts = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) return;

        const { data, error } = await supabase
          .from("accounts")
          .select("id, account_number, account_type, balance, equity, leverage, status, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (mounted) setAccounts((data ?? []) as Account[]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAccounts();
    return () => { mounted = false; };
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount || 0);

  const liveAccounts = accounts.filter((a) => {
    const type = a.account_type?.toLowerCase();
    return type !== "demo" && a.status?.toLowerCase() === "active";
  });
  const demoAccounts = accounts.filter((a) => a.account_type?.toLowerCase() === "demo" && a.status?.toLowerCase() === "active");
  const archivedAccounts = accounts.filter((a) => a.status?.toLowerCase() === "archived");

  const renderAccountsTable = (list: Account[]) => {
    if (loading) {
      return <div className="py-10 text-center text-muted-foreground">Loading accounts…</div>;
    }
    if (list.length === 0) {
      return <div className="py-10 text-center text-muted-foreground">No accounts found.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Account ID</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Type</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Balance</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Equity</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Leverage</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Created</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((account) => (
              <tr key={account.id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="py-4 px-4 font-mono text-sm">{account.account_number}</td>
                <td className="py-4 px-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      account.account_type?.toLowerCase() === "live"
                        ? "bg-broker-primary/10 text-broker-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {account.account_type}
                  </span>
                </td>
                <td className="py-4 px-4">{formatCurrency(account.balance)}</td>
                <td className="py-4 px-4">{formatCurrency(account.equity)}</td>
                <td className="py-4 px-4">{account.leverage ?? "-"}</td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{new Date(account.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Link to={`/account/${account.id}`}>
                      <Button variant="ghost" size="sm" className="text-broker-primary hover:text-broker-primary/80">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {account.status?.toLowerCase() === "active" && (
                      <Button variant="ghost" size="sm" className="text-broker-primary hover:text-broker-primary/80">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Trade
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">Trading Accounts</h1>
            <p className="text-muted-foreground">Manage your live and demo trading accounts</p>
          </div>
          <Link to="/accounts/open">
            <Button className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Open Account
            </Button>
          </Link>
        </div>

        <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="live" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <Wallet className="w-4 h-4 mr-2" />
              Live Accounts
            </TabsTrigger>
            <TabsTrigger value="demo" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Demo Accounts
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <Archive className="w-4 h-4 mr-2" />
              Archived
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6">{renderAccountsTable(liveAccounts)}</div>
          </TabsContent>

          <TabsContent value="demo" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6">{renderAccountsTable(demoAccounts)}</div>
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6">
              {archivedAccounts.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No archived accounts</p>
                </div>
              ) : (
                renderAccountsTable(archivedAccounts)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerAccounts;
