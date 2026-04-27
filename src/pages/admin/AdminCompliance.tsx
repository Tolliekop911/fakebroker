import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Eye,
  FileText,
  Loader2,
  Package,
  User,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface KycSubmission {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  document_type: string;
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  address_proof_url: string | null;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const AdminCompliance = () => {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("kyc_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching KYC submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    setProcessingId(submissionId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("kyc_submissions")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast({
        title: "KYC Approved",
        description: "User verification has been approved",
      });

      fetchSubmissions();
    } catch (error) {
      console.error("Error approving KYC:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve KYC",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) return;
    
    setProcessingId(selectedSubmission.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("kyc_submissions")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason.trim(),
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "KYC Rejected",
        description: "User verification has been rejected",
      });

      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject KYC",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs rounded bg-yellow-500/10 text-yellow-500">Pending</span>;
      case "under_review":
        return <span className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-500">Under Review</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs rounded bg-green-500/10 text-green-500">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs rounded bg-destructive/10 text-destructive">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">{status}</span>;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      passport: "Passport",
      id_card: "ID Card",
      drivers_license: "Driver's License",
    };
    return labels[type] || type;
  };

  const stats = {
    pending: submissions.filter((s) => s.status === "pending").length,
    underReview: submissions.filter((s) => s.status === "under_review").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
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
            <h1 className="text-xl font-heading font-bold">Compliance Management</h1>
            <p className="text-sm text-muted-foreground">Review and process KYC submissions</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Pending Review</span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Under Review</span>
            </div>
            <p className="text-2xl font-bold">{stats.underReview}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
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
            {["all", "pending", "under_review", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Submissions Table */}
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
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No KYC submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Document Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Documents</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Submitted</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-t border-border/50 hover:bg-muted/20">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{submission.user_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{submission.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 text-xs rounded bg-muted">
                          {getDocumentTypeBadge(submission.document_type)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {submission.document_front_url && (
                            <a
                              href={submission.document_front_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> Front
                            </a>
                          )}
                          {submission.document_back_url && (
                            <a
                              href={submission.document_back_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> Back
                            </a>
                          )}
                          {submission.selfie_url && (
                            <a
                              href={submission.selfie_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center gap-1"
                            >
                              <User className="w-3 h-3" /> Selfie
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(submission.status)}</td>
                      <td className="py-4 px-4">
                        {processingId === submission.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : submission.status === "pending" || submission.status === "under_review" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-500 hover:bg-green-500/10"
                              onClick={() => handleApprove(submission.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : submission.status === "rejected" ? (
                          <span className="text-xs text-muted-foreground" title={submission.rejection_reason || ""}>
                            {submission.rejection_reason?.slice(0, 30)}...
                          </span>
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processingId !== null}
            >
              {processingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompliance;
