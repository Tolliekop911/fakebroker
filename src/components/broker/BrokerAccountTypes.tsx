import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const accounts = [
  {
    name: "Pro Account",
    description: "Designed for traders especially those that are trading large volumes.",
    features: [
      "Deposit: Minimum USD 1000",
      "Spread: From 0.9 pips",
      "Leverage: Up to 1:100",
      "Commission: No",
    ],
    highlighted: false,
  },
  {
    name: "Standard Account",
    description: "Designed for traders especially new to markets or trading smaller volumes.",
    features: [
      "Deposit: Minimum USD 100",
      "Spread: From 1.8 pips",
      "Leverage: Up to 1:100",
      "Commission: No",
    ],
    highlighted: true,
  },
];

const BrokerAccountTypes = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-4">
          <p className="text-broker-primary font-medium mb-2">Trade with confidence</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
            Complete package for every trader
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          {accounts.map((account, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 border transition-all ${
                account.highlighted
                  ? "border-broker-primary bg-broker-primary/5 shadow-lg shadow-broker-primary/10"
                  : "border-border/30 bg-card"
              }`}
            >
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                {account.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">{account.description}</p>

              <ul className="space-y-3 mb-8">
                {account.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-broker-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/signup">
                <Button
                  className={`w-full font-semibold rounded-lg ${
                    account.highlighted
                      ? "bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  Open an Account
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokerAccountTypes;
