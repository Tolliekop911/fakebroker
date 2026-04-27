import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Eye, Check, X, Loader2, ExternalLink, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Strategy {
  id: string;
  user_id: string;
  account_id: string;
  file_url: string;
  file_name: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_email?: string;
  account_number?: string;
}

const StrategyReview = () => {
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from("trader_strategies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user emails and account numbers
      const userIds = [...new Set((data || []).map(s => s.user_id))];
      const accountIds = [...new Set((data || []).map(s => s.account_id))];

      const [profilesRes, accountsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, email").in("user_id", userIds),
        supabase.from("accounts").select("id, account_number").in("id", accountIds),
      ]);

      const profileMap = (profilesRes.data || []).reduce((acc: Record<string, string>, p) => {
        acc[p.user_id] = p.email || "";
        return acc;
      }, {});

      const accountMap = (accountsRes.data || []).reduce((acc: Record<string, string>, a) => {
        acc[a.id] = a.account_number;
        return acc;
      }, {});

      setStrategies(
        (data || []).map(s => ({
          ...s,
          user_email: profileMap[s.user_id],
          account_number: accountMap[s.account_id],
        }))
      );
    } catch (e) {
      console.error("Error loading strategies:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedStrategy) return;
    
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("trader_strategies")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          admin_notes: adminNotes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedStrategy.id);

      if (error) throw error;

      toast({
        title: action === "approve" ? "Strategy Approved" : "Strategy Rejected",
        description: `The strategy has been ${action === "approve" ? "approved" : "rejected"}`,
      });

      setSelectedStrategy(null);
      setAdminNotes("");
      loadStrategies();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update strategy",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Strategy Reviews
        </h2>
        <p className="text-muted-foreground">
          Review trader strategy documents for funded accounts
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trader</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No strategy documents submitted yet
                </TableCell>
              </TableRow>
            ) : (
              strategies.map((strategy) => (
                <TableRow key={strategy.id}>
                  <TableCell className="font-medium">
                    {strategy.user_email || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {strategy.account_number || strategy.account_id.slice(0, 8)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <a
                      href={strategy.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      {strategy.file_name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(strategy.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStrategy(strategy);
                        setAdminNotes(strategy.admin_notes || "");
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedStrategy} onOpenChange={(open) => !open && setSelectedStrategy(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Strategy Document</DialogTitle>
            <DialogDescription>
              Review the trader's strategy and approve or reject it
            </DialogDescription>
          </DialogHeader>

          {selectedStrategy && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Trader:</span>
                  <p className="font-medium">{selectedStrategy.user_email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account:</span>
                  <p className="font-medium">{selectedStrategy.account_number}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <a
                  href={selectedStrategy.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <FileText className="w-5 h-5" />
                  {selectedStrategy.file_name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (optional)</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleAction("reject")}
                  variant="destructive"
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                  Reject
                </Button>
                <Button
                  onClick={() => handleAction("approve")}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrategyReview;