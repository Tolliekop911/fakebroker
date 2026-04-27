import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users,
  Wallet,
  TrendingUp,
  DollarSign,
  Shield,
  Settings,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Search,
  AlertTriangle,
  Eye,
  Ban,
  Bell,
  Loader2,
  Building2,
  Globe,
  BarChart3,
  Monitor,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import LoginHistoryTable from "@/components/admin/LoginHistoryTable";
import UserDetailModal from "@/components/admin/UserDetailModal";
import AccountDetailModal from "@/components/admin/AccountDetailModal";

interface BrokerNotification {
  id: string;
  type: "ticket" | "withdrawal" | "kyc";
  title: string;
  message: string;
  timestamp: Date;
}

type BrokerOverviewStats = {
  totalClients: number;
  activeAccounts: number;
  totalDeposits: number;
  pendingWithdrawals: number;
  totalVolume: number;
  monthlyCommissions: number;
};

interface BrokerUser {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  account_count: number;
}

interface BrokerAccount {
  id: string;
  account_number: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  account_size: number;
  balance: number;
  equity: number;
  leverage: string | null;
  status: string;
  account_type: string;
}

interface BrokerTrade {
  id: string;
  user_id: string;
  user_email?: string;
  account_number?: string;
  symbol: string;
  direction: string;
  lot_size: number;
  pnl: number | null;
  status: string;
}

interface BrokerTicket {
  id: string;
  user_id: string;
  user_email?: string;
  user_role?: string;
  subject: string;
  status: string;
  priority: string | null;
  created_at: string;
}

interface BrokerPayout {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  amount: number;
  status: string;
  payment_method: string | null;
  requested_at: string;
}

const BrokerAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<BrokerNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<BrokerOverviewStats>({
    totalClients: 0,
    activeAccounts: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    totalVolume: 0,
    monthlyCommissions: 0,
  });

  // Dynamic data states
  const [usersData, setUsersData] = useState<BrokerUser[]>([]);
  const [accountsData, setAccountsData] = useState<BrokerAccount[]>([]);
  const [tradesData, setTradesData] = useState<BrokerTrade[]>([]);
  const [ticketsData, setTicketsData] = useState<BrokerTicket[]>([]);
  const [payoutsData, setPayoutsData] = useState<BrokerPayout[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal states
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: string; email: string | null; name: string | null } | null>(null);
  const [accountDetailOpen, setAccountDetailOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Subscribe to new tickets
  useEffect(() => {
    const channel = supabase
      .channel("broker-admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tickets",
        },
        (payload) => {
          const ticket = payload.new as { id: string; subject: string; priority?: string };
          const newNotif: BrokerNotification = {
            id: `ticket-${ticket.id}`,
            type: "ticket",
            title: "New Support Ticket",
            message: ticket.subject,
            timestamp: new Date(),
          };
          setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
          toast({
            title: ticket.priority === "high" ? "Urgent Ticket" : "New Ticket",
            description: ticket.subject,
            variant: ticket.priority === "high" ? "destructive" : "default",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

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

  // Load broker overview stats
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const loadStats = async () => {
      try {
        // Get users who have at least one broker account
        const { data: brokerUserIds } = await supabase
          .from("accounts")
          .select("user_id")
          .eq("account_type", "broker");
        
        const uniqueBrokerUsers = [...new Set((brokerUserIds || []).map(a => a.user_id))];

        const [
          activeAccountsRes,
          depositsRes,
          pendingWithdrawalsRes,
        ] = await Promise.all([
          supabase.from("accounts").select("id", { count: "exact", head: true }).eq("account_type", "broker").eq("status", "active"),
          supabase.from("accounts").select("balance").eq("account_type", "broker").limit(1000),
          supabase.from("payouts").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ]);

        const totalDeposits = (depositsRes.data || []).reduce((sum, r: any) => sum + Number(r.balance || 0), 0);

        if (!mounted) return;

        setStats({
          totalClients: uniqueBrokerUsers.length,
          activeAccounts: activeAccountsRes.count ?? 0,
          totalDeposits,
          pendingWithdrawals: pendingWithdrawalsRes.count ?? 0,
          totalVolume: 0, // Would need trades data
          monthlyCommissions: 0, // Would need commission tracking
        });
      } catch (e) {
        console.error("Failed to load broker stats", e);
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Load tab-specific data
  useEffect(() => {
    if (!user) return;

    const loadTabData = async () => {
      setTabLoading(true);
      try {
        switch (activeTab) {
          case "clients":
            await loadClients();
            break;
          case "accounts":
            await loadAccounts();
            break;
          case "trades":
            await loadTrades();
            break;
          case "withdrawals":
            await loadPayouts();
            break;
          case "support":
            await loadTickets();
            break;
        }
      } catch (e) {
        console.error("Failed to load tab data", e);
      } finally {
        setTabLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, user]);

  const loadClients = async () => {
    // Get all broker accounts first to find users with broker accounts
    const { data: brokerAccounts } = await supabase
      .from("accounts")
      .select("user_id")
      .eq("account_type", "broker");

    const brokerUserIds = [...new Set((brokerAccounts || []).map(a => a.user_id))];

    if (brokerUserIds.length === 0) {
      setUsersData([]);
      return;
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, user_id, email, full_name, created_at")
      .in("user_id", brokerUserIds)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const { data: accountCounts } = await supabase
      .from("accounts")
      .select("user_id")
      .eq("account_type", "broker")
      .in("user_id", brokerUserIds);

    const countMap = (accountCounts || []).reduce((acc: Record<string, number>, row) => {
      acc[row.user_id] = (acc[row.user_id] || 0) + 1;
      return acc;
    }, {});

    setUsersData(
      (profiles || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        email: p.email,
        full_name: p.full_name,
        created_at: p.created_at,
        account_count: countMap[p.user_id] || 0,
      }))
    );
  };

  const loadAccounts = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("id, account_number, user_id, account_size, balance, equity, leverage, status, account_type")
      .eq("account_type", "broker")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const userIds = [...new Set((data || []).map((a) => a.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", userIds);

    const profileMap = (profiles || []).reduce((acc: Record<string, { email: string | null; full_name: string | null }>, p) => {
      acc[p.user_id] = { email: p.email, full_name: p.full_name };
      return acc;
    }, {});

    setAccountsData(
      (data || []).map((a) => ({
        ...a,
        user_email: profileMap[a.user_id]?.email || undefined,
        user_name: profileMap[a.user_id]?.full_name || undefined,
      }))
    );
  };

  const loadTrades = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("id, user_id, account_id, symbol, direction, lot_size, pnl, status")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const userIds = [...new Set((data || []).map((t) => t.user_id))];
    const accountIds = [...new Set((data || []).map((t) => t.account_id))];

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

    setTradesData(
      (data || []).map((t) => ({
        ...t,
        user_email: profileMap[t.user_id] || undefined,
        account_number: accountMap[t.account_id] || undefined,
      }))
    );
  };

  const loadTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("id, user_id, subject, status, priority, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const userIds = [...new Set((data || []).map((t) => t.user_id))];
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, email").in("user_id", userIds),
      supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
    ]);

    const profileMap = (profilesRes.data || []).reduce((acc: Record<string, string>, p) => {
      acc[p.user_id] = p.email || "";
      return acc;
    }, {});

    const roleMap = (rolesRes.data || []).reduce((acc: Record<string, string>, r) => {
      acc[r.user_id] = r.role;
      return acc;
    }, {});

    setTicketsData(
      (data || []).map((t) => ({
        ...t,
        user_email: profileMap[t.user_id] || undefined,
        user_role: roleMap[t.user_id] || "user",
      }))
    );
  };

  const loadPayouts = async () => {
    const { data, error } = await supabase
      .from("payouts")
      .select("id, user_id, amount, status, payment_method, requested_at")
      .order("requested_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const userIds = [...new Set((data || []).map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", userIds);

    const profileMap = (profiles || []).reduce((acc: Record<string, { email: string | null; full_name: string | null }>, p) => {
      acc[p.user_id] = { email: p.email, full_name: p.full_name };
      return acc;
    }, {});

    setPayoutsData(
      (data || []).map((p) => ({
        ...p,
        user_email: profileMap[p.user_id]?.email || undefined,
        user_name: profileMap[p.user_id]?.full_name || undefined,
      }))
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", tab: "overview" },
    { icon: Users, label: "Clients", tab: "clients" },
    { icon: Wallet, label: "Accounts", tab: "accounts" },
    { icon: TrendingUp, label: "Trades", tab: "trades" },
    { icon: DollarSign, label: "Withdrawals", tab: "withdrawals" },
    { icon: Shield, label: "KYC/AML", tab: "kyc" },
    { icon: Monitor, label: "Login History", tab: "logins" },
    { icon: BarChart3, label: "Reports", tab: "reports" },
    { icon: Globe, label: "IB Program", tab: "ib" },
    { icon: HelpCircle, label: "Support", tab: "support" },
    { icon: Settings, label: "Settings", tab: "settings" },
  ];

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    const isPositive = ["active", "approved", "verified", "closed"].includes(statusLower);
    const isNeutral = ["pending", "open", "in_progress"].includes(statusLower);
    const isNegative = ["suspended", "rejected", "failed"].includes(statusLower);

    return (
      <span
        className={`text-xs px-2 py-1 rounded ${
          isPositive
            ? "bg-broker-primary/10 text-broker-primary"
            : isNeutral
            ? "bg-accent/50 text-accent-foreground"
            : isNegative
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {status?.replace("_", " ") || "N/A"}
      </span>
    );
  };

  const renderEmptyState = (message: string) => (
    <tr>
      <td colSpan={10} className="py-12 text-center text-muted-foreground">
        {message}
      </td>
    </tr>
  );

  const renderLoadingState = () => (
    <tr>
      <td colSpan={10} className="py-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-broker-primary" />
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-broker-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-secondary/50 border-r border-border/20 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-border/20">
          <Link to="/broker" className="flex items-center gap-2">
            {sidebarOpen ? (
              <span className="text-xl font-heading font-bold">
                <span className="text-foreground">KUBERA</span>{" "}
                <span className="text-broker-primary">BROKER</span>
              </span>
            ) : (
              <span className="text-xl font-heading font-bold text-broker-primary">KB</span>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.tab
                      ? 'bg-broker-primary/20 text-broker-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-secondary/30 border-b border-border/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-heading font-bold capitalize">{activeTab === "ib" ? "IB Program" : activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-muted rounded-lg relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-broker-primary text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                    <span className="font-semibold">Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-xs text-muted-foreground hover:text-foreground">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">No new notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-muted/50 border-b border-border/50 last:border-0">
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-broker-primary" />
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-broker-primary" />
                  </div>
                  <p className="text-3xl font-bold">{stats.totalClients.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Wallet className="w-8 h-8 text-broker-primary" />
                  </div>
                  <p className="text-3xl font-bold">{stats.activeAccounts.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Active Accounts</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-broker-primary" />
                  </div>
                  <p className="text-3xl font-bold">${(stats.totalDeposits / 1000000).toFixed(2)}M</p>
                  <p className="text-sm text-muted-foreground">Total Deposits</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold">{stats.pendingWithdrawals}</p>
                  <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-broker-primary" />
                  </div>
                  <p className="text-3xl font-bold">${(stats.totalVolume / 1000000).toFixed(2)}M</p>
                  <p className="text-sm text-muted-foreground">Trading Volume</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <BarChart3 className="w-8 h-8 text-broker-primary" />
                  </div>
                  <p className="text-3xl font-bold text-broker-primary">${stats.monthlyCommissions.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Monthly Commissions</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("clients")}>
                    <Users className="w-5 h-5" />
                    <span className="text-xs">View Clients</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("withdrawals")}>
                    <DollarSign className="w-5 h-5" />
                    <span className="text-xs">Withdrawals</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("kyc")}>
                    <Shield className="w-5 h-5" />
                    <span className="text-xs">KYC Queue</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("support")}>
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-xs">Support</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">All Clients</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Accounts</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Join Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : usersData.length === 0
                      ? renderEmptyState("No broker clients found")
                      : usersData.map((u) => (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4">{u.email || "—"}</td>
                            <td className="py-4 px-4 font-semibold">{u.full_name || "—"}</td>
                            <td className="py-4 px-4">{u.account_count}</td>
                            <td className="py-4 px-4 text-muted-foreground">{formatDate(u.created_at)}</td>
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedUser({ userId: u.user_id, email: u.email, name: u.full_name });
                                  setUserDetailOpen(true);
                                }}>
                                  <Eye className="w-4 h-4 mr-1" /> View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === "accounts" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">Trading Accounts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Account #</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Balance</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Equity</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Leverage</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : accountsData.length === 0
                      ? renderEmptyState("No broker accounts found")
                      : accountsData.map((acc) => (
                          <tr key={acc.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4 font-mono text-sm">{acc.account_number}</td>
                            <td className="py-4 px-4">{acc.user_name || acc.user_email || "—"}</td>
                            <td className="py-4 px-4 font-semibold">${Number(acc.balance).toLocaleString()}</td>
                            <td className="py-4 px-4">${Number(acc.equity).toLocaleString()}</td>
                            <td className="py-4 px-4">{acc.leverage || "1:100"}</td>
                            <td className="py-4 px-4">{getStatusBadge(acc.status)}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedAccountId(acc.id);
                                  setAccountDetailOpen(true);
                                }}>
                                  <Eye className="w-4 h-4 mr-1" /> View
                                </Button>
                                {acc.status?.toLowerCase() === "active" && (
                                  <Button variant="ghost" size="sm" onClick={async () => {
                                    const { error } = await supabase.from("accounts").update({ status: "archived" }).eq("id", acc.id);
                                    if (error) {
                                      toast({ title: "Error", description: error.message, variant: "destructive" });
                                    } else {
                                      toast({ title: "Account Archived", description: `Account ${acc.account_number} has been archived.` });
                                      loadAccounts();
                                    }
                                  }}>
                                    <Ban className="w-4 h-4 mr-1" /> Archive
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trades Tab */}
          {activeTab === "trades" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">Trade History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Account</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Symbol</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Direction</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Lots</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">P&L</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : tradesData.length === 0
                      ? renderEmptyState("No trades found")
                      : tradesData.map((trade) => (
                          <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4">{trade.user_email || "—"}</td>
                            <td className="py-4 px-4 font-mono text-sm">{trade.account_number || "—"}</td>
                            <td className="py-4 px-4 font-semibold">{trade.symbol}</td>
                            <td className="py-4 px-4">
                              <span className={`text-xs px-2 py-1 rounded ${
                                trade.direction?.toUpperCase() === 'BUY'
                                  ? 'bg-broker-primary/10 text-broker-primary' 
                                  : 'bg-destructive/10 text-destructive'
                              }`}>
                                {trade.direction}
                              </span>
                            </td>
                            <td className="py-4 px-4">{Number(trade.lot_size).toFixed(2)}</td>
                            <td className={`py-4 px-4 font-semibold ${(trade.pnl || 0) >= 0 ? 'text-broker-primary' : 'text-destructive'}`}>
                              {(trade.pnl || 0) >= 0 ? '+' : ''}${Number(trade.pnl || 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-4">{getStatusBadge(trade.status)}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-heading font-bold mb-4">Withdrawal Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Method</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Requested</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : payoutsData.length === 0
                      ? renderEmptyState("No withdrawal requests")
                      : payoutsData.map((payout) => (
                          <tr key={payout.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4">
                              <p className="font-medium">{payout.user_name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{payout.user_email}</p>
                            </td>
                            <td className="py-4 px-4 font-semibold">${Number(payout.amount).toLocaleString()}</td>
                            <td className="py-4 px-4">{payout.payment_method || "—"}</td>
                            <td className="py-4 px-4 text-muted-foreground">{formatDate(payout.requested_at)}</td>
                            <td className="py-4 px-4">{getStatusBadge(payout.status)}</td>
                            <td className="py-4 px-4">
                              {processingId === payout.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : payout.status === "pending" ? (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="text-green-500 hover:bg-green-500/10" onClick={async () => {
                                    setProcessingId(payout.id);
                                    const { error } = await supabase.from("payouts").update({ status: "approved", processed_at: new Date().toISOString() }).eq("id", payout.id);
                                    setProcessingId(null);
                                    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
                                    else { toast({ title: "Approved", description: "Withdrawal approved" }); loadPayouts(); }
                                  }}>
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={async () => {
                                    setProcessingId(payout.id);
                                    const { error } = await supabase.from("payouts").update({ status: "rejected", processed_at: new Date().toISOString() }).eq("id", payout.id);
                                    setProcessingId(null);
                                    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
                                    else { toast({ title: "Rejected", description: "Withdrawal rejected" }); loadPayouts(); }
                                  }}>
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground capitalize">{payout.status}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === "kyc" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-heading font-bold mb-4">KYC/AML Verification Queue</h3>
              <div className="py-12 text-center text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending KYC submissions</p>
                <Link to="/admin/compliance" className="text-broker-primary text-sm hover:underline mt-2 inline-block">
                  Go to Compliance Dashboard →
                </Link>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">Available Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <FileText className="w-6 h-6" />
                    <span>Client Summary</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Trading Volume</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <DollarSign className="w-6 h-6" />
                    <span>Commission Report</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* IB Program Tab */}
          {activeTab === "ib" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-heading font-bold mb-4">Introducing Broker Program</h3>
              <div className="py-12 text-center text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>IB management features coming soon</p>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">Support Tickets</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Ticket ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Subject</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : ticketsData.length === 0
                      ? renderEmptyState("No support tickets")
                      : ticketsData.map((ticket) => (
                          <tr key={ticket.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4 font-mono text-sm">{ticket.id.slice(0, 8)}</td>
                            <td className="py-4 px-4">{ticket.user_email || "—"}</td>
                            <td className="py-4 px-4">
                              <span className={`text-xs px-2 py-1 rounded ${
                                ticket.user_role === 'admin' ? 'bg-broker-primary/10 text-broker-primary' :
                                ticket.user_role === 'moderator' ? 'bg-accent/50 text-accent-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {ticket.user_role || 'user'}
                              </span>
                            </td>
                            <td className="py-4 px-4">{ticket.subject}</td>
                            <td className="py-4 px-4">
                              <span className={`text-xs px-2 py-1 rounded ${
                                ticket.priority === 'high' || ticket.priority === 'urgent'
                                  ? 'bg-destructive/10 text-destructive' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {ticket.priority || 'normal'}
                              </span>
                            </td>
                            <td className="py-4 px-4">{getStatusBadge(ticket.status)}</td>
                            <td className="py-4 px-4 text-muted-foreground">{formatDate(ticket.created_at)}</td>
                            <td className="py-4 px-4">
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Login History Tab */}
          {activeTab === "logins" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-heading font-bold">Login History</h3>
                  <p className="text-sm text-muted-foreground">Track client login activity, IP addresses, devices and browsers</p>
                </div>
              </div>
              <LoginHistoryTable />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">Broker Admin Users</h3>
                <p className="text-sm text-muted-foreground mb-4">Users with broker admin access.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-broker-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-broker-primary" />
                      </div>
                      <div>
                        <p className="font-medium">meghanikar@gmail.com</p>
                        <p className="text-xs text-muted-foreground">Super Admin</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-broker-primary/10 text-broker-primary">Admin</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-broker-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-broker-primary" />
                      </div>
                      <div>
                        <p className="font-medium">snyman4d@gmail.com</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-broker-primary/10 text-broker-primary">Admin</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-broker-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-broker-primary" />
                      </div>
                      <div>
                        <p className="font-medium">norman_robinson@shaw.ca</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-broker-primary/10 text-broker-primary">Admin</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">Broker Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Leverage</label>
                    <Input defaultValue="1:100" className="w-full" disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Deposit</label>
                    <Input defaultValue="$100" className="w-full" disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commission per Lot</label>
                    <Input defaultValue="$7.00" className="w-full" disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Withdrawal Processing</label>
                    <Input defaultValue="1-3 business days" className="w-full" disabled />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Modals */}
      {selectedUser && (
        <UserDetailModal
          open={userDetailOpen}
          onOpenChange={setUserDetailOpen}
          userId={selectedUser.userId}
          userEmail={selectedUser.email}
          userName={selectedUser.name}
          onRefresh={() => { loadClients(); loadAccounts(); }}
        />
      )}
      {selectedAccountId && (
        <AccountDetailModal
          open={accountDetailOpen}
          onOpenChange={setAccountDetailOpen}
          accountId={selectedAccountId}
          onRefresh={loadAccounts}
        />
      )}
    </div>
  );
};

export default BrokerAdminDashboard;
