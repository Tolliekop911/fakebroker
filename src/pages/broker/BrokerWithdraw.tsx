import { useState, useEffect } from "react";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowDownLeft, Clock, CheckCircle } from "lucide-react";

interface Account {
  id: string;
  account_number: string;
  balance: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  payment_method: string | null;
}

const BrokerWithdraw = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [form, setForm] = useState({
    accountId: "",
    amount: "",
    paymentMethod: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [accountsRes, withdrawalsRes] = await Promise.all([
        supabase.from("accounts").select("id, account_number, balance").eq("user_id", user.id).eq("status", "active"),
        supabase.from("payouts").select("id, amount, status, requested_at, payment_method").eq("user_id", user.id).order("requested_at", { ascending: false }).limit(20),
      ]);

      setAccounts(accountsRes.data || []);
      setWithdrawals((withdrawalsRes.data || []) as Withdrawal[]);
      setLoading(false);
    };
    load();
  }, []);

  const selectedAccount = accounts.find(a => a.id === form.accountId);

  const handleSubmit = async () => {
    if (!form.accountId || !form.amount || !form.paymentMethod) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
      return;
    }

    if (selectedAccount && amount > selectedAccount.balance) {
      toast({ title: "Error", description: "Amount exceeds available balance", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("payouts").insert({
        user_id: user.id,
        account_id: form.accountId,
        amount,
        payment_method: form.paymentMethod,
        requested_at: new Date().toISOString(),
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Withdrawal Requested", description: `$${amount.toLocaleString()} withdrawal is being processed.` });
      setForm({ accountId: "", amount: "", paymentMethod: "" });

      // Refresh withdrawals
      const { data } = await supabase.from("payouts").select("id, amount, status, requested_at, payment_method").eq("user_id", user.id).order("requested_at", { ascending: false }).limit(20);
      setWithdrawals((data || []) as Withdrawal[]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Withdraw Funds</h1>
          <p className="text-muted-foreground">Request a withdrawal from your trading account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Withdrawal Form */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownLeft className="w-6 h-6 text-broker-primary" />
              <h2 className="text-lg font-semibold">New Withdrawal</h2>
            </div>

            <div className="space-y-2">
              <Label>From Account</Label>
              <Select value={form.accountId} onValueChange={(v) => setForm({ ...form, accountId: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.account_number} — {formatCurrency(acc.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="bg-secondary border-border"
              />
              {selectedAccount && (
                <p className="text-xs text-muted-foreground">Available: {formatCurrency(selectedAccount.balance)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Withdrawal Method</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="w-full bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : "Request Withdrawal"}
            </Button>
          </div>

          {/* Withdrawal History */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Withdrawal History</h2>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No withdrawals yet</div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-semibold">{formatCurrency(w.amount)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(w.requested_at).toLocaleDateString()} • {w.payment_method || "—"}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      w.status === "paid" || w.status === "processed"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {w.status === "paid" || w.status === "processed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerWithdraw;
