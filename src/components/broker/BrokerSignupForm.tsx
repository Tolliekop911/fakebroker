import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Eye, EyeOff, Upload, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { recordLoginHistory } from "@/lib/loginHistory";

interface FormData {
  // Step 1 - Personal Details
  firstName: string;
  lastName: string;
  login: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  // Step 2 - Address Information
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  // Step 3 - Employment/Financial Info
  employmentStatus: string;
  investmentObjective: string;
  investmentObjectiveOther: string;
  jobTitle: string;
  revenueSource: string;
  plannedInvestment: string;
  netWorth: string;
  // Step 4 - Verification
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
  proofOfAddress: File | null;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  login: "",
  dateOfBirth: "",
  phoneNumber: "",
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
  addressLine1: "",
  addressLine2: "",
  country: "",
  state: "",
  city: "",
  zipCode: "",
  employmentStatus: "",
  investmentObjective: "",
  investmentObjectiveOther: "",
  jobTitle: "",
  revenueSource: "",
  plannedInvestment: "",
  netWorth: "",
  idFront: null,
  idBack: null,
  selfie: null,
  proofOfAddress: null,
};

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Spain", "Italy", "Netherlands", "Switzerland", "Singapore",
  "Japan", "South Africa", "Brazil", "Mexico", "India", "UAE"
];

const employmentStatuses = [
  "Please Select", "Employed", "Self Employed", "Unemployed", "Student", "Retired"
];

const investmentObjectives = [
  "Please Select", "Investment", "Speculation", "Hedging", "Other"
];

const revenueSources = [
  "Please Select", "Salary", "Investment", "Business", "Inheritance", "Savings", "Other"
];

// Employment statuses that require Position/Job Title
const requiresJobTitle = (status: string) => 
  ["Employed", "Self Employed"].includes(status);

const BrokerSignupForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateField = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.password || !formData.dateOfBirth || !formData.phoneNumber) {
          toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
          return false;
        }
        if (formData.email !== formData.confirmEmail) {
          toast({ title: "Error", description: "Emails do not match", variant: "destructive" });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
          return false;
        }
        if (formData.password.length < 6) {
          toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!formData.addressLine1 || !formData.country || !formData.state || !formData.city) {
          toast({ title: "Error", description: "Please fill in all required address fields", variant: "destructive" });
          return false;
        }
        return true;
      case 3:
        if (!formData.employmentStatus || formData.employmentStatus === "Please Select" ||
            !formData.investmentObjective || formData.investmentObjective === "Please Select" ||
            !formData.revenueSource || formData.revenueSource === "Please Select") {
          toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
          return false;
        }
        if (requiresJobTitle(formData.employmentStatus) && !formData.jobTitle) {
          toast({ title: "Error", description: "Position / Job Title is required for your employment status", variant: "destructive" });
          return false;
        }
        if (formData.investmentObjective === "Other" && !formData.investmentObjectiveOther.trim()) {
          toast({ title: "Error", description: "Please specify your investment objective", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Check if the same file is already used for a different field
  const isDuplicateFile = (file: File, targetField: keyof FormData): string | null => {
    const fileFields: (keyof FormData)[] = ["idFront", "idBack", "selfie", "proofOfAddress"];
    const fieldLabels: Record<string, string> = {
      idFront: "ID Front",
      idBack: "ID Back",
      selfie: "Selfie with ID",
      proofOfAddress: "Proof of Address",
    };
    for (const field of fileFields) {
      if (field === targetField) continue;
      const existingFile = formData[field] as File | null;
      if (existingFile && existingFile.name === file.name && existingFile.size === file.size && existingFile.lastModified === file.lastModified) {
        return fieldLabels[field];
      }
    }
    return null;
  };

  const handleFileChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const duplicate = isDuplicateFile(file, field);
      if (duplicate) {
        setFileErrors(prev => ({ ...prev, [field]: `This file is already used for "${duplicate}". Please upload a different file.` }));
        e.target.value = "";
        return;
      }
    }
    setFileErrors(prev => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
    updateField(field, file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phoneNumber,
            account_type: "broker",
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await recordLoginHistory(data.user.id);
        
        await supabase.from("profiles").insert({
          user_id: data.user.id,
          email: formData.email,
          full_name: `${formData.firstName} ${formData.lastName}`,
          account_type: "broker",
        });
      }

      toast({ title: "Account created!", description: "Welcome to Kubera Markets." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="bg-gradient-to-r from-broker-primary to-broker-primary/80 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-white text-center mb-4">Client Application Form</h2>
      <div className="flex items-center justify-between px-4">
        {[1, 2, 3, 4].map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${step >= s ? 'bg-white' : 'bg-white/40'}`} />
              <span className={`text-xs md:text-sm text-white/90 mt-2 ${step >= s ? 'font-bold' : ''}`}>
                STEP {s}
              </span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${step > s ? 'bg-white' : 'bg-white/40'}`} />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">Personal Details</h3>
        <p className="text-muted-foreground text-sm">Please provide proper details. Use a real email address.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm" className="mt-2 bg-broker-primary text-broker-primary-foreground hover:bg-broker-primary/90 border-0 rounded-full w-8 h-8 p-0">
            <Upload className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">First Name <span className="text-red-500">*</span></Label>
            <Input
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Last Name <span className="text-red-500">*</span></Label>
            <Input
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-muted-foreground">Login <span className="text-red-500">*</span></Label>
            <Input
              value={formData.login}
              onChange={(e) => updateField("login", e.target.value)}
              className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Date of Birth <span className="text-red-500">*</span></Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Phone Number <span className="text-red-500">*</span></Label>
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Email <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Confirmation Email <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            value={formData.confirmEmail}
            onChange={(e) => updateField("confirmEmail", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Confirm Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">Address Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Address Line 1 <span className="text-red-500">*</span></Label>
          <Input
            value={formData.addressLine1}
            onChange={(e) => updateField("addressLine1", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Address Line 2</Label>
          <Input
            value={formData.addressLine2}
            onChange={(e) => updateField("addressLine2", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Country <span className="text-red-500">*</span></Label>
          <Select value={formData.country} onValueChange={(v) => updateField("country", v)}>
            <SelectTrigger className="border-0 border-b border-border rounded-none bg-transparent">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">State <span className="text-red-500">*</span></Label>
          <Input
            value={formData.state}
            onChange={(e) => updateField("state", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">City <span className="text-red-500">*</span></Label>
          <Input
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Zip code</Label>
          <Input
            value={formData.zipCode}
            onChange={(e) => updateField("zipCode", e.target.value)}
            className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const jobTitleRequired = requiresJobTitle(formData.employmentStatus);
    const showOtherObjective = formData.investmentObjective === "Other";

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold">EMPLOYMENT INFORMATION</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Employment Status <span className="text-red-500">*</span></Label>
            <Select value={formData.employmentStatus} onValueChange={(v) => updateField("employmentStatus", v)}>
              <SelectTrigger className="border-0 border-b border-border rounded-none bg-transparent">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {employmentStatuses.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Investment Objective <span className="text-red-500">*</span></Label>
            <Select value={formData.investmentObjective} onValueChange={(v) => {
              updateField("investmentObjective", v);
              if (v !== "Other") updateField("investmentObjectiveOther", "");
            }}>
              <SelectTrigger className="border-0 border-b border-border rounded-none bg-transparent">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {investmentObjectives.map(o => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showOtherObjective && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Please specify your investment objective <span className="text-red-500">*</span></Label>
            <Textarea
              value={formData.investmentObjectiveOther}
              onChange={(e) => updateField("investmentObjectiveOther", e.target.value)}
              placeholder="Describe your investment objective..."
              className="bg-transparent border-border"
              rows={3}
            />
          </div>
        )}

        <div className="text-center">
          <h3 className="text-xl font-bold">FINANCIAL INFORMATION</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Position / Job Title {jobTitleRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              value={formData.jobTitle}
              onChange={(e) => updateField("jobTitle", e.target.value)}
              className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
              placeholder={jobTitleRequired ? "Required" : "Optional"}
            />
            {jobTitleRequired && !formData.jobTitle && (
              <p className="text-xs text-red-500">Required for {formData.employmentStatus} status</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Revenue Source <span className="text-red-500">*</span></Label>
            <Select value={formData.revenueSource} onValueChange={(v) => updateField("revenueSource", v)}>
              <SelectTrigger className="border-0 border-b border-border rounded-none bg-transparent">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {revenueSources.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Planned Investment Amount <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              placeholder="1000"
              value={formData.plannedInvestment}
              onChange={(e) => updateField("plannedInvestment", e.target.value)}
              className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Approximate Net Worth <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              placeholder="10000"
              value={formData.netWorth}
              onChange={(e) => updateField("netWorth", e.target.value)}
              className="border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderFileUpload = (field: keyof FormData, label: string, required: boolean, inputId: string) => (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
        fileErrors[field as string] ? 'border-red-500' : 'border-border'
      }`}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange(field)}
          className="hidden"
          id={inputId}
        />
        <label htmlFor={inputId} className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {(formData[field] as File | null)?.name || "Click to upload"}
          </p>
        </label>
      </div>
      {fileErrors[field as string] && (
        <p className="text-xs text-red-500">{fileErrors[field as string]}</p>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">Identity Verification</h3>
        <p className="text-muted-foreground text-sm">Upload your documents for verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderFileUpload("idFront", "ID Front", true, "idFront")}
        {renderFileUpload("idBack", "ID Back", false, "idBack")}
        {renderFileUpload("selfie", "Selfie with ID", true, "selfie")}
        {renderFileUpload("proofOfAddress", "Proof of Address", true, "proofOfAddress")}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      {renderStepIndicator()}

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={prevStep}
              className="px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              PREV
            </Button>
          ) : (
            <div />
          )}
          
          {step < 4 ? (
            <Button 
              onClick={nextStep}
              className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground px-8 rounded-lg"
            >
              NEXT
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground px-8 rounded-lg"
            >
              {loading ? "Creating Account..." : "Complete Registration"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerSignupForm;
