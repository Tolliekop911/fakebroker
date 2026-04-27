import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Trophy,
  DollarSign,
  TrendingUp,
  Shield,
  Settings,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Ban,
  RefreshCw,
  Edit,
  MoreVertical,
  MessageSquare,
  Bell,
  Loader2,
  Globe,
  Ticket,
  FileCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import AdminChatManagement from "@/components/admin/AdminChatManagement";
import AccountProvisioningModal from "@/components/admin/AccountProvisioningModal";
import LoginHistoryTable from "@/components/admin/LoginHistoryTable";
import CouponManagement from "@/components/admin/CouponManagement";
import StrategyReview from "@/components/admin/StrategyReview";
import UserDetailModal from "@/components/admin/UserDetailModal";
import AccountDetailModal from "@/components/admin/AccountDetailModal";

interface AdminNotification {
  id: string;
  type: "escalation" | "ticket";
  title: string;
  message: string;
  timestamp: Date;
  conversationId?: string;
}

type AdminOverviewStats = {
  totalUsers: number;
  activeAccounts: number;
  totalFunded: number;
  pendingPayouts: number;
  totalAUM: number;
  monthlyRevenue: number;
};

type AdminRecentActivity = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  kind: "success" | "info" | "warning";
};

// Types for dynamic data
interface AdminUser {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  account_count: number;
}

interface AdminAccount {
  id: string;
  account_number: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  account_size: number;
  balance: number;
  phase: string | null;
  status: string;
  program_type: string | null;
}

interface AdminPayout {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  amount: number;
  status: string;
  requested_at: string;
}

interface AdminTrade {
  id: string;
  user_id: string;
  user_email?: string;
  account_number?: string;
  symbol: string;
  direction: string;
  lot_size: number;
  pnl: number | null;
  rule_violation: boolean | null;
}

interface AdminTicket {
  id: string;
  user_id: string;
  user_email?: string;
  subject: string;
  status: string;
  priority: string | null;
  created_at: string;
}

interface AdminChallenge {
  id: string;
  challenge_number: string;
  user_id: string;
  user_email?: string;
  program_type: string;
  account_size: number;
  phase: string;
  status: string;
}

