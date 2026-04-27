import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Wallet,
  Users,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  ArrowDownLeft,
  Wrench,
  Plus,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const BrokerSidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Accounts"]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/login");
  };

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => location.pathname === href;

  const dashboardItem: MenuItem = { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" };

  const accountsSection: MenuItem = {
    icon: Wallet,
    label: "Accounts",
    children: [
      { label: "Live Accounts", href: "/accounts/live" },
      { label: "Demo Accounts", href: "/accounts/demo" },
      { label: "Archived", href: "/accounts/archived" },
    ],
  };

  const openAccountItem: MenuItem = { icon: Plus, label: "Open Account", href: "/accounts/open" };
  const withdrawItem: MenuItem = { icon: ArrowDownLeft, label: "Withdraw", href: "/withdraw" };
  const toolsItem: MenuItem = { icon: Wrench, label: "Trading Tools", href: "/tools" };
  const affiliateItem: MenuItem = { icon: Users, label: "Affiliate", href: "/affiliate/apply" };

  const reportsSection: MenuItem = {
    icon: BarChart3,
    label: "Reports",
    children: [
      { label: "Summary", href: "/reports/summary" },
      { label: "Trades", href: "/reports/trades" },
      { label: "Payouts", href: "/reports/payouts" },
    ],
  };

  const supportSection: MenuItem = {
    icon: HelpCircle,
    label: "Support",
    children: [
      { label: "FAQ - General", href: "/support/faq/general" },
      { label: "FAQ - Trading", href: "/support/faq/trading" },
      { label: "Downloads", href: "/support/downloads" },
    ],
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.children) {
      const isExpanded = expandedSections.includes(item.label);
      const hasActiveChild = item.children.some(child => isActive(child.href));

      return (
        <li key={index}>
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors",
              hasActiveChild
                ? "bg-broker-primary/20 text-broker-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {isOpen && <span>{item.label}</span>}
            </div>
            {isOpen && (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
          </button>
          {isOpen && isExpanded && (
            <ul className="ml-6 mt-1 space-y-1">
              {item.children.map((child, childIndex) => (
                <li key={childIndex}>
                  <Link
                    to={child.href}
                    className={cn(
                      "block px-4 py-2 rounded-lg text-sm transition-colors",
                      isActive(child.href)
                        ? "bg-broker-primary/20 text-broker-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={index}>
        <Link
          to={item.href!}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            isActive(item.href!)
              ? "bg-broker-primary/20 text-broker-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <item.icon className="w-5 h-5" />
          {isOpen && <span>{item.label}</span>}
        </Link>
      </li>
    );
  };

  return (
    <aside className={cn(
      "bg-secondary/50 border-r border-border/20 transition-all duration-300 flex flex-col",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="p-6 border-b border-border/20">
        <Link to="/" className="flex items-center gap-2">
          {isOpen ? (
            <span className="text-xl font-heading font-bold">
              <span className="text-foreground">KUBERA</span>{" "}
              <span className="text-broker-primary">MARKETS</span>
            </span>
          ) : (
            <span className="text-xl font-heading font-bold text-broker-primary">KM</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <ul className="space-y-1">
            {renderMenuItem(dashboardItem, 0)}
          </ul>
        </div>

        <div className="mb-4">
          {isOpen && <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trading</p>}
          <ul className="space-y-1">
            {renderMenuItem(accountsSection, 0)}
            {renderMenuItem(openAccountItem, 1)}
            {renderMenuItem(withdrawItem, 2)}
            {renderMenuItem(toolsItem, 3)}
          </ul>
        </div>

        <div className="mb-4">
          {isOpen && <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Partner</p>}
          <ul className="space-y-1">
            {renderMenuItem(affiliateItem, 0)}
          </ul>
        </div>

        <div className="mb-4">
          {isOpen && <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reports</p>}
          <ul className="space-y-1">
            {renderMenuItem(reportsSection, 0)}
          </ul>
        </div>

        <div className="mb-4">
          {isOpen && <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Help</p>}
          <ul className="space-y-1">
            {renderMenuItem(supportSection, 0)}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-border/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default BrokerSidebar;
