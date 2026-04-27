import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bullPhoneImage from "@/assets/bull-phone.webp";

const slides = [
  {
    heading: (
      <>
        Connect to global markets through{" "}
        <span className="text-broker-primary">Kubera Markets.</span>
      </>
    ),
    subtext: "Trade Currencies, Commodities (CFDs) with a trusted Broker.",
  },
  {
    heading: (
      <>
        True and transparent{" "}
        <span className="text-broker-primary">trading conditions.</span>
      </>
    ),
    subtext: "We provide fair trading conditions for all types of traders.",
  },
  {
    heading: (
      <>
        Trade with{" "}
        <span className="text-broker-primary">confidence</span> and security.
      </>
    ),
    subtext: "Your funds are held in segregated accounts at top-tier banks.",
  },
];

const BrokerHero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-28 pb-16 overflow-hidden bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          <div className="space-y-6">
            <h1
              key={current}
              className="text-4xl lg:text-6xl font-heading font-bold leading-tight text-foreground animate-fade-in"
            >
              {slides[current].heading}
            </h1>

            <p className="text-lg text-muted-foreground">
              ({slides[current].subtext})
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground font-semibold px-8 rounded-lg"
                >
                  Live Account
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-broker-primary text-broker-primary hover:bg-broker-primary/10 font-semibold px-8 rounded-lg"
                >
                  Demo Account
                </Button>
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="flex gap-2 pt-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === current
                      ? "bg-broker-primary w-8"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <img
              src={bullPhoneImage}
              alt="Kubera Markets Trading"
              className="w-64 md:w-80 lg:w-full lg:max-w-md object-contain"
            />
          </div>
        </div>
      </div>

      <div className="absolute top-1/4 right-0 w-96 h-96 bg-broker-primary/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default BrokerHero;