interface AdminRule {
  id: string;
  program_type: string;
  account_size: number;
  profit_target_phase1: number;
  profit_target_phase2: number | null;
  max_drawdown: number;
  daily_drawdown: number;
  min_trading_days: number;
  profit_split: number | null;
}

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<AdminOverviewStats>({
    totalUsers: 0,
    activeAccounts: 0,
    totalFunded: 0,
    pendingPayouts: 0,
    totalAUM: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<AdminRecentActivity[]>([]);

  // Dynamic data states
  const [usersData, setUsersData] = useState<AdminUser[]>([]);
  const [accountsData, setAccountsData] = useState<AdminAccount[]>([]);
  const [payoutsData, setPayoutsData] = useState<AdminPayout[]>([]);
  const [tradesData, setTradesData] = useState<AdminTrade[]>([]);
  const [ticketsData, setTicketsData] = useState<AdminTicket[]>([]);
  const [challengesData, setChallengesData] = useState<AdminChallenge[]>([]);
  const [rulesData, setRulesData] = useState<AdminRule[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Account provisioning modal state
  const [provisioningModalOpen, setProvisioningModalOpen] = useState(false);
  const [selectedUserForProvisioning, setSelectedUserForProvisioning] = useState<{
    userId: string;
    userEmail: string;
    userName?: string;
  } | null>(null);

  // User detail modal state
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: string; email: string | null; name: string | null } | null>(null);

  // Account detail modal state
  const [accountDetailOpen, setAccountDetailOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Admin action handlers
  const handleChallengeAction = async (challengeId: string, action: "pass" | "fail" | "disable") => {
    setProcessingId(challengeId);
    try {
      let updateData: { status?: string; phase?: string } = {};
      
      if (action === "pass") {
        // Get current challenge to determine next phase
        const challenge = challengesData.find(c => c.id === challengeId);
        if (challenge?.phase === "phase1") {
          updateData = { phase: "phase2", status: "active" };
        } else if (challenge?.phase === "phase2") {
          updateData = { phase: "funded", status: "active" };
        } else {
          updateData = { status: "passed" };
        }
      } else if (action === "fail") {
        updateData = { status: "failed" };
      } else if (action === "disable") {
        updateData = { status: "disabled" };
      }

      const { error } = await supabase
        .from("challenges")
        .update(updateData)
        .eq("id", challengeId);

      if (error) throw error;

      toast({ title: "Success", description: `Challenge ${action === "pass" ? "passed" : action === "fail" ? "failed" : "disabled"} successfully` });
      loadChallenges(); // Refresh
    } catch (e) {
      console.error("Error updating challenge:", e);
      toast({ title: "Error", description: "Failed to update challenge", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleAccountAction = async (accountId: string, action: "disable" | "enable" | "archive") => {
    setProcessingId(accountId);
    try {
      const statusMap = { disable: "suspended", enable: "active", archive: "archived" };
      
      const { error } = await supabase
        .from("accounts")
        .update({ status: statusMap[action] })
        .eq("id", accountId);

      if (error) throw error;

      toast({ title: "Success", description: `Account ${action}d successfully` });
      loadAccounts(); // Refresh
    } catch (e) {
      console.error("Error updating account:", e);
      toast({ title: "Error", description: "Failed to update account", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateAccount = async (userId: string, accountSize: number, programType: string) => {
    try {
      const accountNumber = `PROP-${Date.now().toString().slice(-6)}`;
      
      const { error: accountError } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          account_number: accountNumber,
          account_type: "prop",
          account_size: accountSize,
          balance: accountSize,
          equity: accountSize,
          status: "active",
          phase: "evaluation",
          program_type: programType,
        });

      if (accountError) throw accountError;

      // Also create a challenge for this account
      const challengeNumber = `CH-${Date.now().toString().slice(-8)}`;
      const { data: newAccount } = await supabase
        .from("accounts")
        .select("id")
        .eq("account_number", accountNumber)
        .single();

      if (newAccount) {
        await supabase
          .from("challenges")
          .insert({
            user_id: userId,
            account_id: newAccount.id,
            challenge_number: challengeNumber,
            program_type: programType,
            account_size: accountSize,
            current_balance: accountSize,
            profit_target_amount: accountSize * 0.08,
            max_drawdown_amount: accountSize * 0.10,
            phase: "phase1",
            status: "active",
          });
      }

      toast({ title: "Success", description: `New account ${accountNumber} created` });
      loadAccounts();
      loadChallenges();
    } catch (e) {
      console.error("Error creating account:", e);
      toast({ title: "Error", description: "Failed to create account", variant: "destructive" });
    }
  };

  // Subscribe to escalated conversations in realtime
  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: "status=eq.escalated",
        },
        (payload) => {
          const conv = payload.new as { id: string; user_email?: string; user_name?: string };
          const newNotif: AdminNotification = {
            id: `conv-${conv.id}-${Date.now()}`,
            type: "escalation",
            title: "Chat Escalated",
            message: `${conv.user_name || conv.user_email || "Anonymous user"} needs human support`,
            timestamp: new Date(),
            conversationId: conv.id,
          };
          setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
          toast({
            title: "New Escalation",
            description: newNotif.message,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tickets",
        },
        (payload) => {
          const ticket = payload.new as { id: string; subject: string; priority?: string };
          const newNotif: AdminNotification = {
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

  const handleNotificationClick = (notif: AdminNotification) => {
    if (notif.type === "escalation") {
      setActiveTab("chat");
    } else {
      setActiveTab("support");
    }
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

  // Load admin overview stats (no demo data)
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const loadStats = async () => {
      try {
        const [
          profilesRes,
          activeAccountsRes,
          fundedChallengesRes,
          pendingPayoutsRes,
          fundedBalancesRes,
          monthRevenueRes,
        ] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase
            .from("accounts")
            .select("id", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("challenges")
            .select("id", { count: "exact", head: true })
            .eq("phase", "funded")
            .eq("status", "active"),
          supabase
            .from("payouts")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("challenges")
            .select("current_balance")
            .eq("phase", "funded")
            .eq("status", "active")
            .limit(1000),
          (() => {
            const since = new Date();
            since.setDate(since.getDate() - 30);
            return supabase
              .from("payouts")
              .select("amount, processed_at")
              .eq("status", "paid")
              .gte("processed_at", since.toISOString())
              .limit(1000);
          })(),
        ]);

        const totalAUM = (fundedBalancesRes.data || []).reduce((sum, r: any) => sum + Number(r.current_balance || 0), 0);
        const monthlyRevenue = (monthRevenueRes.data || []).reduce((sum, r: any) => sum + Number(r.amount || 0), 0);

        if (!mounted) return;

        setStats({
          totalUsers: profilesRes.count ?? 0,
          activeAccounts: activeAccountsRes.count ?? 0,
          totalFunded: fundedChallengesRes.count ?? 0,
          pendingPayouts: pendingPayoutsRes.count ?? 0,
          totalAUM,
          monthlyRevenue,
        });
      } catch (e) {
        console.error("Failed to load admin stats", e);
      }
    };

    const loadRecentActivity = async () => {
      try {
        const { data, error } = await supabase
          .from("admin_logs")
          .select("id, action, target_type, created_at")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        const mapped: AdminRecentActivity[] = (data || []).map((row: any) => {
          const action = String(row.action || "activity");
          const target = String(row.target_type || "system");
          return {
            id: row.id,
            title: action,
            description: target,
            createdAt: row.created_at,
            kind: "info",
          };
        });

        if (!mounted) return;
        setRecentActivity(mapped);
      } catch (e) {
        if (!mounted) return;
        setRecentActivity([]);
      }
    };

    loadStats();
    loadRecentActivity();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Load tab-specific data when switching tabs
  useEffect(() => {
    if (!user) return;

    const loadTabData = async () => {
      setTabLoading(true);
      try {
        switch (activeTab) {
          case "users":
            await loadUsers();
            break;
          case "accounts":
            await loadAccounts();
            break;
          case "payouts":
            await loadPayouts();
            break;
          case "trades":
            await loadTrades();
            break;
          case "support":
            await loadTickets();
            break;
          case "challenges":
            await loadChallenges();
            break;
          case "rules":
            await loadRules();
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

  const loadUsers = async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, user_id, email, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    // Get account counts per user
    const userIds = (profiles || []).map((p) => p.user_id);
    const { data: accountCounts } = await supabase
      .from("accounts")
      .select("user_id")
      .in("user_id", userIds);

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
      .select("id, account_number, user_id, account_size, balance, phase, status, program_type")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    // Fetch user emails
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

  const loadPayouts = async () => {
    const { data, error } = await supabase
      .from("payouts")
      .select("id, user_id, amount, status, requested_at")
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

  const loadTrades = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("id, user_id, account_id, symbol, direction, lot_size, pnl, rule_violation")
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
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email")
      .in("user_id", userIds);

    const profileMap = (profiles || []).reduce((acc: Record<string, string>, p) => {
      acc[p.user_id] = p.email || "";
      return acc;
    }, {});

    setTicketsData(
      (data || []).map((t) => ({
        ...t,
        user_email: profileMap[t.user_id] || undefined,
      }))
    );
  };

  const loadChallenges = async () => {
    const { data, error } = await supabase
      .from("challenges")
      .select("id, challenge_number, user_id, program_type, account_size, phase, status")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const userIds = [...new Set((data || []).map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email")
      .in("user_id", userIds);

    const profileMap = (profiles || []).reduce((acc: Record<string, string>, p) => {
      acc[p.user_id] = p.email || "";
      return acc;
    }, {});

    setChallengesData(
      (data || []).map((c) => ({
        ...c,
        user_email: profileMap[c.user_id] || undefined,
      }))
    );
  };

  const loadRules = async () => {
    const { data, error } = await supabase
      .from("rules")
      .select("id, program_type, account_size, profit_target_phase1, profit_target_phase2, max_drawdown, daily_drawdown, min_trading_days, profit_split")
      .order("program_type", { ascending: true });

    if (error) throw error;
    setRulesData(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", tab: "overview" },
    { icon: Users, label: "Users", tab: "users" },
    { icon: Wallet, label: "Accounts", tab: "accounts" },
    { icon: DollarSign, label: "Finance", tab: "finance", link: "/admin/finance" },
    { icon: Shield, label: "Compliance", tab: "compliance", link: "/admin/compliance" },
    { icon: TrendingUp, label: "Trades Monitor", tab: "trades" },
    { icon: Globe, label: "Login History", tab: "logins" },
    { icon: FileText, label: "Data Import", tab: "import", link: "/admin/import" },
    { icon: MessageSquare, label: "Live Chat", tab: "chat" },
    { icon: HelpCircle, label: "Support", tab: "support" },
    { icon: Settings, label: "Settings", tab: "settings" },
  ];

  // Helper functions
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusBadge = (status: string, type: "user" | "account" | "payout" | "ticket" | "challenge") => {
    const statusLower = status?.toLowerCase() || "";
    const isPositive = ["active", "paid", "resolved", "passed", "funded"].includes(statusLower);
    const isNeutral = ["pending", "in_progress", "phase1", "phase2", "evaluation"].includes(statusLower);
    const isNegative = ["suspended", "failed", "rejected", "closed"].includes(statusLower);

    return (
      <span
        className={`text-xs px-2 py-1 rounded ${
          isPositive
            ? "bg-primary/10 text-primary"
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
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-secondary/50 border-r border-border/20 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-border/20">
          <Link to="/" className="flex items-center gap-2">
            {sidebarOpen ? (
              <span className="text-xl font-heading font-bold">
                <span className="text-foreground">KUBERA</span>{" "}
                <span className="text-primary">ADMIN</span>
              </span>
            ) : (
              <span className="text-xl font-heading font-bold text-primary">KA</span>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.link ? (
                  <Link
                    to={item.link}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                ) : (
                  <button
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.tab
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                )}
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
            <h1 className="text-xl font-heading font-bold capitalize">{activeTab}</h1>
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
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                    <span className="font-semibold">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className="w-full text-left p-3 hover:bg-muted/50 border-b border-border/50 last:border-0"
                        >
                          <div className="flex items-start gap-2">
                            {notif.type === "escalation" ? (
                              <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                            ) : (
                              <HelpCircle className="w-4 h-4 text-accent mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{notif.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notif.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
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
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{stats.activeAccounts.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Active Accounts</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{stats.totalFunded}</p>
                  <p className="text-sm text-muted-foreground">Funded Accounts</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{stats.pendingPayouts}</p>
                  <p className="text-sm text-muted-foreground">Pending Payouts</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">${(stats.totalAUM / 1000000).toFixed(2)}M</p>
                  <p className="text-sm text-muted-foreground">Total AUM</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">${stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">Recent Activity</h3>
                {recentActivity.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">No admin activity yet.</div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.kind === "success" ? (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          ) : item.kind === "warning" ? (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-primary" />
                          )}
                          <span className="truncate">
                            {item.title}
                            {item.description ? `: ${item.description}` : ""}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">All Users</h3>
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
                      ? renderEmptyState("No users found")
                      : usersData.map((u) => (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4">{u.email || "—"}</td>
                            <td className="py-4 px-4 font-semibold">{u.full_name || "—"}</td>
                            <td className="py-4 px-4">{u.account_count}</td>
                            <td className="py-4 px-4 text-muted-foreground">{formatDate(u.created_at)}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" title="View User" onClick={() => {
                                  setSelectedUser({ userId: u.user_id, email: u.email, name: u.full_name });
                                  setUserDetailOpen(true);
                                }}><Eye className="w-4 h-4" /></Button>
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
                <h3 className="text-lg font-heading font-bold">All Accounts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Account ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Size</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Balance</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Phase</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : accountsData.length === 0
                      ? renderEmptyState("No accounts found")
                      : accountsData.map((acc) => (
                          <tr key={acc.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4 font-mono text-sm">{acc.account_number}</td>
                            <td className="py-4 px-4">{acc.user_name || acc.user_email || "—"}</td>
                            <td className="py-4 px-4">${Number(acc.account_size).toLocaleString()}</td>
                            <td className="py-4 px-4 font-semibold">${Number(acc.balance).toLocaleString()}</td>
                            <td className="py-4 px-4">{getStatusBadge(acc.phase || "—", "account")}</td>
                            <td className="py-4 px-4">{getStatusBadge(acc.status, "account")}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1 flex-wrap">
                                <Button variant="ghost" size="sm" title="View Details" onClick={() => {
                                  setSelectedAccountId(acc.id);
                                  setAccountDetailOpen(true);
                                }}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {acc.status === "active" ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive"
                                    onClick={() => handleAccountAction(acc.id, "disable")}
                                    disabled={processingId === acc.id}
                                    title="Disable Account"
                                  >
                                    {processingId === acc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                  </Button>
                                ) : acc.status === "suspended" ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-primary"
                                    onClick={() => handleAccountAction(acc.id, "enable")}
                                    disabled={processingId === acc.id}
                                    title="Enable Account"
                                  >
                                    {processingId === acc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                  </Button>
                                ) : null}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleAccountAction(acc.id, "archive")}
                                  disabled={processingId === acc.id || acc.status === "archived"}
                                  title="Archive Account"
                                >
                                  <MoreVertical className="w-4 h-4" />
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

          {/* Payouts Tab */}
          {activeTab === "payouts" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">Payout Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Request Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : payoutsData.length === 0
                      ? renderEmptyState("No payout requests")
                      : payoutsData.map((payout) => (
                          <tr key={payout.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4 font-mono text-sm">{payout.id.slice(0, 8)}</td>
                            <td className="py-4 px-4">{payout.user_name || payout.user_email || "—"}</td>
                            <td className="py-4 px-4 font-semibold text-primary">${Number(payout.amount).toLocaleString()}</td>
                            <td className="py-4 px-4">{getStatusBadge(payout.status, "payout")}</td>
                            <td className="py-4 px-4 text-muted-foreground">{formatDate(payout.requested_at)}</td>
                            <td className="py-4 px-4">
                              {payout.status === "pending" && (
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10" onClick={async () => {
                                    setProcessingId(payout.id);
                                    const { error } = await supabase.from("payouts").update({ status: "approved", processed_at: new Date().toISOString() }).eq("id", payout.id);
                                    setProcessingId(null);
                                    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
                                    else { toast({ title: "Approved", description: "Payout approved" }); loadPayouts(); }
                                  }} disabled={processingId === payout.id}>
                                    {processingId === payout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />} Approve
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={async () => {
                                    setProcessingId(payout.id);
                                    const { error } = await supabase.from("payouts").update({ status: "rejected", processed_at: new Date().toISOString() }).eq("id", payout.id);
                                    setProcessingId(null);
                                    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
                                    else { toast({ title: "Rejected", description: "Payout rejected" }); loadPayouts(); }
                                  }} disabled={processingId === payout.id}>
                                    {processingId === payout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />} Reject
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trades Monitor Tab */}
          {activeTab === "trades" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">Live Trades Monitor</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Account</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Symbol</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Direction</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Lot Size</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">P&L</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Violation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : tradesData.length === 0
                      ? renderEmptyState("No trades found")
                      : tradesData.map((trade) => (
                          <tr key={trade.id} className={`border-b border-border/50 hover:bg-muted/20 ${trade.rule_violation ? 'bg-destructive/5' : ''}`}>
                            <td className="py-4 px-4">{trade.user_email || "—"}</td>
                            <td className="py-4 px-4 font-mono text-sm">{trade.account_number || "—"}</td>
                            <td className="py-4 px-4 font-semibold">{trade.symbol}</td>
                            <td className="py-4 px-4">
                              <span className={`text-xs px-2 py-1 rounded ${
                                trade.direction === 'BUY' || trade.direction === 'buy'
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-destructive/10 text-destructive'
                              }`}>
                                {trade.direction}
                              </span>
                            </td>
                            <td className="py-4 px-4">{Number(trade.lot_size).toFixed(2)}</td>
                            <td className={`py-4 px-4 font-semibold ${(trade.pnl || 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                              {(trade.pnl || 0) >= 0 ? '+' : ''}${Number(trade.pnl || 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-4">
                              {trade.rule_violation ? (
                                <span className="flex items-center gap-1 text-destructive">
                                  <AlertTriangle className="w-4 h-4" /> Yes
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-primary">
                                  <CheckCircle className="w-4 h-4" /> No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === "rules" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">Trading Rules Configuration</h3>
                <Button className="bg-primary hover:bg-primary/90">
                  <Edit className="w-4 h-4 mr-2" /> Edit Rules
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Program</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Account Size</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Profit Target P1</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Profit Target P2</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Max DD</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Daily DD</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Min Days</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Profit Split</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : rulesData.length === 0
                      ? renderEmptyState("No rules configured")
                      : rulesData.map((rule) => (
                          <tr key={rule.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4 font-semibold">{rule.program_type}</td>
                            <td className="py-4 px-4">${Number(rule.account_size).toLocaleString()}</td>
                            <td className="py-4 px-4">{rule.profit_target_phase1}%</td>
                            <td className="py-4 px-4">{rule.profit_target_phase2 ? `${rule.profit_target_phase2}%` : 'N/A'}</td>
                            <td className="py-4 px-4">{rule.max_drawdown}%</td>
                            <td className="py-4 px-4">{rule.daily_drawdown}%</td>
                            <td className="py-4 px-4">{rule.min_trading_days}</td>
                            <td className="py-4 px-4">{rule.profit_split}%</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Live Chat Tab */}
          {activeTab === "chat" && (
            <AdminChatManagement />
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
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
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
                            <td className="py-4 px-4">{ticket.subject}</td>
                            <td className="py-4 px-4">
                              <span className={`text-xs px-2 py-1 rounded ${
                                ticket.priority === 'high' || ticket.priority === 'urgent'
                                  ? 'bg-destructive/10 text-destructive' 
                                  : ticket.priority === 'normal'
                                  ? 'bg-accent/50 text-accent-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {ticket.priority || 'normal'}
                              </span>
                            </td>
                            <td className="py-4 px-4">{getStatusBadge(ticket.status, "ticket")}</td>
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

          {/* Challenges Tab */}
          {activeTab === "challenges" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-bold">All Challenges</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Challenge ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Program</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Size</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Phase</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabLoading
                      ? renderLoadingState()
                      : challengesData.length === 0
                      ? renderEmptyState("No challenges found")
                      : challengesData.map((ch) => (
                          <tr key={ch.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-4 px-4 font-mono text-sm">{ch.challenge_number}</td>
                            <td className="py-4 px-4">{ch.user_email || "—"}</td>
                            <td className="py-4 px-4">{ch.program_type}</td>
                            <td className="py-4 px-4">${Number(ch.account_size).toLocaleString()}</td>
                            <td className="py-4 px-4">{getStatusBadge(ch.phase, "challenge")}</td>
                            <td className="py-4 px-4">{getStatusBadge(ch.status, "challenge")}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1 flex-wrap">
                                {ch.status === "active" && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-primary border-primary hover:bg-primary/10"
                                      onClick={() => handleChallengeAction(ch.id, "pass")}
                                      disabled={processingId === ch.id}
                                    >
                                      {processingId === ch.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                      Pass
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-destructive border-destructive hover:bg-destructive/10"
                                      onClick={() => handleChallengeAction(ch.id, "fail")}
                                      disabled={processingId === ch.id}
                                    >
                                      {processingId === ch.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
                                      Fail
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-muted-foreground"
                                      onClick={() => handleChallengeAction(ch.id, "disable")}
                                      disabled={processingId === ch.id}
                                    >
                                      <Ban className="w-3 h-3 mr-1" />
                                      Disable
                                    </Button>
                                  </>
                                )}
                                {ch.status !== "active" && (
                                  <span className="text-xs text-muted-foreground">No actions available</span>
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

          {/* Login History Tab */}
          {activeTab === "logins" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-heading font-bold">Login History</h3>
                  <p className="text-sm text-muted-foreground">Track user login activity, IP addresses, devices and browsers</p>
                </div>
              </div>
              <LoginHistoryTable />
            </div>
          )}

          {/* Coupons Tab */}
          {activeTab === "coupons" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <CouponManagement />
            </div>
          )}

          {/* Strategies Tab */}
          {activeTab === "strategies" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <StrategyReview />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Admin Users Management */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">Admin Users</h3>
                <p className="text-sm text-muted-foreground mb-4">Users with admin access to this dashboard.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">meghanikar@gmail.com</p>
                        <p className="text-xs text-muted-foreground">Super Admin</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Admin</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">snyman4d@gmail.com</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Admin</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">norman_robinson@shaw.ca</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Admin</span>
                  </div>
                </div>
              </div>

              {/* Platform Settings */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">Platform Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Profit Split</label>
                    <Input defaultValue="80" className="w-full" disabled />
                    <p className="text-xs text-muted-foreground">Percentage of profits paid to traders</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Accounts per User</label>
                    <Input defaultValue="5" className="w-full" disabled />
                    <p className="text-xs text-muted-foreground">Maximum number of active accounts</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payout Processing Days</label>
                    <Input defaultValue="3-5 business days" className="w-full" disabled />
                    <p className="text-xs text-muted-foreground">Typical payout processing time</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Support Email</label>
                    <Input defaultValue="support@kuberamarkets.com" className="w-full" disabled />
                    <p className="text-xs text-muted-foreground">Primary support contact</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-heading font-bold mb-4">System Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">5</p>
                    <p className="text-xs text-muted-foreground">Registered Users</p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">5</p>
                    <p className="text-xs text-muted-foreground">Open Tickets</p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-xs text-muted-foreground">Admin Users</p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">v1.0</p>
                    <p className="text-xs text-muted-foreground">Platform Version</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Account Provisioning Modal */}
      {selectedUserForProvisioning && (
        <AccountProvisioningModal
          open={provisioningModalOpen}
          onOpenChange={setProvisioningModalOpen}
          userId={selectedUserForProvisioning.userId}
          userEmail={selectedUserForProvisioning.userEmail}
          userName={selectedUserForProvisioning.userName}
          onSuccess={() => {
            loadAccounts();
            loadChallenges();
            loadUsers();
          }}
        />
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          open={userDetailOpen}
          onOpenChange={setUserDetailOpen}
          userId={selectedUser.userId}
          userEmail={selectedUser.email}
          userName={selectedUser.name}
          onRefresh={() => { loadUsers(); loadAccounts(); }}
        />
      )}

      {/* Account Detail Modal */}
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

export default AdminDashboard;
