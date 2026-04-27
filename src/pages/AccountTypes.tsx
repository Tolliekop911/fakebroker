import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerFooter from "@/components/broker/BrokerFooter";
import BrokerAccountTypes from "@/components/broker/BrokerAccountTypes";

const AccountTypes = () => {
  return (
    <div className="min-h-screen bg-background">
      <BrokerNavigation />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-4">
              Our <span className="text-broker-primary">Account Types</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the account that best suits your trading style and experience level.
            </p>
          </div>
          <BrokerAccountTypes />
        </div>
      </main>
      <BrokerFooter />
    </div>
  );
};

export default AccountTypes;
