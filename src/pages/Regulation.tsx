import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerFooter from "@/components/broker/BrokerFooter";
import { Shield, CheckCircle } from "lucide-react";

const Regulation = () => {
  return (
    <div className="min-h-screen bg-background">
      <BrokerNavigation />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-broker-primary mb-4">Regulation</h1>
          <p className="text-muted-foreground text-lg mb-12 max-w-3xl">
            Kubera Capital Markets Ltd. operates under strict regulatory oversight to ensure the safety and integrity of your investments.
          </p>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-card border border-border rounded-xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-broker-primary" />
                <h2 className="text-xl font-heading font-bold">Regulatory Authority</h2>
              </div>
              <p className="text-muted-foreground">
                Kubera Capital Markets Ltd. (Company No. LL17507) is regulated and authorized by the
                <strong className="text-foreground"> Labuan Financial Services Authority (LFSA)</strong> to conduct
                Labuan Money Broking Business.
              </p>
              <div className="bg-broker-primary/5 border border-broker-primary/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-broker-primary">License Number: MB/21/0086</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-6">
              <h2 className="text-xl font-heading font-bold">Client Protection</h2>
              <ul className="space-y-4">
                {[
                  "Segregated client funds in top-tier banks",
                  "Negative balance protection",
                  "Regular external audits",
                  "Transparent fee structure",
                  "Anti-money laundering (AML) compliance",
                  "Know Your Customer (KYC) procedures",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-broker-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-xl font-heading font-bold mb-4">Business Operations</h2>
            <p className="text-muted-foreground mb-4">
              Kubera Capital Markets Ltd. will exclusively function as a mediator and is explicitly forbidden from
              acting as a principal. The client shall engage in transactions with Kubera Capital Markets Ltd. in
              the capacity of a mediator, facilitating the connection of counterparties based on mutually agreed terms.
            </p>
            <p className="text-muted-foreground">
              Our business address is at Office Suite 1307, Level 13(C), Block 4, Financial Park Complex,
              Jalan Merdeka, 87000 Labuan, Malaysia.
            </p>
          </div>
        </div>
      </main>
      <BrokerFooter />
    </div>
  );
};

export default Regulation;
