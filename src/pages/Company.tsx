import { Link } from "react-router-dom";
import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerFooter from "@/components/broker/BrokerFooter";
import bullPhoneImage from "@/assets/bull-phone.webp";

const Company = () => {
  return (
    <div className="min-h-screen bg-background">
      <BrokerNavigation />
      
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-broker-primary">
                COMPANY
              </h1>
              
              <p className="text-muted-foreground text-lg">
                Founded in 2017, Kubera Capital Markets Ltd. is a licensed money broker providing 
                access to global financial markets.
              </p>
              
              <p className="text-muted-foreground">
                Kubera Capital Markets Ltd. is regulated and authorized by the Labuan Financial 
                Services Authority (LFSA) to conduct Labuan Money Broking Business (
                <a href="#" className="text-broker-primary hover:underline">License Number MB/21/0086</a>
                ). Our business address is at Office Suite 1307, Level 13(C), Block 4, Financial 
                Park Complex, Jalan Merdeka, 87000 Labuan, Malaysia.
              </p>
              
              <div className="space-y-4">
                <p className="text-foreground font-semibold">Our Services:</p>
                <p className="text-muted-foreground">
                  We offer <span className="font-medium text-foreground">Contracts for Differences (CFDs)</span> trading 
                  in Forex, Indices and Commodities with competitive spreads and fast execution.
                </p>
              </div>
            </div>
            
            <div className="relative lg:block hidden">
              <img 
                src={bullPhoneImage} 
                alt="Kubera Markets Bull" 
                className="w-full max-w-md mx-auto h-auto"
              />
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-broker-primary mb-6">
            OUR MISSION
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-4xl">
            At Kubera Capital Markets, our mission is to empower individuals with seamless access to global financial markets through cutting-edge technology, 
            transparent practices, and a commitment to financial literacy. We strive to build trust, foster growth, and enable smart trading for a more 
            prosperous future.
          </p>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-broker-primary mb-6">
            VALUES
          </h2>
          
          <p className="text-muted-foreground text-lg mb-10 max-w-4xl">
            We will always try to be different and put our client's needs first through our professional conduct, ability to achieve competitive trading conditions and 
            access to cutting-edge technology. We will accomplish this by:
          </p>
          
          <div className="space-y-8 max-w-4xl">
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Integrity First</h3>
              <p className="text-muted-foreground">
                We uphold the highest standards of honesty, ethics, and transparency in all our interactions and services.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Client-Centric Approach</h3>
              <p className="text-muted-foreground">
                Our clients' success is our success. We prioritize their needs and strive to deliver an exceptional, user-focused experience.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Innovation & Excellence</h3>
              <p className="text-muted-foreground">
                We embrace innovation to provide cutting-edge tools and technologies, continuously improving to stay ahead in a dynamic market landscape.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Financial Empowerment</h3>
              <p className="text-muted-foreground">
                We believe in democratizing access to financial markets and equipping clients with the knowledge and tools to invest confidently and wisely.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Security & Trust</h3>
              <p className="text-muted-foreground">
                We are committed to safeguarding user data and assets through robust security protocols and transparent operations.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Global Perspective</h3>
              <p className="text-muted-foreground">
                With a worldwide view, we aim to connect diverse markets and opportunities, enabling clients to trade across borders with confidence.
              </p>
            </div>
          </div>
        </section>
      </main>

      <BrokerFooter />
    </div>
  );
};

export default Company;
