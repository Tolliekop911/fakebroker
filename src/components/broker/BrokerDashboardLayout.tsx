import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Shield, FileText, LogOut, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BrokerSidebar from "./BrokerSidebar";
import type { User as SupaUser } from "@supabase/supabase-js";

interface BrokerDashboardLayoutProps {
  children: React.ReactNode;
}

const BrokerDashboardLayout = ({ children }: BrokerDashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/login");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-broker-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <BrokerSidebar isOpen={sidebarOpen} />

      <main className="flex-1 overflow-auto">
        <header className="bg-secondary/30 border-b border-border/20 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 hover:bg-muted/50 rounded-lg px-3 py-2 transition-colors"
            >
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <div className="w-10 h-10 bg-broker-primary/20 rounded-full flex items-center justify-center">
                <span className="text-broker-primary font-semibold">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl z-50">
                <Link
                  to="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/security"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Security
                </Link>
                <Link
                  to="/documents"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  KYC Documents
                </Link>
                <div className="border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive hover:bg-muted/50 rounded-b-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default BrokerDashboardLayout;
