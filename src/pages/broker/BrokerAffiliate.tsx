import { useState, useEffect } from "react";

import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, BarChart3, DollarSign, Copy, Check, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BrokerAffiliate = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Check localStorage for affiliate status persistence
        const affiliateStatus = localStorage.getItem(`affiliate_${user.id}`);
        setIsAffiliate(affiliateStatus === "applied");
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const referralLink = userId ? `https://kuberamarkets.com/ref/${userId.substring(0, 8).toUpperCase()}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    if (!userId) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem(`affiliate_${userId}`, "applied");
    setIsAffiliate(true);
    setLoading(false);
    toast({ title: "Application Submitted!", description: "Your affiliate application is under review." });
  };

  if (loading) {
    return (
      <BrokerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </BrokerDashboardLayout>
    );
  }

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Affiliate Program</h1>
          <p className="text-muted-foreground">Earn commissions by referring new traders</p>
        </div>

        {!isAffiliate ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center max-w-2xl mx-auto">
            <Users className="w-16 h-16 text-broker-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Join Our Affiliate Program</h2>
            <p className="text-muted-foreground mb-6">
              Earn up to 40% commission on referred traders. Get instant payouts and real-time tracking.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-broker-primary">40%</p>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-broker-primary">$100</p>
                <p className="text-sm text-muted-foreground">Signup Bonus</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-broker-primary">Instant</p>
                <p className="text-sm text-muted-foreground">Payouts</p>
              </div>
            </div>

            <Button 
              onClick={handleApply}
              disabled={loading}
              className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground px-8"
            >
              Apply Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <Users className="w-8 h-8 text-broker-primary mb-4" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <TrendingUp className="w-8 h-8 text-broker-primary mb-4" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Active Traders</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <DollarSign className="w-8 h-8 text-broker-primary mb-4" />
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <BarChart3 className="w-8 h-8 text-broker-primary mb-4" />
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Your Referral Link</h3>
              <div className="flex gap-2">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="bg-secondary border-border font-mono"
                />
                <Button 
                  onClick={copyToClipboard}
                  className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerAffiliate;
