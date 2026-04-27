import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AccountProvisioningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userName?: string;
  onSuccess: () => void;
}

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 200000];
const PROGRAM_TYPES = [
  { value: "1-step", label: "1 Step" },
  { value: "2-step", label: "2 Step" },
  { value: "halfway-1", label: "Halfway There (1-Step)" },
  { value: "halfway-2", label: "Halfway There (2-Step)" },
];
const PHASES = [
  { value: "phase1", label: "Phase 1 (Evaluation)" },
  { value: "phase2", label: "Phase 2 (Verification)" },
  { value: "funded", label: "Funded Account" },
];

const AccountProvisioningModal = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
  onSuccess,
}: AccountProvisioningModalProps) => {
  const [accountSize, setAccountSize] = useState<string>("50000");
  const [programType, setProgramType] = useState<string>("1-step");
  const [phase, setPhase] = useState<string>("phase1");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const size = parseInt(accountSize);
      const accountNumber = `PROP-${Date.now().toString().slice(-6)}`;

      // Determine status based on phase
      const status = phase === "funded" ? "active" : "active";
      const accountPhase = phase === "funded" ? "funded" : "evaluation";

      const { error: accountError, data: accountData } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          account_number: accountNumber,
          account_type: "prop",
          account_size: size,
          balance: size,
          equity: size,
          status: status,
          phase: accountPhase,
          program_type: programType.replace("halfway-", ""),
        })
        .select()
        .single();

      if (accountError) throw accountError;

      // Create challenge based on program and phase
      const challengeNumber = `CH-${Date.now().toString().slice(-8)}`;
      const profitTargetPercent = phase === "phase1" ? 8 : phase === "phase2" ? 5 : 0;
      const profitTargetAmount = size * (profitTargetPercent / 100);

      await supabase.from("challenges").insert({
        user_id: userId,
        account_id: accountData.id,
        challenge_number: challengeNumber,
        program_type: programType.replace("halfway-", ""),
        account_size: size,
        current_balance: size,
        profit_target_percent: profitTargetPercent,
        profit_target_amount: profitTargetAmount,
        max_drawdown_percent: 10,
        max_drawdown_amount: size * 0.10,
        phase: phase,
        status: "active",
      });

      toast({
        title: "Account Created",
        description: `${formatMoney(size)} ${programType} account (${phase}) issued to ${userName || userEmail}`,
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setAccountSize("50000");
      setProgramType("1-step");
      setPhase("phase1");
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Issue New Account
          </DialogTitle>
          <DialogDescription>
            Create a new trading account for {userName || userEmail}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Account Size</Label>
            <Select value={accountSize} onValueChange={setAccountSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select account size" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {formatMoney(size)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Program Type</Label>
            <Select value={programType} onValueChange={setProgramType}>
              <SelectTrigger>
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAM_TYPES.map((program) => (
                  <SelectItem key={program.value} value={program.value}>
                    {program.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Starting Phase</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger>
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                {PHASES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User</span>
              <span className="font-medium">{userName || userEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Size</span>
              <span className="font-medium">{formatMoney(parseInt(accountSize))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Program</span>
              <span className="font-medium">{PROGRAM_TYPES.find(p => p.value === programType)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phase</span>
              <span className="font-medium">{PHASES.find(p => p.value === phase)?.label}</span>
            </div>
          </div>

          <Button onClick={handleCreateAccount} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Issue Account
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountProvisioningModal;
