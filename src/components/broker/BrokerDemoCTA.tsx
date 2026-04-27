import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BrokerDemoCTA = () => {
  return (
    <section className="py-16 bg-broker-primary/10 border-y border-broker-primary/20">
      <div className="container mx-auto px-6 text-center">
        <p className="text-broker-primary font-medium text-sm mb-2">Announcing</p>
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
          Free demo account for all traders
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Open a demo account to test your trading skill before opening a live account with Kubera Markets
        </p>
        <Link to="/signup">
          <Button size="lg" className="bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground font-semibold px-8 rounded-lg">
            Learn more
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default BrokerDemoCTA;
