import { useState, useEffect, useRef } from "react";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Check, Clock, X, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KycSubmission {
  id: string;
  document_type: string;
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  address_proof_url: string | null;
  status: string;
  submitted_at: string;
  rejection_reason: string | null;
}

const BrokerDocuments = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const [documentType, setDocumentType] = useState("");
  const [files, setFiles] = useState<{
    front: File | null;
    back: File | null;
    selfie: File | null;
    residency: File | null;
  }>({ front: null, back: null, selfie: null, residency: null });

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const residencyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from("kyc_submissions")
          .select("*")
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false });
        setKycSubmissions(data || []);
      }
      setLoading(false);
    };
    loadDocuments();
  }, []);

  const handleSubmit = async () => {
    if (!documentType) {
      toast({ title: "Error", description: "Please select a document type", variant: "destructive" });
      return;
    }
    if (!files.front) {
      toast({ title: "Error", description: "Please upload the document front", variant: "destructive" });
      return;
    }
    if (!files.selfie) {
      toast({ title: "Error", description: "Please upload a selfie with document", variant: "destructive" });
      return;
    }
    if (!files.residency) {
      toast({ title: "Error", description: "Please upload proof of residency", variant: "destructive" });
      return;
    }
    if (!userId) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("kyc_submissions")
        .insert({
          user_id: userId,
          document_type: documentType,
          status: "pending",
          document_front_url: `pending-${files.front.name}`,
          document_back_url: files.back ? `pending-${files.back.name}` : null,
          selfie_url: `pending-${files.selfie.name}`,
          address_proof_url: `pending-${files.residency.name}`,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setKycSubmissions(prev => [data as KycSubmission, ...prev]);
        setDocumentType("");
        setFiles({ front: null, back: null, selfie: null, residency: null });
        toast({ title: "Documents Submitted", description: "Your verification documents are under review." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/10 text-green-500";
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "rejected": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <Check className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "rejected": return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  const FileUploadBox = ({ label, required, fileKey, inputRef, icon: Icon }: {
    label: string;
    required?: boolean;
    fileKey: keyof typeof files;
    inputRef: React.RefObject<HTMLInputElement>;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <div>
      <Label className="mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          files[fileKey]
            ? "border-broker-primary bg-broker-primary/5"
            : "border-border hover:border-broker-primary/50"
        }`}
      >
        <Icon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        {files[fileKey] ? (
          <p className="text-sm text-broker-primary font-medium">{files[fileKey]!.name}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Click to upload</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setFiles(prev => ({ ...prev, [fileKey]: file }));
        }}
      />
    </div>
  );

  const verifiedCount = kycSubmissions.filter(s => s.status === "approved").length;
  const totalRequired = 4;
  const progressPercent = Math.round((verifiedCount / totalRequired) * 100);

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Upload className="w-6 h-6 text-broker-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold">Submit Verification Documents</h1>
            <p className="text-muted-foreground">Please upload clear photos of your government-issued ID and a selfie for verification.</p>
          </div>
        </div>

        {/* Verification Progress */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Verification Status</h2>
            <span className={`text-sm px-3 py-1 rounded-full ${
              verifiedCount === totalRequired
                ? "bg-green-500/10 text-green-500"
                : verifiedCount > 0
                ? "bg-yellow-500/10 text-yellow-500"
                : "bg-muted text-muted-foreground"
            }`}>
              {verifiedCount === totalRequired ? "Fully Verified" : verifiedCount > 0 ? "Partially Verified" : "Not Verified"}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-broker-primary h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{verifiedCount} of {totalRequired} documents verified</p>
        </div>

        {/* Upload Form */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <Label>
              Document Type <span className="text-red-500">*</span>
            </Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national_id">National ID Card</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
              </SelectContent>
            </Select>
            {!documentType && (
              <p className="text-sm text-red-500">You must select a document type before uploading</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadBox label="Document Front" required fileKey="front" inputRef={frontRef as React.RefObject<HTMLInputElement>} icon={FileText} />
            <FileUploadBox label="Document Back (if applicable)" fileKey="back" inputRef={backRef as React.RefObject<HTMLInputElement>} icon={FileText} />
          </div>

          <FileUploadBox label="Selfie with Document" required fileKey="selfie" inputRef={selfieRef as React.RefObject<HTMLInputElement>} icon={Camera} />

          <div>
            <FileUploadBox label="Proof of Residency" required fileKey="residency" inputRef={residencyRef as React.RefObject<HTMLInputElement>} icon={FileText} />
            <p className="text-sm text-muted-foreground mt-2">
              Utility bill, bank statement, or government letter. <strong>Must not be older than 3 months.</strong>
            </p>
          </div>

          <p className="text-xs text-muted-foreground">* Required fields. Accepted formats: JPG, PNG, PDF. Max file size: 5MB.</p>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !documentType}
              className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Documents"}
            </Button>
          </div>
        </div>

        {/* Previous Submissions */}
        {kycSubmissions.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Previous Submissions</h2>
            <div className="space-y-3">
              {kycSubmissions.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-broker-primary" />
                    <div>
                      <p className="font-medium">{doc.document_type}</p>
                      <p className="text-xs text-muted-foreground">Submitted: {new Date(doc.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${getStatusStyles(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerDocuments;
