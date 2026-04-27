import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerHero from "@/components/broker/BrokerHero";
import BrokerFeatureBadges from "@/components/broker/BrokerFeatureBadges";
import BrokerMarkets from "@/components/broker/BrokerMarkets";
import BrokerWhyChoose from "@/components/broker/BrokerWhyChoose";
import BrokerStats from "@/components/broker/BrokerStats";
import BrokerAccountTypes from "@/components/broker/BrokerAccountTypes";
import BrokerDemoCTA from "@/components/broker/BrokerDemoCTA";
import BrokerPayments from "@/components/broker/BrokerPayments";
import BrokerAwards from "@/components/broker/BrokerAwards";
import BrokerPlatform from "@/components/broker/BrokerPlatform";
import BrokerSteps from "@/components/broker/BrokerSteps";
import BrokerFooter from "@/components/broker/BrokerFooter";


const Broker = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <BrokerNavigation />
      <main>
        <BrokerHero />
        <BrokerFeatureBadges />
        <BrokerMarkets />
        <BrokerWhyChoose />
        <BrokerStats />
        <BrokerAccountTypes />
        <BrokerDemoCTA />
        <BrokerPayments />
        <BrokerAwards />
        <BrokerPlatform />
        <BrokerSteps />
      </main>
      <BrokerFooter />
      
    </div>
  );
};

export default Broker;
