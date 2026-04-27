import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Wallet, Monitor, Building2, Bitcoin, ArrowLeft, CheckCircle, Upload, FileText } from "lucide-react";
import CreditCardFormComponent from "@/components/CreditCardForm";

const BrokerOpenAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    accountType: "",
    leverage: "",
    depositAmount: "",
    paymentMethod: "",
  });

  const [bankName, setBankName] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const isDemo = form.accountType === "demo";
  const depositAmt = parseFloat(form.depositAmount || "0");

  const createAccount = async (paymentRef: string, paymentStatus: "pending" | "confirmed") => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const accountNumber = `KM-${Date.now().toString().slice(-8)}`;
      const balance = isDemo ? 10000 : depositAmt;

      const { error: accErr } = await supabase.from("accounts").insert({
        user_id: user.id,
        account_number: accountNumber,
        account_type: isDemo ? "demo" : "broker",
        account_size: balance,
        balance,
        equity: balance,
        leverage: form.leverage,
        status: paymentStatus === "confirmed" ? "active" : "pending",
        program_type: isDemo ? "demo" : form.accountType,
      });
      if (accErr) throw accErr;

      if (!isDemo) {
        await supabase.from("deposits").insert({
          user_id: user.id,
          amount: depositAmt,
          payment_method: form.paymentMethod,
          reference_number: paymentRef,
          status: paymentStatus,
          created_at: new Date().toISOString(),
        });
      }

      setStep(5);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCardSuccess = (ref: string) => createAccount(ref, "confirmed");

  const handleBankSubmit = async () => {
    if (!bankName || !bankRef) {
      toast({ title: "Missing fields", description: "Please fill in your name and payment reference", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (proofFile) {
        const fileExt = proofFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        await supabase.storage.from("payment-proofs").upload(filePath, proofFile).catch(() => {});
      }

      await createAccount(`WIRE-${Date.now()}`, "pending");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handleCryptoSubmit = () => createAccount(`CRYPTO-${Date.now()}`, "pending");

  const handleDemoCreate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const accountNumber = `KM-${Date.now().toString().slice(-8)}`;
      const { error } = await supabase.from("accounts").insert({
        user_id: user.id,
        account_number: accountNumber,
        account_type: "demo",
        account_size: 10000,
        balance: 10000,
        equity: 10000,
        leverage: form.leverage,
        status: "active",
        program_type: "demo",
      });
      if (error) throw error;
      setStep(5);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrokerDashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Open Account</h1>
          <p className="text-muted-foreground">Set up your new trading account</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? "bg-broker-primary text-broker-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className={`text-sm ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Account Type" : s === 2 ? "Deposit" : "Payment"}
              </span>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-broker-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* STEP 1: Account Type */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Choose Account Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "standard", label: "Standard Account", desc: "From 1.8 pips, Min $100", icon: Wallet },
                { value: "pro", label: "Pro Account", desc: "From 0.9 pips, Min $1,000", icon: CreditCard },
                { value: "demo", label: "Demo Account", desc: "$10,000 virtual funds", icon: Monitor },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setForm({ ...form, accountType: type.value })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    form.accountType === type.value
                      ? "border-broker-primary bg-broker-primary/5"
                      : "border-border hover:border-broker-primary/50"
                  }`}
                >
                  <type.icon className={`w-8 h-8 mb-3 ${form.accountType === type.value ? "text-broker-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.desc}</p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Leverage</Label>
              <Select value={form.leverage} onValueChange={(v) => setForm({ ...form, leverage: v })}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select leverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:10">1:10</SelectItem>
                  <SelectItem value="1:25">1:25</SelectItem>
                  <SelectItem value="1:50">1:50</SelectItem>
                  <SelectItem value="1:100">1:100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (!form.accountType || !form.leverage) {
                    toast({ title: "Error", description: "Please select account type and leverage", variant: "destructive" });
                    return;
                  }
                  isDemo ? handleDemoCreate() : setStep(2);
                }}
                disabled={loading}
                className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground"
              >
                {isDemo
                  ? (loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Demo Account")
                  : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Deposit Amount */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Deposit Amount</h2>
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                placeholder={form.accountType === "pro" ? "Minimum $1,000" : "Minimum $100"}
                value={form.depositAmount}
                onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                className="bg-secondary border-border text-lg"
                min={form.accountType === "pro" ? 1000 : 100}
              />
              <p className="text-xs text-muted-foreground">
                Minimum deposit: {form.accountType === "pro" ? "$1,000" : "$100"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Enter the exact amount you intend to deposit. Your account will be activated once the deposit is confirmed.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                onClick={() => {
                  const min = form.accountType === "pro" ? 1000 : 100;
                  const amt = parseFloat(form.depositAmount);
                  if (isNaN(amt) || amt < min) {
                    toast({ title: "Error", description: `Minimum deposit is $${min}`, variant: "destructive" });
                    return;
                  }
                  setStep(3);
                }}
                className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Method Picker */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, Amex" },
                { value: "bank_transfer", label: "Bank Transfer", icon: Building2, desc: "Wire / EFT" },
                { value: "crypto", label: "Cryptocurrency", icon: Bitcoin, desc: "USDT, BTC & more" },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setForm({ ...form, paymentMethod: method.value })}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    form.paymentMethod === method.value
                      ? "border-broker-primary bg-broker-primary/5"
                      : "border-border hover:border-broker-primary/50"
                  }`}
                >
                  <method.icon className={`w-7 h-7 mb-2 ${form.paymentMethod === method.value ? "text-broker-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-semibold text-sm">{method.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
                </button>
              ))}
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <h3 className="font-semibold mb-3">Account Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Type</span>
                <span className="capitalize">{form.accountType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Leverage</span>
                <span>{form.leverage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit</span>
                <span>${depositAmt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="capitalize">{form.paymentMethod.replace("_", " ") || "—"}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button
                onClick={() => {
                  if (!form.paymentMethod) {
                    toast({ title: "Error", description: "Please select a payment method", variant: "destructive" });
                    return;
                  }
                  setStep(4);
                }}
                className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Payment Detail */}
        {step === 4 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Choose different method
            </button>

            <div className="bg-secondary/50 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount due</span>
              <span className="font-bold text-lg">${depositAmt.toLocaleString()}</span>
            </div>

            {/* CARD */}
            {form.paymentMethod === "card" && (
              <CreditCardFormComponent
                amount={depositAmt}
                currency="$"
                onSuccess={handleCardSuccess}
                onCancel={() => setStep(3)}
                submitLabel={`Pay $${depositAmt.toLocaleString()}`}
              />
            )}

            {/* BANK TRANSFER */}
            {form.paymentMethod === "bank_transfer" && (
              <div className="space-y-5">
                <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm space-y-3">
                  <h3 className="font-semibold font-sans text-base mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Bank Details
                  </h3>
                  {[
                    ["Bank", "First National Bank"],
                    ["Account No.", "62847391056"],
                    ["Branch Code", "250655"],
                    ["Account Name", "Kondor Markets (Pty) Ltd"],
                    ["Reference", `${form.accountType.toUpperCase()}-DEPOSIT`],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[130px_1fr] gap-1">
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400">
                  Include your email as payment reference for faster processing.
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Your Full Name *</Label>
                    <Input placeholder="Name on your bank account" value={bankName} onChange={(e) => setBankName(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-1">
                    <Label>Reference Used in Transfer *</Label>
                    <Input placeholder="What reference did you use?" value={bankRef} onChange={(e) => setBankRef(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-1">
                    <Label>Proof of Payment (optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-5 text-center">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="hidden" id="proof-upload" />
                      <label htmlFor="proof-upload" className="cursor-pointer">
                        {proofFile ? (
                          <div className="flex items-center justify-center gap-2 text-broker-primary">
                            <FileText className="w-5 h-5" />
                            <span className="font-medium text-sm">{proofFile.name}</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-7 h-7 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">Click to upload screenshot / PDF</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
                  <Button onClick={handleBankSubmit} disabled={loading} className="flex-1 bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Transfer Confirmation"}
                  </Button>
                </div>
              </div>
            )}

            {/* CRYPTO */}
            {form.paymentMethod === "crypto" && (
              <div className="space-y-5">
                <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm space-y-3">
                  <h3 className="font-semibold font-sans text-base mb-2 flex items-center gap-2">
                    <Bitcoin className="w-4 h-4" /> Crypto Wallet Addresses
                  </h3>
                  {[
                    ["USDT (TRC20)", "TQn8i7oNgqQY9kHYzm4PXzDsQHJbK6GVcT"],
                    ["BTC", "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
                    ["ETH / USDT (ERC20)", "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"],
                  ].map(([label, addr]) => (
                    <div key={label} className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">{label}:</span>
                      <p className="font-semibold break-all text-xs">{addr}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400">
                  Send exactly <strong>${depositAmt.toLocaleString()} USD</strong> equivalent. Your account will be activated within 1–2 hours after network confirmation.
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
                  <Button onClick={handleCryptoSubmit} disabled={loading} className="flex-1 bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "I've Sent the Payment"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Success */}
        {step === 5 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isDemo ? "Demo Account Created!" : form.paymentMethod === "card" ? "Payment Successful!" : "Submission Received!"}
              </h2>
              <p className="text-muted-foreground">
                {isDemo
                  ? "Your $10,000 demo account is ready to trade."
                  : form.paymentMethod === "card"
                  ? `Your $${depositAmt.toLocaleString()} deposit has been confirmed. Your account is now active.`
                  : "Your payment details have been submitted. Your account will be activated within 24–48 hours after confirmation."}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/broker/accounts")}>View Accounts</Button>
              <Button onClick={() => navigate("/broker/dashboard")} className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerOpenAccount;
