import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingUser {
  id: string;
  email: string;
  name: string;
  approval_status: string;
  created_at: string;
}

interface PendingDeposit {
  id: string;
  user_id: string;
  amount: number;
  reference_number: string;
  status: string;
  created_at: string;
  profiles?: { name: string; email: string };
}

export default function AdminApprovals() {
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Get pending user approvals
      const { data: users } = await supabase
        .from("profiles")
        .select("id, email, name, approval_status, created_at")
        .eq("approval_status", "pending");

      // Get pending deposits
      const { data: deposits } = await supabase
        .from("deposits")
        .select("id, user_id, amount, reference_number, status, created_at, profiles(name, email)")
        .eq("status", "pending");

      setPendingUsers((users || []) as PendingUser[]);
      setPendingDeposits((deposits || []) as PendingDeposit[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleApproveUser = async (userId: string) => {
    const { data: admin } = await supabase.auth.getUser();
    if (!admin.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        approval_status: "approved",
        approved_by: admin.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "User approved" });
    setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
  };

  const handleRejectUser = async (userId: string) => {
    const reason = rejectionReason[userId];
    if (!reason) {
      toast({ title: "Error", description: "Please provide rejection reason", variant: "destructive" });
      return;
    }

    const { data: admin } = await supabase.auth.getUser();
    if (!admin.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        approval_status: "rejected",
        rejection_reason: reason,
        approved_by: admin.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "User rejected" });
    setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
  };

  const handleConfirmDeposit = async (depositId: string) => {
    const { data: admin } = await supabase.auth.getUser();
    if (!admin.user) return;

    const { error } = await supabase
      .from("deposits")
      .update({
        status: "confirmed",
        confirmed_by: admin.user.id,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", depositId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Add funds to wallet
    const deposit = pendingDeposits.find((d) => d.id === depositId);
    if (deposit) {
      await supabase.rpc("add_funds_to_wallet", {
        p_user_id: deposit.user_id,
        p_amount: deposit.amount,
      });
    }

    toast({ title: "Success", description: "Deposit confirmed and wallet updated" });
    setPendingDeposits(pendingDeposits.filter((d) => d.id !== depositId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Client Approvals</h1>
        <p className="text-muted-foreground">Manage pending client approvals and deposits</p>
      </div>

      {/* Pending Users */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Pending Client Approvals</h2>
        {pendingUsers.length === 0 ? (
          <p className="text-muted-foreground">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Applied: {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded text-xs font-semibold">
                    Pending
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm">Rejection Reason (if applicable)</label>
                    <Input
                      placeholder="Enter reason if rejecting..."
                      value={rejectionReason[user.id] || ""}
                      onChange={(e) =>
                        setRejectionReason({ ...rejectionReason, [user.id]: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproveUser(user.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectUser(user.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Deposits */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Pending Deposit Confirmations</h2>
        {pendingDeposits.length === 0 ? (
          <p className="text-muted-foreground">No pending deposits</p>
        ) : (
          <div className="space-y-3">
            {pendingDeposits.map((deposit) => (
              <div key={deposit.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-bold">R{deposit.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {deposit.profiles?.name} ({deposit.profiles?.email})
                  </p>
                  <p className="text-xs text-muted-foreground">{deposit.reference_number}</p>
                </div>
                <Button
                  onClick={() => handleConfirmDeposit(deposit.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
