import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

const BrokerNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-bold">
              <span className="text-foreground">KUBERA</span>{" "}
              <span className="text-broker-primary">MARKETS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Company <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/company" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 first:rounded-t-lg">About Us</Link>
                <Link to="/regulation" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">Regulation</Link>
                <Link to="/contact" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 last:rounded-b-lg">Contact</Link>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Market <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/markets" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 first:rounded-t-lg">All Markets</Link>
                <Link to="/markets?tab=forex" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">Forex</Link>
                <Link to="/markets?tab=indices" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">Indices</Link>
                <Link to="/markets?tab=commodities" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 last:rounded-b-lg">Commodities</Link>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Trading <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/account-types" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 first:rounded-t-lg">Account Types</Link>
                <Link to="/platforms" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">Trading Platform</Link>
                <Link to="/trading-tools" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 last:rounded-b-lg">Trading Tools</Link>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Partner <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/affiliate/apply" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg">Affiliate Program</Link>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Account <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/signup" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 first:rounded-t-lg">Open Account</Link>
                <Link to="/login" className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 last:rounded-b-lg">Client Login</Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden lg:block">
              <Button className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground font-semibold rounded-lg px-6">
                CLIENT LOGIN
              </Button>
            </Link>
            <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border/30 pt-4 space-y-3">
            <Link to="/company" className="block text-sm text-muted-foreground hover:text-foreground py-2">Company</Link>
            <Link to="/markets" className="block text-sm text-muted-foreground hover:text-foreground py-2">Markets</Link>
            <Link to="/account-types" className="block text-sm text-muted-foreground hover:text-foreground py-2">Account Types</Link>
            <Link to="/platforms" className="block text-sm text-muted-foreground hover:text-foreground py-2">Trading Platform</Link>
            <Link to="/affiliate/apply" className="block text-sm text-muted-foreground hover:text-foreground py-2">Partner</Link>
            <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground py-2">Contact</Link>
            <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground py-2">Client Login</Link>
            <Link to="/signup">
              <Button className="w-full bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground font-semibold">
                Open Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default BrokerNavigation;
