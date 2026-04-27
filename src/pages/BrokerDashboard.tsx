import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  DollarSign,
  BarChart3,
  TrendingUp,
  History,
  Eye,
  Package,
  Loader2
} from "lucide-react";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { supabase } from "@/integrations/supabase/client";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  equity: number;
  leverage: string | null;
}

interface Trade {
  id: string;
  symbol: string;
  direction: string;
  lot_size: number;
  pnl: number | null;
  status: string;
}

const BrokerDashboard = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id)
          .eq("account_type", "broker")
          .order("created_at", { ascending: false });

        if (accountError) throw accountError;
        setAccounts(accountData || []);

        if (accountData && accountData.length > 0) {
          const accountIds = accountData.map(a => a.id);
          const { data: tradeData, error: tradeError } = await supabase
            .from("trades")
            .select("*")
            .in("account_id", accountIds)
            .order("opened_at", { ascending: false })
            .limit(5);

          if (tradeError) throw tradeError;
          setRecentTrades(tradeData || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accounts.reduce((sum, a) => sum + a.equity, 0);
  const todaysPnL = recentTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalTrades = recentTrades.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  if (loading) {
    return (
      <BrokerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-broker-primary" />
        </div>
      </BrokerDashboardLayout>
    );
  }

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-broker-primary" />
              {accounts.length > 0 && (
                <span className="text-xs text-broker-primary bg-broker-primary/10 px-2 py-1 rounded">Live</span>
              )}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
            <p className="text-sm text-muted-foreground">Total Balance</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-broker-primary" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalEquity)}</p>
            <p className="text-sm text-muted-foreground">Total Equity</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-broker-primary" />
            </div>
            <p className={`text-2xl font-bold ${todaysPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              {todaysPnL >= 0 ? "+" : ""}{formatCurrency(todaysPnL)}
            </p>
            <p className="text-sm text-muted-foreground">Today's P&L</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <History className="w-8 h-8 text-broker-primary" />
            </div>
            <p className="text-2xl font-bold">{totalTrades}</p>
            <p className="text-sm text-muted-foreground">Total Trades</p>
          </div>
        </div>

        {/* Trading Accounts */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-bold">Trading Accounts</h3>
            <Link to="/accounts/open">
              <Button className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">
                + Open Account
              </Button>
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Accounts Yet</h4>
              <p className="text-muted-foreground mb-6">
                Open a trading account to start your trading journey with Kubera Markets.
              </p>
              <Link to="/accounts/open">
                <Button className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">
                  + Open Account
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Account ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Balance</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Equity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Leverage</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-4 px-4 font-mono text-sm">{account.account_number}</td>
                      <td className="py-4 px-4">
                        <span className="text-xs px-2 py-1 rounded bg-broker-primary/10 text-broker-primary">Live</span>
                      </td>
                      <td className="py-4 px-4">{formatCurrency(account.balance)}</td>
                      <td className="py-4 px-4">{formatCurrency(account.equity)}</td>
                      <td className="py-4 px-4">{account.leverage || "1:100"}</td>
                      <td className="py-4 px-4">
                        <Link to={`/account/${account.id}`}>
                          <Button variant="ghost" size="sm" className="text-broker-primary hover:text-broker-primary/80">
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-heading font-bold mb-6">Recent Trades</h3>
          {recentTrades.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No trades yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Pair</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Volume</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Profit/Loss</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-4 px-4 font-semibold">{trade.symbol}</td>
                      <td className="py-4 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          trade.direction === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {trade.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">{trade.lot_size}</td>
                      <td className={`py-4 px-4 font-semibold ${(trade.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(trade.pnl || 0) >= 0 ? "+" : ""}{formatCurrency(trade.pnl || 0)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          trade.status === 'open' ? 'bg-broker-primary/10 text-broker-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerDashboard;
