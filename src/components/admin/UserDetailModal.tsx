import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Shield } from "lucide-react";

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  onRefresh?: () => void;
}

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  equity: number;
  status: string;
  condor_account_id: string | null;
  deposit_confirmed: boolean;
  leverage: string | null;
}

const UserDetailModal = ({ open, onOpenChange, userId, userEmail, userName, onRefresh }: UserDetailModalProps) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userRole, setUserRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newAccountType, setNewAccountType] = useState("broker");
  const [newAccountLeverage, setNewAccountLeverage] = useState("1:100");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    loadData();
  }, [open, userId]);

  const loadData = async () => {
    setLoading(true);
    const [accountsRes, rolesRes] = await Promise.all([
      supabase.from("accounts").select("id, account_number, account_type, balance, equity, status, condor_account_id, deposit_confirmed, leverage").eq("user_id", userId),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setAccounts(accountsRes.data || []);
    setUserRole((rolesRes.data || [])[0]?.role || "user");
    setLoading(false);
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      const accountNumber = `KM-${Date.now().toString().slice(-8)}`;
      const { error } = await supabase.from("accounts").insert({
        user_id: userId,
        account_number: accountNumber,
        account_type: newAccountType,
        leverage: newAccountLeverage,
        status: "active",
        balance: 0,
        equity: 0,
        account_size: 0,
      });
      if (error) throw error;
      toast({ title: "Account Created", description: `Account ${accountNumber} created for ${userEmail}` });
      setShowCreateAccount(false);
      loadData();
      onRefresh?.();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <Label className="text-muted-foreground text-xs">Name</Label>
              <p className="font-semibold">{userName || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <p className="font-semibold">{userEmail || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Role</Label>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-semibold capitalize">{userRole}</span>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Total Accounts</Label>
              <p className="font-semibold">{accounts.length}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Accounts</h3>
            <Button size="sm" onClick={() => setShowCreateAccount(!showCreateAccount)}>
              <Plus className="w-4 h-4 mr-1" /> Create Account
            </Button>
          </div>

          {showCreateAccount && (
            <div className="p-4 border border-border rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Account Type</Label>
                  <Select value={newAccountType} onValueChange={setNewAccountType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broker">Broker (Live)</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Leverage</Label>
                  <Select value={newAccountLeverage} onValueChange={setNewAccountLeverage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:30">1:30</SelectItem>
                      <SelectItem value="1:100">1:100</SelectItem>
                      <SelectItem value="1:200">1:200</SelectItem>
                      <SelectItem value="1:500">1:500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateAccount} disabled={creating} size="sm">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Create
              </Button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : accounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No accounts</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-semibold">{acc.account_number}</p>
                    <p className="text-xs text-muted-foreground">{acc.account_type} • {acc.leverage} • {acc.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${Number(acc.balance).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {acc.condor_account_id ? `Condor: ${acc.condor_account_id}` : "No Condor ID"}
                      {acc.deposit_confirmed ? " • Funded" : " • Unfunded"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
