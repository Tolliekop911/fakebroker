import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, SendIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Withdrawal {
  id: string;
  user_id: string;
  wallet_account_id: string;
  amount: number;
  status: "pending_2fa" | "pending_approval" | "approved" | "sent";
  two_fa_verified: boolean;
  created_at: string;
  profiles?: { name: string; email: string };
}

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [approvedWithdrawals, setApprovedWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      // Get withdrawals pending approval (2FA verified only)
      const { data: pending } = await supabase
        .from("withdrawals")
        .select("id, user_id, wallet_account_id, amount, status, two_fa_verified, created_at, profiles(name, email)")
        .eq("status", "pending_approval")
        .eq("two_fa_verified", true);

      // Get approved withdrawals waiting to be marked sent
      const { data: approved } = await supabase
        .from("withdrawals")
        .select("id, user_id, wallet_account_id, amount, status, created_at, profiles(name, email)")
        .eq("status", "approved");

      setPendingWithdrawals((pending || []) as Withdrawal[]);
      setApprovedWithdrawals((approved || []) as Withdrawal[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    setProcessing({ ...processing, [withdrawalId]: true });

    const { data: admin } = await supabase.auth.getUser();
    if (!admin.user) return;

    const { error } = await supabase
      .from("withdrawals")
      .update({
        status: "approved",
        approved_by: admin.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setProcessing({ ...processing, [withdrawalId]: false });
      return;
    }

    toast({ title: "Success", description: "Withdrawal approved" });

    const withdrawal = pendingWithdrawals.find((w) => w.id === withdrawalId);
    if (withdrawal) {
      setPendingWithdrawals(pendingWithdrawals.filter((w) => w.id !== withdrawalId));
      setApprovedWithdrawals([...approvedWithdrawals, withdrawal as Withdrawal]);
    }

    setProcessing({ ...processing, [withdrawalId]: false });
  };

  const handleMarkAsSent = async (withdrawalId: string) => {
    setProcessing({ ...processing, [withdrawalId]: true });

    const { data: admin } = await supabase.auth.getUser();
    if (!admin.user) return;

    const withdrawal = approvedWithdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal) return;

    // Mark withdrawal as sent
    const { error: withdrawalError } = await supabase
      .from("withdrawals")
      .update({
        status: "sent",
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (withdrawalError) {
      toast({ title: "Error", description: withdrawalError.message, variant: "destructive" });
      setProcessing({ ...processing, [withdrawalId]: false });
      return;
    }

    // Deduct from wallet
    const { error: walletError } = await supabase.rpc("deduct_from_wallet", {
      p_wallet_id: withdrawal.wallet_account_id,
      p_amount: withdrawal.amount,
    });

    if (walletError) {
      toast({ title: "Error", description: walletError.message, variant: "destructive" });
      setProcessing({ ...processing, [withdrawalId]: false });
      return;
    }

    toast({ title: "Success", description: "Withdrawal marked as sent and funds deducted" });
    setApprovedWithdrawals(approvedWithdrawals.filter((w) => w.id !== withdrawalId));
    setProcessing({ ...processing, [withdrawalId]: false });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Withdrawal Management</h1>
        <p className="text-muted-foreground">Approve and process client withdrawals</p>
      </div>

      {/* Pending Approvals */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Pending Approval (2FA Verified)</h2>
        {pendingWithdrawals.length === 0 ? (
          <p className="text-muted-foreground">No pending withdrawals</p>
        ) : (
          <div className="space-y-3">
            {pendingWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-blue-500/5">
                <div className="flex-1">
                  <p className="font-bold text-lg">R{withdrawal.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {withdrawal.profiles?.name} ({withdrawal.profiles?.email})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested: {new Date(withdrawal.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">✓ 2FA Verified</p>
                </div>
                <Button
                  onClick={() => handleApproveWithdrawal(withdrawal.id)}
                  disabled={processing[withdrawal.id]}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing[withdrawal.id] ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Approve</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved - Ready to Send */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Approved - Ready to Send</h2>
        {approvedWithdrawals.length === 0 ? (
          <p className="text-muted-foreground">No approved withdrawals pending dispatch</p>
        ) : (
          <div className="space-y-3">
            {approvedWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-4 border border-green-500/30 rounded-lg bg-green-500/5">
                <div className="flex-1">
                  <p className="font-bold text-lg">R{withdrawal.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {withdrawal.profiles?.name} ({withdrawal.profiles?.email})
                  </p>
                  <p className="text-xs text-green-600">✓ Approved - Awaiting dispatch</p>
                </div>
                <Button
                  onClick={() => handleMarkAsSent(withdrawal.id)}
                  disabled={processing[withdrawal.id]}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing[withdrawal.id] ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><SendIcon className="w-4 h-4 mr-2" /> Mark as Sent</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
