import iconInstruments from "@/assets/icon-instruments.png";
import iconMarketConditions from "@/assets/icon-market-conditions.png";
import iconSafety from "@/assets/icon-safety.png";
import iconPlatform from "@/assets/icon-platform.png";
import iconSupport from "@/assets/icon-support.png";
import iconNoCommission from "@/assets/icon-no-commission.png";

const features = [
  {
    image: iconInstruments,
    title: "Wide range of instruments",
    description: "Trade a large range of instruments including FX, CFDs and commodities.",
  },
  {
    image: iconMarketConditions,
    title: "Unparalleled market conditions",
    description: "Experience institutional-grade trading conditions in all types of accounts.",
  },
  {
    image: iconSafety,
    title: "Safety of funds",
    description: "All client's funds are held in a segregated account at the top tier banks.",
  },
  {
    image: iconPlatform,
    title: "Best trading platform",
    description: "Both desktop and mobile trading platforms are available to trade at your convenience.",
  },
  {
    image: iconSupport,
    title: "24/5 Trading Support",
    description: "We are dedicated to providing you 24/5 trading and technology support.",
  },
  {
    image: iconNoCommission,
    title: "No Commissions",
    description: "The bid/ask market prices include our fee mark up on the spreads from our liquidity providers.",
  },
];

const BrokerWhyChoose = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
          Why choose <span className="text-broker-primary">Kubera Markets?</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl mb-12">
          We offer one-click trading experience with 150+ trading instruments.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col gap-4 p-6">
              <img
                src={feature.image}
                alt={feature.title}
                loading="lazy"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
              />
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-muted-foreground/50 rounded-full" />
                <h3 className="text-lg font-heading font-bold text-foreground">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokerWhyChoose;
