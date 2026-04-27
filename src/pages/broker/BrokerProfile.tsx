import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";

const BrokerProfile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    dateOfBirth: "",
    zipCode: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load from profiles table
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setProfile({
          email: user.email || "",
          fullName: profileData?.full_name || user.user_metadata?.full_name || "",
          phone: (profileData as any)?.phone || "",
          address: (profileData as any)?.address || "",
          city: (profileData as any)?.city || "",
          country: (profileData as any)?.country || "",
          zipCode: (profileData as any)?.zip_code || "",
          dateOfBirth: (profileData as any)?.date_of_birth || "",
        });
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: profile.fullName }
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          full_name: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          country: profile.country,
          zip_code: profile.zipCode,
          date_of_birth: profile.dateOfBirth || null,
        } as any)
        .eq("user_id", user.id);
      if (profileError) throw profileError;

      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-broker-primary/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-broker-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.fullName || "User"}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="pl-10 bg-secondary border-border"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="pl-10 bg-secondary border-border opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="pl-10 bg-secondary border-border"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="dob"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="pl-10 bg-secondary border-border"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="bg-secondary border-border"
                placeholder="Enter your city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="bg-secondary border-border"
                placeholder="Enter your country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={profile.zipCode}
                onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                className="bg-secondary border-border"
                placeholder="Enter your zip code"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerProfile;
