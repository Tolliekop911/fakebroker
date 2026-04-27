import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  HelpCircle, 
  Search,
  Monitor,
  Smartphone,
  Apple
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BrokerSupport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const currentTab = useMemo(() => {
    if (location.pathname.includes("/downloads")) return "downloads";
    if (location.pathname.includes("/faq/trading")) return "faq-trading";
    return "faq-general";
  }, [location.pathname]);

  const onTabChange = (value: string) => {
    switch (value) {
      case "downloads":
        navigate("/support/downloads");
        break;
      case "faq-general":
        navigate("/support/faq/general");
        break;
      case "faq-trading":
        navigate("/support/faq/trading");
        break;
    }
  };

  const downloads = [
    { name: "Condor - Windows", icon: Monitor, version: "1.0", size: "45 MB" },
    { name: "Condor - macOS", icon: Apple, version: "1.0", size: "52 MB" },
    { name: "Condor - iOS", icon: Smartphone, version: "1.0", size: "120 MB" },
    { name: "Condor - Android", icon: Smartphone, version: "1.0", size: "85 MB" },
  ];

  const generalFAQs = [
    {
      question: "How do I open a trading account?",
      answer: "You can open a trading account by clicking 'New Account' in your dashboard. Choose between Live or Demo account types, select your preferred leverage, and complete the verification process."
    },
    {
      question: "What documents do I need for verification?",
      answer: "You'll need a valid government-issued ID (passport, driver's license, or national ID) and a proof of address document (utility bill, bank statement) dated within the last 3 months."
    },
    {
      question: "How long does verification take?",
      answer: "Most verifications are completed within 24 hours. Complex cases may take up to 48 hours. You'll receive an email notification once your account is verified."
    },
    {
      question: "What are the deposit methods available?",
      answer: "We accept bank transfers, credit/debit cards (Visa, Mastercard), and various cryptocurrencies including Bitcoin and Ethereum. Processing times vary by method."
    },
    {
      question: "How do I withdraw funds?",
      answer: "Navigate to Deposit/Withdraw in your dashboard, select 'Withdraw', choose your method, and enter the amount. Withdrawals are processed within 1-3 business days."
    },
  ];

  const tradingFAQs = [
    {
      question: "What leverage options are available?",
      answer: "We offer leverage from 1:10 up to 1:500 depending on your account type and the instruments you trade. Leverage settings can be adjusted in your account settings."
    },
    {
      question: "What are the trading hours?",
      answer: "Forex markets are open 24/5 from Sunday 5 PM ET to Friday 5 PM ET. Cryptocurrency pairs are available 24/7. Specific instrument hours can be found in the platform."
    },
    {
      question: "What is the minimum trade size?",
      answer: "The minimum trade size is 0.01 lots for most instruments. This allows for precise position sizing and risk management."
    },
    {
      question: "How are spreads calculated?",
      answer: "Spreads are variable and depend on market conditions, liquidity, and the instrument. Our spreads start from 0.0 pips on major pairs with our ECN accounts."
    },
    {
      question: "What is margin call and stop out?",
      answer: "Margin call occurs at 100% margin level - you'll receive a warning. Stop out occurs at 50% margin level - positions will be automatically closed to prevent negative balance."
    },
  ];

  const filterFAQs = (faqs: typeof generalFAQs) => {
    if (!searchQuery) return faqs;
    return faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Support Center</h1>
          <p className="text-muted-foreground">FAQs and platform downloads</p>
        </div>

        <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="bg-secondary/50 border border-border flex-wrap">
            <TabsTrigger value="faq-general" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ - General
            </TabsTrigger>
            <TabsTrigger value="faq-trading" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ - Trading
            </TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-broker-primary data-[state=active]:text-broker-primary-foreground">
              <Download className="w-4 h-4 mr-2" />
              Downloads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq-general" className="mt-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">General Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {filterFAQs(generalFAQs).map((faq, index) => (
                  <AccordionItem key={index} value={`general-${index}`}>
                    <AccordionTrigger className="text-left hover:text-broker-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="faq-trading" className="mt-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Trading Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {filterFAQs(tradingFAQs).map((faq, index) => (
                  <AccordionItem key={index} value={`trading-${index}`}>
                    <AccordionTrigger className="text-left hover:text-broker-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="downloads" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {downloads.map((download, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-broker-primary/10 rounded-lg flex items-center justify-center">
                      <download.icon className="w-6 h-6 text-broker-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{download.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Version {download.version} • {download.size}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerSupport;
