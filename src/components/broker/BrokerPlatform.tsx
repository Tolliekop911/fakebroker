import { Button } from "@/components/ui/button";
import condorLaptop from "@/assets/condor-laptop.png";
import condorMobile from "@/assets/condor-mobile.png";

const BrokerPlatform = () => {
  return (
    <section className="py-20 bg-[hsl(220,30%,8%)]">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src={condorLaptop}
              alt="Condor Trading Platform on Desktop"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <img
              src={condorMobile}
              alt="Condor Trading Platform on Mobile"
              className="absolute -left-4 -bottom-8 w-32 h-auto drop-shadow-2xl"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold leading-tight text-foreground">
              Live Fx & Spot Metal Quotes
            </h2>
            <p className="text-lg text-broker-primary font-semibold">
              Low spreads on more than 50 instruments
            </p>

            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-foreground">
                <div className="w-2 h-2 bg-broker-primary rounded-full" />
                Ultra-competitive pricing
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <div className="w-2 h-2 bg-broker-primary rounded-full" />
                Trading flexibility
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <div className="w-2 h-2 bg-broker-primary rounded-full" />
                Award-winning platform
              </li>
            </ul>

            <div className="pt-4">
              <p className="text-muted-foreground text-sm mb-1">
                Trade wherever you are, whenever you want to.
              </p>
              <p className="text-broker-primary font-semibold">
                Start trading with Kubera Markets
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrokerPlatform;
