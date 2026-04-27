import { Wrench, BookOpen, Zap, PercentCircle } from "lucide-react";

const badges = [
  { icon: Wrench, label: "Enhanced Tools" },
  { icon: BookOpen, label: "Trading Guides" },
  { icon: Zap, label: "Fast Execution" },
  { icon: PercentCircle, label: "0% Commission" },
];

const BrokerFeatureBadges = () => {
  return (
    <section className="py-10 border-t border-border/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-broker-primary flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-broker-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokerFeatureBadges;
