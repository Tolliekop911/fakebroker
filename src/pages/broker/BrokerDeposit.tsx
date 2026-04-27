import { useState, useEffect } from "react";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowUpRight, CheckCircle, Clock } from "lucide-react";
import CreditCardForm from "@/components/CreditCardForm";

interface Deposit {
  id: string;
  amount: number;
  status: "pending" | "confirmed" | "failed";
  payment_method: string;
  reference_number: string;
  created_at: string;
}

export default function BrokerDeposit() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [form, setForm] = useState({
    amount: "",
    paymentMethod: "",
    reference: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setDeposits((data || []) as Deposit[]);
      setLoading(false);
    };
    load();
  }, []);

  const [showCardForm, setShowCardForm] = useState(false);

  const handleCardSuccess = async (reference: string) => {
    const amount = parseFloat(form.amount);
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("deposits").insert({
        user_id: user.id,
        amount,
        payment_method: "card",
        reference_number: reference,
        status: "confirmed",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: "Payment Successful!", description: `R${amount.toLocaleString()} deposited to your account` });
      setForm({ amount: "", paymentMethod: "", reference: "" });
      setShowCardForm(false);
      const { data } = await supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setDeposits((data || []) as Deposit[]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.paymentMethod) {
      toast({ title: "Error", description: "Fill in all fields", variant: "destructive" });
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
      return;
    }

    if (form.paymentMethod === "card") {
      setShowCardForm(true);
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const refNumber = `DEP-${Date.now()}`;
      const { error } = await supabase.from("deposits").insert({
        user_id: user.id,
        amount,
        payment_method: form.paymentMethod,
        reference_number: refNumber,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Deposit Submitted",
        description: `R${amount.toLocaleString()} deposit pending confirmation`,
      });

      setForm({ amount: "", paymentMethod: "", reference: "" });

      const { data } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setDeposits((data || []) as Deposit[]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Deposit Funds</h1>
          <p className="text-muted-foreground">Add funds to your trading account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit Form */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold">New Deposit</h2>
            </div>

            <div className="space-y-2">
              <Label>Amount (ZAR)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => { setForm({ ...form, paymentMethod: v }); setShowCardForm(false); }}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showCardForm && form.paymentMethod === "card" ? (
              <CreditCardForm
                amount={parseFloat(form.amount) || 0}
                currency="R"
                onSuccess={handleCardSuccess}
                onCancel={() => setShowCardForm(false)}
              />
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : "Submit Deposit"}
              </Button>
            )}
          </div>

          {/* Deposit History */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Deposit History</h2>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : deposits.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No deposits yet</div>
            ) : (
              <div className="space-y-3">
                {deposits.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-semibold">R{d.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{d.reference_number}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      d.status === "confirmed"
                        ? "bg-green-500/10 text-green-500"
                        : d.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {d.status === "confirmed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {d.status}
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
}
