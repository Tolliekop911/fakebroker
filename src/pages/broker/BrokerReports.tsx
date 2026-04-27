import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, FileText, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { downloadBlob, toCSV } from "@/lib/download";

const BrokerReports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentTab = useMemo(() => {
    const last = location.pathname.split("/").pop() || "summary";
    return ["summary", "trades", "payouts"].includes(last) ? last : "summary";
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const userId = userRes.user.id;
      const accountsRes = await supabase
        .from("accounts")
        .select("id, account_number, account_size, balance, equity")
        .eq("user_id", userId)
        .eq("account_type", "broker")
        .order("created_at", { ascending: false });

      const accountIds = (accountsRes.data ?? []).map((a: any) => a.id);

      const [payoutsRes, tradesRes] = await Promise.all([
        supabase
          .from("payouts")
          .select("id, amount, payment_method, requested_at, processed_at, status")
          .eq("user_id", userId)
          .order("requested_at", { ascending: false }),
        accountIds.length
          ? supabase
              .from("trades")
              .select("id, opened_at, symbol, direction, lot_size, pnl")
              .in("account_id", accountIds)
              .order("opened_at", { ascending: false })
              .limit(500)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      if (cancelled) return;
      setAccounts(accountsRes.data ?? []);
      setPayouts((payoutsRes as any).data ?? []);
      setTrades((tradesRes as any).data ?? []);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number.isFinite(n) ? n : 0);

  const accountSummary = useMemo(() => {
    const totalBalance = accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0);
    const totalEquity = accounts.reduce((sum, a) => sum + (a.equity ?? 0), 0);
    const totalTrades = trades.length;
    return { totalBalance, totalEquity, totalTrades };
  }, [accounts, trades]);

  const onTabChange = (value: string) => {
    navigate(`/reports/${value}`);
  };

  const handleExportTradesCSV = () => {
    if (!trades.length) {
      toast({ title: "No trades", description: "There are no trades to export." });
      return;
    }
    const rows = trades.map((t) => ({
      id: t.id, opened_at: t.opened_at, symbol: t.symbol, direction: t.direction, lot_size: t.lot_size, pnl: t.pnl,
    }));
    const csv = toCSV(rows);
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `broker-trades-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportSummary = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      total_balance: accountSummary.totalBalance,
      total_equity: accountSummary.totalEquity,
      total_trades: accountSummary.totalTrades,
    };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), `broker-summary-${new Date().toISOString().slice(0, 10)}.json`);
  };

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">Reports</h1>
            <p className="text-muted-foreground">View and download your trading reports</p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="date" className="bg-secondary border-border w-40" />
            <span className="text-muted-foreground">to</span>
            <Input type="date" className="bg-secondary border-border w-40" />
            <Button variant="outline">Apply</Button>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="summary" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="trades" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trades
            </TabsTrigger>
            <TabsTrigger value="payouts" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Payouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            {loading ? (
              <div className="space-y-3">
                <div className="h-20 rounded bg-muted/40 animate-pulse" />
                <div className="h-20 rounded bg-muted/40 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(accountSummary.totalBalance)}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-2">Total Equity</p>
                    <p className="text-2xl font-bold">{formatCurrency(accountSummary.totalEquity)}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-2">Total Trades</p>
                    <p className="text-2xl font-bold">{accountSummary.totalTrades}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground" onClick={handleExportSummary}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="trades" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Trade History</h3>
                <Button variant="outline" size="sm" onClick={handleExportTradesCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-10 rounded bg-muted/40 animate-pulse" />
                  <div className="h-10 rounded bg-muted/40 animate-pulse" />
                </div>
              ) : trades.length === 0 ? (
                <div className="text-sm text-muted-foreground">No trades yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Symbol</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Volume</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.id} className="border-b border-border/50">
                          <td className="py-4 px-4 text-sm">{trade.opened_at ? new Date(trade.opened_at).toLocaleDateString() : "-"}</td>
                          <td className="py-4 px-4 font-semibold">{trade.symbol}</td>
                          <td className="py-4 px-4">
                            <span className={`text-xs px-2 py-1 rounded ${
                              trade.direction === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              {trade.direction}
                            </span>
                          </td>
                          <td className="py-4 px-4">{trade.lot_size}</td>
                          <td className={`py-4 px-4 font-semibold ${Number(trade.pnl ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.pnl === null || trade.pnl === undefined ? "-" : formatCurrency(trade.pnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payouts" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-10 rounded bg-muted/40 animate-pulse" />
                  <div className="h-10 rounded bg-muted/40 animate-pulse" />
                </div>
              ) : payouts.length === 0 ? (
                <div className="text-sm text-muted-foreground">No payouts yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Method</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-border/50">
                          <td className="py-4 px-4 text-sm">{payout.requested_at ? new Date(payout.requested_at).toLocaleDateString() : "-"}</td>
                          <td className="py-4 px-4 font-semibold">{formatCurrency(payout.amount ?? 0)}</td>
                          <td className="py-4 px-4">{payout.payment_method ?? "-"}</td>
                          <td className="py-4 px-4">
                            <span className={`text-xs px-2 py-1 rounded ${
                              payout.status === 'processed' || payout.status === 'Completed'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {payout.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerReports;
