import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  equity: number;
  leverage: string | null;
  status: string;
  account_size: number;
}

interface Trade {
  id: string;
  symbol: string;
  direction: string;
  lot_size: number;
  entry_price: number;
  exit_price: number | null;
  pnl: number | null;
  opened_at: string;
  status: string;
}

const BrokerAccountDetail = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/login");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!accountId || !user) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: accData, error } = await supabase.from("accounts").select("*").eq("id", accountId).single();
        if (error) throw error;
        if (mounted && accData) setAccount(accData as unknown as Account);

        const { data: trData } = await supabase
          .from("trades")
          .select("id, symbol, direction, lot_size, entry_price, exit_price, pnl, opened_at, status")
          .eq("account_id", accountId)
          .order("opened_at", { ascending: false })
          .limit(50);
        if (mounted) setTrades((trData ?? []) as Trade[]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [accountId, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Wallet, label: "Withdraw", path: "/withdraw" },
    { icon: TrendingUp, label: "Trading Accounts", path: "/accounts/live" },
    { icon: History, label: "Reports", path: "/reports/summary" },
    { icon: Settings, label: "Settings", path: "/profile" },
  ];

  const formatCurrency = (v: number | null | undefined) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v ?? 0);

  if (loading || !account) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-broker-primary text-xl">Loading...</div></div>;
  }

  const profit = account.equity - account.balance;
  const profitPercent = account.balance > 0 ? ((profit / account.balance) * 100).toFixed(2) : "0";

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => (t.pnl ?? 0) > 0).length;
  const losingTrades = trades.filter((t) => (t.pnl ?? 0) < 0).length;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0";
  const avgWin = winningTrades > 0 ? (trades.filter((t) => (t.pnl ?? 0) > 0).reduce((s, t) => s + (t.pnl ?? 0), 0) / winningTrades).toFixed(2) : "0";
  const avgLoss = losingTrades > 0 ? (trades.filter((t) => (t.pnl ?? 0) < 0).reduce((s, t) => s + Math.abs(t.pnl ?? 0), 0) / losingTrades).toFixed(2) : "0";

  const openPositions = trades.filter((t) => t.status?.toLowerCase() === "open");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-secondary/50 border-r border-border/20 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-border/20">
          <Link to="/" className="flex items-center gap-2">
            {sidebarOpen ? (
              <span className="text-xl font-heading font-bold"><span className="text-foreground">KUBERA</span> <span className="text-broker-primary">MARKETS</span></span>
            ) : (
              <span className="text-xl font-heading font-bold text-broker-primary">KM</span>
            )}
          </Link>
        </div>
        <nav className="flex-1 p-4"><ul className="space-y-2">{menuItems.map((item, index) => (<li key={index}><Link to={item.path} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"><item.icon className="w-5 h-5" />{sidebarOpen && <span>{item.label}</span>}</Link></li>))}</ul></nav>
        <div className="p-4 border-t border-border/20"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><LogOut className="w-5 h-5" />{sidebarOpen && <span>Logout</span>}</button></div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-secondary/30 border-b border-border/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-muted rounded-lg">{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
            <Link to="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Button></Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <div className="w-10 h-10 bg-broker-primary/20 rounded-full flex items-center justify-center"><span className="text-broker-primary font-semibold">{user?.email?.charAt(0).toUpperCase()}</span></div>
          </div>
        </header>

        <div className="p-6 border-b border-border/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm text-muted-foreground">{account.account_number}</span>
                <span className={`text-xs px-2 py-1 rounded ${account.account_type?.toLowerCase() === "live" ? "bg-broker-primary/10 text-broker-primary" : "bg-muted text-muted-foreground"}`}>{account.account_type}</span>
              </div>
              <h1 className="text-3xl font-heading font-bold">Trading Account</h1>
              <p className="text-muted-foreground">Leverage: {account.leverage ?? "-"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Equity</p>
              <p className="text-3xl font-bold text-broker-primary">{formatCurrency(account.equity)}</p>
              <p className={`text-sm ${profit >= 0 ? "text-primary" : "text-destructive"}`}>{profit >= 0 ? "+" : ""}{formatCurrency(profit)} ({profitPercent}%)</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-secondary/50"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="performance">Performance</TabsTrigger><TabsTrigger value="trades">Trade History</TabsTrigger></TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-broker-primary" /><span className="text-sm text-muted-foreground">Balance</span></div><p className="text-2xl font-bold">{formatCurrency(account.balance)}</p></div>
                <div className="bg-card border border-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-broker-primary" /><span className="text-sm text-muted-foreground">Equity</span></div><p className="text-2xl font-bold">{formatCurrency(account.equity)}</p></div>
                <div className="bg-card border border-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><BarChart3 className="w-5 h-5 text-broker-primary" /><span className="text-sm text-muted-foreground">Free Margin</span></div><p className="text-2xl font-bold">{formatCurrency(account.equity)}</p></div>
                <div className="bg-card border border-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Today's P&L</span></div><p className={`text-2xl font-bold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>{profit >= 0 ? "+" : ""}{formatCurrency(profit)}</p></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-heading font-bold mb-4">Account Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Account ID</span><span className="font-mono">{account.account_number}</span></div>
                    <div className="flex justify-between py-2 border-b border-border/50"><span className="text-muted-foreground">Account Type</span><span>{account.account_type}</span></div>
                    <div className="flex justify-between py-2"><span className="text-muted-foreground">Leverage</span><span>{account.leverage ?? "-"}</span></div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-heading font-bold mb-4">How to Trade</h3>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">Your trading is done through the <strong className="text-foreground">Condor</strong> trading platform.</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Download and install the Condor platform from the <Link to="/support/downloads" className="text-broker-primary hover:underline">Downloads</Link> page</li>
                      <li>Log in with the credentials provided to you via email</li>
                      <li>Your portal account will be linked to your Condor trading account by our team</li>
                    </ol>
                    <p className="text-xs text-muted-foreground italic mt-3">If you haven't received your Condor credentials, please contact support.</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">Open Positions</h3>
                {openPositions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No open positions</p>
                ) : (
                  <div className="space-y-3">{openPositions.map((t) => (<div key={t.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"><div><p className="font-semibold">{t.symbol}</p><p className="text-sm text-muted-foreground">{t.direction} {t.lot_size} lot</p></div><p className={`font-semibold ${(t.pnl ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>{(t.pnl ?? 0) >= 0 ? "+" : ""}${(t.pnl ?? 0).toFixed(2)}</p></div>))}</div>
                )}
              </div>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><BarChart3 className="w-5 h-5 text-broker-primary" /><span className="text-sm text-muted-foreground">Win Rate</span></div><p className="text-2xl font-bold">{winRate}%</p></div>
                <div className="bg-card border border-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Avg Win</span></div><p className="text-2xl font-bold text-primary">${avgWin}</p></div>
                <div className="bg-card border border-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><TrendingDown className="w-5 h-5 text-destructive" /><span className="text-sm text-muted-foreground">Avg Loss</span></div><p className="text-2xl font-bold text-destructive">${avgLoss}</p></div>
                <div className="bg-card border border-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><History className="w-5 h-5 text-broker-primary" /><span className="text-sm text-muted-foreground">Total Trades</span></div><p className="text-2xl font-bold">{totalTrades}</p></div>
              </div>
            </TabsContent>

            {/* Trades */}
            <TabsContent value="trades">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-6">Trade History</h3>
                {trades.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No trades recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-border"><th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th><th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Symbol</th><th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Direction</th><th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Lot</th><th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Entry</th><th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Exit</th><th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">P&L</th><th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th></tr></thead>
                      <tbody>{trades.map((t) => (<tr key={t.id} className="border-b border-border/50 hover:bg-muted/20"><td className="py-4 px-4 text-muted-foreground">{new Date(t.opened_at).toLocaleDateString()}</td><td className="py-4 px-4 font-semibold">{t.symbol}</td><td className="py-4 px-4"><span className={`text-xs px-2 py-1 rounded ${t.direction?.toUpperCase() === "BUY" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{t.direction}</span></td><td className="py-4 px-4">{t.lot_size}</td><td className="py-4 px-4 font-mono">{t.entry_price}</td><td className="py-4 px-4 font-mono">{t.exit_price ?? "-"}</td><td className={`py-4 px-4 font-semibold ${(t.pnl ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>{(t.pnl ?? 0) >= 0 ? "+" : ""}${(t.pnl ?? 0).toFixed(2)}</td><td className="py-4 px-4"><span className={`text-xs px-2 py-1 rounded ${t.status?.toLowerCase() === "open" ? "bg-broker-primary/10 text-broker-primary" : "bg-muted text-muted-foreground"}`}>{t.status}</span></td></tr>))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BrokerAccountDetail;
