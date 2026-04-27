import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerFooter from "@/components/broker/BrokerFooter";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Monitor, Smartphone, Globe, Zap, BarChart3, Shield } from "lucide-react";

const Platforms = () => {
  return (
    <div className="min-h-screen bg-background">
      <BrokerNavigation />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-broker-primary mb-4">Trading Platform</h1>
          <p className="text-muted-foreground text-lg mb-12 max-w-3xl">
            Trade on the world's most popular platform — Condor. Available on desktop, web, and mobile.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Monitor, title: "Desktop", desc: "Full-featured desktop application for Windows and macOS with advanced charting." },
              { icon: Globe, title: "WebTrader", desc: "Trade directly from your browser — no download needed, access from anywhere." },
              { icon: Smartphone, title: "Mobile", desc: "Trade on the go with native iOS and Android apps with full functionality." },
            ].map((p, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-broker-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <p.icon className="w-8 h-8 text-broker-primary" />
                </div>
                <h3 className="text-xl font-heading font-bold">{p.title}</h3>
                <p className="text-muted-foreground text-sm">{p.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-heading font-bold mb-8">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Zap, title: "Fast Execution", desc: "Ultra-low latency order execution" },
              { icon: BarChart3, title: "Advanced Charts", desc: "50+ technical indicators and drawing tools" },
              { icon: Shield, title: "Secure Trading", desc: "256-bit SSL encryption on all connections" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 bg-card border border-border rounded-xl p-6">
                <div className="w-10 h-10 bg-broker-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-broker-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/signup">
              <Button className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground px-8 py-6 text-lg">
                Open an Account & Start Trading
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <BrokerFooter />
    </div>
  );
};

export default Platforms;
