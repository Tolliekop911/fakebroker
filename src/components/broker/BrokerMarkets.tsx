import { DollarSign, BarChart3, Flame, Package } from "lucide-react";

const products = [
  { icon: DollarSign, label: "Forex" },
  { icon: BarChart3, label: "Indexes" },
  { icon: Flame, label: "Energy" },
  { icon: Package, label: "Commodities" },
];

const BrokerMarkets = () => {
  return (
    <section className="py-16 bg-[hsl(220,30%,8%)]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Trading products
            </h2>
            <p className="text-muted-foreground">
              Choose from 4 asset classes and get access to 150+ trading instruments
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {products.map((product, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center">
                  <product.icon className="w-7 h-7 text-broker-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{product.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrokerMarkets;
