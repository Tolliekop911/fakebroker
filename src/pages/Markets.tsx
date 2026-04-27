import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerFooter from "@/components/broker/BrokerFooter";

const marketsData = {
  forex: [
    { symbol: "EUR/USD", name: "Euro / US Dollar", bid: 1.0847, ask: 1.0849, change: 0.12, spread: 0.2 },
    { symbol: "GBP/USD", name: "British Pound / US Dollar", bid: 1.2654, ask: 1.2657, change: -0.08, spread: 0.3 },
    { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", bid: 157.42, ask: 157.45, change: 0.24, spread: 0.3 },
    { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", bid: 0.8892, ask: 0.8895, change: 0.05, spread: 0.3 },
    { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", bid: 0.6234, ask: 0.6237, change: -0.15, spread: 0.3 },
    { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", bid: 1.4321, ask: 1.4324, change: 0.09, spread: 0.3 },
    { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", bid: 0.5612, ask: 0.5615, change: -0.11, spread: 0.3 },
    { symbol: "EUR/GBP", name: "Euro / British Pound", bid: 0.8572, ask: 0.8575, change: 0.03, spread: 0.3 },
  ],
  indices: [
    { symbol: "US500", name: "S&P 500", bid: 6012.50, ask: 6013.25, change: 0.45, spread: 0.75 },
    { symbol: "US30", name: "Dow Jones 30", bid: 43542.00, ask: 43545.00, change: 0.32, spread: 3.0 },
    { symbol: "US100", name: "Nasdaq 100", bid: 21654.25, ask: 21656.50, change: 0.67, spread: 2.25 },
    { symbol: "UK100", name: "FTSE 100", bid: 8245.50, ask: 8247.00, change: -0.12, spread: 1.5 },
    { symbol: "GER40", name: "DAX 40", bid: 20542.00, ask: 20545.00, change: 0.28, spread: 3.0 },
    { symbol: "FRA40", name: "CAC 40", bid: 7456.25, ask: 7458.00, change: 0.15, spread: 1.75 },
    { symbol: "JPN225", name: "Nikkei 225", bid: 38925.00, ask: 38932.00, change: -0.22, spread: 7.0 },
    { symbol: "AUS200", name: "ASX 200", bid: 8234.50, ask: 8236.00, change: 0.18, spread: 1.5 },
  ],
  commodities: [
    { symbol: "XAUUSD", name: "Gold / US Dollar", bid: 2645.32, ask: 2645.82, change: 0.35, spread: 0.5 },
    { symbol: "XAGUSD", name: "Silver / US Dollar", bid: 29.85, ask: 29.88, change: -0.42, spread: 0.03 },
    { symbol: "XPTUSD", name: "Platinum / US Dollar", bid: 932.45, ask: 933.95, change: 0.18, spread: 1.5 },
    { symbol: "USOIL", name: "Crude Oil WTI", bid: 71.24, ask: 71.28, change: -0.85, spread: 0.04 },
    { symbol: "UKOIL", name: "Brent Crude Oil", bid: 74.56, ask: 74.60, change: -0.72, spread: 0.04 },
    { symbol: "NATGAS", name: "Natural Gas", bid: 3.245, ask: 3.255, change: 1.25, spread: 0.01 },
    { symbol: "COPPER", name: "Copper", bid: 4.125, ask: 4.130, change: 0.45, spread: 0.005 },
  ],
  crypto: [
    { symbol: "BTC/USD", name: "Bitcoin / US Dollar", bid: 104250.00, ask: 104280.00, change: 2.15, spread: 30.0 },
    { symbol: "ETH/USD", name: "Ethereum / US Dollar", bid: 3425.50, ask: 3428.00, change: 1.85, spread: 2.5 },
    { symbol: "XRP/USD", name: "Ripple / US Dollar", bid: 2.3450, ask: 2.3480, change: 3.42, spread: 0.003 },
    { symbol: "SOL/USD", name: "Solana / US Dollar", bid: 215.45, ask: 215.75, change: 4.25, spread: 0.3 },
    { symbol: "ADA/USD", name: "Cardano / US Dollar", bid: 1.0845, ask: 1.0860, change: 2.18, spread: 0.0015 },
    { symbol: "DOGE/USD", name: "Dogecoin / US Dollar", bid: 0.3845, ask: 0.3852, change: 1.52, spread: 0.0007 },
  ],
};

const MarketRow = ({ market, onClick }: { market: typeof marketsData.forex[0]; onClick: () => void }) => {
  const isPositive = market.change >= 0;
  return (
    <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer" onClick={onClick}>
      <td className="py-4 px-4">
        <div>
          <div className="font-semibold text-foreground">{market.symbol}</div>
          <div className="text-xs text-muted-foreground">{market.name}</div>
        </div>
      </td>
      <td className="py-4 px-4 text-right font-mono text-foreground">{market.bid.toFixed(market.bid < 10 ? 4 : 2)}</td>
      <td className="py-4 px-4 text-right font-mono text-foreground">{market.ask.toFixed(market.ask < 10 ? 4 : 2)}</td>
      <td className="py-4 px-4 text-right font-mono text-muted-foreground">{market.spread.toFixed(market.spread < 1 ? 3 : 1)}</td>
      <td className="py-4 px-4 text-right">
        <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-broker-primary' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-semibold">{isPositive ? '+' : ''}{market.change.toFixed(2)}%</span>
        </div>
      </td>
    </tr>
  );
};

const MarketTable = ({ markets, searchTerm, onMarketClick }: { markets: typeof marketsData.forex; searchTerm: string; onMarketClick: (symbol: string) => void }) => {
  const normalizedSearch = searchTerm.toLowerCase().replace(/[\/\s]/g, '');
  const filteredMarkets = markets.filter(m => {
    const normalizedSymbol = m.symbol.toLowerCase().replace(/[\/\s]/g, '');
    const normalizedName = m.name.toLowerCase().replace(/[\/\s]/g, '');
    return normalizedSymbol.includes(normalizedSearch) || normalizedName.includes(normalizedSearch);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="py-3 px-4 font-medium">Instrument</th>
            <th className="py-3 px-4 text-right font-medium">Bid</th>
            <th className="py-3 px-4 text-right font-medium">Ask</th>
            <th className="py-3 px-4 text-right font-medium">Spread</th>
            <th className="py-3 px-4 text-right font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {filteredMarkets.map((market) => (
            <MarketRow key={market.symbol} market={market} onClick={() => onMarketClick(market.symbol)} />
          ))}
        </tbody>
      </table>
      {filteredMarkets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No instruments found matching "{searchTerm}"</div>
      )}
    </div>
  );
};

const Markets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "forex";
  const [activeTab, setActiveTab] = useState(tabParam);

  // Sync tab when URL params change
  useMemo(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const handleMarketClick = (symbol: string) => {
    const urlSymbol = symbol.replace(/\//g, '-');
    navigate(`/markets/${urlSymbol}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <BrokerNavigation />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-4">
              Live <span className="text-broker-primary">Markets</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trade over 500 instruments across Forex, Indices, Commodities, and Cryptocurrencies with competitive spreads and 100% STP execution.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search instruments (e.g. EURUSD)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-card border-broker-primary/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-broker-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Instruments</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-broker-primary mb-1">0.0</div>
              <div className="text-sm text-muted-foreground">Spreads From</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-broker-primary mb-1">100:1</div>
              <div className="text-sm text-muted-foreground">Max Leverage</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-broker-primary mb-1">24/5</div>
              <div className="text-sm text-muted-foreground">Trading Hours</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 p-0 h-auto">
                <TabsTrigger value="forex" className="rounded-none border-b-2 border-transparent data-[state=active]:border-broker-primary data-[state=active]:bg-transparent py-4 px-6">Forex</TabsTrigger>
                <TabsTrigger value="indices" className="rounded-none border-b-2 border-transparent data-[state=active]:border-broker-primary data-[state=active]:bg-transparent py-4 px-6">Indices</TabsTrigger>
                <TabsTrigger value="commodities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-broker-primary data-[state=active]:bg-transparent py-4 px-6">Commodities</TabsTrigger>
                <TabsTrigger value="crypto" className="rounded-none border-b-2 border-transparent data-[state=active]:border-broker-primary data-[state=active]:bg-transparent py-4 px-6">Crypto</TabsTrigger>
              </TabsList>
              <TabsContent value="forex" className="m-0"><MarketTable markets={marketsData.forex} searchTerm={searchTerm} onMarketClick={handleMarketClick} /></TabsContent>
              <TabsContent value="indices" className="m-0"><MarketTable markets={marketsData.indices} searchTerm={searchTerm} onMarketClick={handleMarketClick} /></TabsContent>
              <TabsContent value="commodities" className="m-0"><MarketTable markets={marketsData.commodities} searchTerm={searchTerm} onMarketClick={handleMarketClick} /></TabsContent>
              <TabsContent value="crypto" className="m-0"><MarketTable markets={marketsData.crypto} searchTerm={searchTerm} onMarketClick={handleMarketClick} /></TabsContent>
            </Tabs>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8 max-w-3xl mx-auto">
            Prices shown are indicative only. CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage.
          </p>
        </div>
      </main>
      <BrokerFooter />
    </div>
  );
};

export default Markets;
