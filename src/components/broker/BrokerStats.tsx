import globeImg from "@/assets/globe-network.png";

const stats = [
  { value: "250M+", label: "Trading Transactions" },
  { value: "90+", label: "Liquidity Providers" },
  { value: "30K+", label: "Retail & Institutional Traders" },
  { value: "2K+", label: "Money Managers" },
];

const BrokerStats = () => {
  return (
    <section className="py-16 bg-[hsl(220,30%,8%)]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              We are committed to meeting your{" "}
              <span className="text-broker-primary">CFD and FX trading needs</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Our goal is to provide clients access to a broad range of global financial markets through our award-winning trading platform and mobile apps, supported with competitive pricing, sophisticated charting, and superior execution technology.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={globeImg}
              alt="Global trading network"
              loading="lazy"
              width={500}
              height={500}
              className="w-full max-w-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-1 h-8 bg-muted-foreground/50 rounded-full" />
                <span className="text-4xl lg:text-5xl font-heading font-bold text-broker-primary">
                  {stat.value}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokerStats;
