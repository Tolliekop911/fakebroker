import laurelImg from "@/assets/laurel-wreath.png";

const awards = [
  { title: "Best Trading Experience", event: "JORDAN FOREX EXPO 2020" },
  { title: "Best Execution Broker", event: "FOREX EXPO DUBAI 2020" },
  { title: "Best Trading Platform", event: "LONDON SUMMIT 2020" },
];

const BrokerAwards = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-12 italic">
          Proudly serving traders since 2021.
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {awards.map((award, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <img
                src={laurelImg}
                alt="Award"
                loading="lazy"
                width={120}
                height={120}
                className="w-28 h-28 object-contain"
              />
              <h3 className="text-lg font-heading font-bold text-foreground">{award.title}</h3>
              <p className="text-sm text-broker-primary uppercase tracking-wider">{award.event}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokerAwards;
