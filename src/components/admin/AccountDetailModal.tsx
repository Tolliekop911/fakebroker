import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2, CheckCircle, DollarSign } from "lucide-react";

interface AccountDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onRefresh?: () => void;
}

interface AccountData {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  equity: number;
  account_size: number;
  status: string;
  leverage: string | null;
  condor_account_id: string | null;
  deposit_confirmed: boolean;
  user_id: string;
  created_at: string;
}

const AccountDetailModal = ({ open, onOpenChange, accountId, onRefresh }: AccountDetailModalProps) => {
  const { toast } = useToast();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [profile, setProfile] = useState<{ email: string | null; full_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [condorId, setCondorId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    if (!open || !accountId) return;
    loadAccount();
  }, [open, accountId]);

  const loadAccount = async () => {
    setLoading(true);
    const { data } = await supabase.from("accounts").select("*").eq("id", accountId).single();
    if (data) {
      setAccount(data as AccountData);
      setCondorId(data.condor_account_id || "");
      const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("user_id", data.user_id).single();
      setProfile(prof);
    }
    setLoading(false);
  };

  const handleLinkCondor = async () => {
    if (!condorId.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("accounts").update({ condor_account_id: condorId.trim() }).eq("id", accountId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Condor ID Linked", description: `Account linked to Condor ID: ${condorId}` });
      loadAccount();
      onRefresh?.();
    }
    setSaving(false);
  };

  const handleConfirmDeposit = async () => {
    setSaving(true);
    const { error } = await supabase.from("accounts").update({ deposit_confirmed: true }).eq("id", accountId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deposit Confirmed", description: "Account marked as funded." });
      loadAccount();
      onRefresh?.();
    }
    setSaving(false);
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (!account) return;
    setSaving(true);
    const newBalance = Number(account.balance) + amount;
    const newEquity = Number(account.equity) + amount;
    const newSize = Math.max(Number(account.account_size), newBalance);
    const { error } = await supabase.from("accounts").update({
      balance: newBalance,
      equity: newEquity,
      account_size: newSize,
      deposit_confirmed: true,
    }).eq("id", accountId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Funds Added", description: `$${amount.toLocaleString()} added to account.` });
      setDepositAmount("");
      loadAccount();
      onRefresh?.();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account: {account.account_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Account Info */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 rounded-lg text-sm">
            <div><span className="text-muted-foreground">Client:</span> <span className="font-semibold">{profile?.full_name || profile?.email || "—"}</span></div>
            <div><span className="text-muted-foreground">Type:</span> <span className="font-semibold">{account.account_type}</span></div>
            <div><span className="text-muted-foreground">Balance:</span> <span className="font-semibold">${Number(account.balance).toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Equity:</span> <span className="font-semibold">${Number(account.equity).toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Leverage:</span> <span className="font-semibold">{account.leverage}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className="font-semibold capitalize">{account.status}</span></div>
            <div><span className="text-muted-foreground">Funded:</span> <span className={`font-semibold ${account.deposit_confirmed ? "text-green-500" : "text-yellow-500"}`}>{account.deposit_confirmed ? "Yes" : "No"}</span></div>
            <div><span className="text-muted-foreground">Condor ID:</span> <span className="font-semibold">{account.condor_account_id || "Not linked"}</span></div>
          </div>

          {/* Link Condor Account */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Link2 className="w-4 h-4" /> Link Condor Account</Label>
            <div className="flex gap-2">
              <Input value={condorId} onChange={(e) => setCondorId(e.target.value)} placeholder="Enter Condor Account ID" />
              <Button onClick={handleLinkCondor} disabled={saving || !condorId.trim()} size="sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Link"}
              </Button>
            </div>
          </div>

          {/* Confirm Deposit */}
          {!account.deposit_confirmed && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Confirm Deposit Received</Label>
              <Button onClick={handleConfirmDeposit} disabled={saving} variant="outline" className="w-full text-green-500 border-green-500 hover:bg-green-500/10">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                Confirm Deposit
              </Button>
            </div>
          )}

          {/* Add Funds */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Add Funds to Account</Label>
            <div className="flex gap-2">
              <Input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Amount (USD)" />
              <Button onClick={handleAddFunds} disabled={saving || !depositAmount} size="sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Funds"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailModal;
