import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Eye,
  Filter,
  Loader2,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Payout {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
  // Joined data
  user_email?: string;
  user_name?: string;
}

const AdminFinance = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("payouts")
        .select("*")
        .order("requested_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles for each payout
      const payoutsWithUsers = await Promise.all(
        (data || []).map(async (payout) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("user_id", payout.user_id)
            .single();

          return {
            ...payout,
            user_email: profile?.email,
            user_name: profile?.full_name,
          };
        })
      );

      setPayouts(payoutsWithUsers);
    } catch (error) {
      console.error("Error fetching payouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (payoutId: string, newStatus: string) => {
    setProcessingId(payoutId);
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "paid" || newStatus === "rejected") {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("payouts")
        .update(updateData)
        .eq("id", payoutId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Payout marked as ${newStatus}`,
      });

      fetchPayouts();
    } catch (error) {
      console.error("Error updating payout:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payout status",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayouts = payouts.filter(
    (p) =>
      p.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs rounded bg-yellow-500/10 text-yellow-500">Pending</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-500">Approved</span>;
      case "paid":
        return <span className="px-2 py-1 text-xs rounded bg-green-500/10 text-green-500">Paid</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs rounded bg-destructive/10 text-destructive">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">{status}</span>;
    }
  };

  const stats = {
    pending: payouts.filter((p) => p.status === "pending").length,
    pendingAmount: payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0),
    approved: payouts.filter((p) => p.status === "approved").length,
    paidThisMonth: payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary/30 border-b border-border/20 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold">Finance Management</h1>
            <p className="text-sm text-muted-foreground">Process withdrawal requests and payouts</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(stats.pendingAmount)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Approved</span>
            </div>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Paid This Month</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.paidThisMonth)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Requests</span>
            </div>
            <p className="text-2xl font-bold">{payouts.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "approved", "paid", "rejected"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No payout requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Requested</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="border-t border-border/50 hover:bg-muted/20">
                      <td className="py-4 px-4">
                        <p className="font-medium">{payout.user_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{payout.user_email}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold">{formatCurrency(payout.amount)}</td>
                      <td className="py-4 px-4">{payout.payment_method || "Not specified"}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(payout.requested_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(payout.status)}</td>
                      <td className="py-4 px-4">
                        {processingId === payout.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : payout.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-500 hover:bg-green-500/10"
                              onClick={() => handleStatusChange(payout.id, "approved")}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleStatusChange(payout.id, "rejected")}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : payout.status === "approved" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-500 hover:bg-green-500/10"
                            onClick={() => handleStatusChange(payout.id, "paid")}
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;
