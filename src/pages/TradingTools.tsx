import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerFooter from "@/components/broker/BrokerFooter";
import { Calculator, TrendingUp, Calendar, BarChart3, Globe, Clock } from "lucide-react";

const TradingTools = () => {
  const tools = [
    { icon: Calculator, title: "Pip Calculator", desc: "Calculate pip values for any currency pair and lot size." },
    { icon: TrendingUp, title: "Margin Calculator", desc: "Determine required margin based on leverage and position size." },
    { icon: Calendar, title: "Economic Calendar", desc: "Stay informed with key economic events and announcements." },
    { icon: BarChart3, title: "Technical Analysis", desc: "Advanced charting with 50+ indicators and drawing tools." },
    { icon: Globe, title: "Market Sentiment", desc: "See real-time trader sentiment across instruments." },
    { icon: Clock, title: "Trading Hours", desc: "Check market opening and closing times across the globe." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BrokerNavigation />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-broker-primary mb-4">Trading Tools</h1>
          <p className="text-muted-foreground text-lg mb-12 max-w-3xl">
            Professional-grade tools to help you analyze markets and manage your trading effectively.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-8 space-y-4">
                <div className="w-14 h-14 bg-broker-primary/10 rounded-xl flex items-center justify-center">
                  <tool.icon className="w-7 h-7 text-broker-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold">{tool.title}</h3>
                <p className="text-muted-foreground text-sm">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BrokerFooter />
    </div>
  );
};

export default TradingTools;
