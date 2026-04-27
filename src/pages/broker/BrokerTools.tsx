import { useState } from "react";
import BrokerDashboardLayout from "@/components/broker/BrokerDashboardLayout";
import { Calculator, TrendingUp, Calendar, BarChart3, Globe, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const pipSizes: Record<string, number> = {
  "EUR/USD": 0.0001,
  "GBP/USD": 0.0001,
  "USD/JPY": 0.01,
  "AUD/USD": 0.0001,
  "USD/CAD": 0.0001,
  "NZD/USD": 0.0001,
};

const PipCalculator = () => {
  const [pair, setPair] = useState("EUR/USD");
  const [lotSize, setLotSize] = useState("1");
  const [accountCurrency] = useState("USD");
  const [result, setResult] = useState<number | null>(null);

  const pipSize = pipSizes[pair] || 0.0001;

  const calculate = () => {
    const lots = parseFloat(lotSize);
    if (isNaN(lots)) return;
    // For pairs where USD is the quote currency (EUR/USD, GBP/USD, etc.):
    // Pip value = lots × contract_size × pip_size
    // For USD/JPY etc (USD is base), you'd also divide by current price, but
    // since we don't have live prices, we show the value in quote currency terms.
    const value = lots * 100000 * pipSize;
    setResult(Number(value.toFixed(2)));
  };

  const isQuoteUSD = pair.endsWith("/USD");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Currency Pair</Label>
        <Select value={pair} onValueChange={setPair}>
          <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(pipSizes).map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Lot Size</Label>
        <Input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} className="bg-secondary border-border" placeholder="e.g. 1.0" step="0.01" />
      </div>
      <p className="text-xs text-muted-foreground">Pip size for {pair}: {pipSize}</p>
      <Button onClick={calculate} className="w-full bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">Calculate Pip Value</Button>
      {result !== null && (
        <div className="bg-broker-primary/10 border border-broker-primary/30 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">Pip Value</p>
          <p className="text-2xl font-bold text-broker-primary">
            {isQuoteUSD ? "$" : ""}{result} {!isQuoteUSD && <span className="text-sm font-normal text-muted-foreground">(in quote currency)</span>}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per pip for {lotSize} lot(s) of {pair}</p>
          {!isQuoteUSD && <p className="text-xs text-muted-foreground mt-1">Convert to USD using the current {pair} rate</p>}
        </div>
      )}
    </div>
  );
};

const MarginCalculator = () => {
  const [lotSize, setLotSize] = useState("1");
  const [price, setPrice] = useState("1.0850");
  const [leverage, setLeverage] = useState("100");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const lots = parseFloat(lotSize);
    const p = parseFloat(price);
    const lev = parseFloat(leverage);
    if (isNaN(lots) || isNaN(p) || isNaN(lev) || lev === 0) return;
    const margin = (lots * 100000 * p) / lev;
    setResult(Number(margin.toFixed(2)));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Lot Size</Label>
        <Input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} className="bg-secondary border-border" placeholder="e.g. 1.0" step="0.01" />
      </div>
      <div className="space-y-2">
        <Label>Current Price</Label>
        <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-secondary border-border" placeholder="e.g. 1.0850" step="0.0001" />
      </div>
      <div className="space-y-2">
        <Label>Leverage</Label>
        <Select value={leverage} onValueChange={setLeverage}>
          <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["10", "25", "50", "100", "200", "500"].map(l => (
              <SelectItem key={l} value={l}>1:{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={calculate} className="w-full bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">Calculate Required Margin</Button>
      {result !== null && (
        <div className="bg-broker-primary/10 border border-broker-primary/30 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">Required Margin</p>
          <p className="text-2xl font-bold text-broker-primary">${result.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">for {lotSize} lot(s) at 1:{leverage} leverage</p>
        </div>
      )}
    </div>
  );
};

const ProfitCalculator = () => {
  const [direction, setDirection] = useState("buy");
  const [lotSize, setLotSize] = useState("1");
  const [entryPrice, setEntryPrice] = useState("1.0850");
  const [exitPrice, setExitPrice] = useState("1.0900");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const lots = parseFloat(lotSize);
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    if (isNaN(lots) || isNaN(entry) || isNaN(exit)) return;
    const diff = direction === "buy" ? exit - entry : entry - exit;
    const pips = diff / 0.0001;
    const profit = pips * lots * 10;
    setResult(Number(profit.toFixed(2)));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Direction</Label>
        <Select value={direction} onValueChange={setDirection}>
          <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy (Long)</SelectItem>
            <SelectItem value="sell">Sell (Short)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Lot Size</Label>
        <Input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} className="bg-secondary border-border" step="0.01" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Entry Price</Label>
          <Input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="bg-secondary border-border" step="0.0001" />
        </div>
        <div className="space-y-2">
          <Label>Exit Price</Label>
          <Input type="number" value={exitPrice} onChange={e => setExitPrice(e.target.value)} className="bg-secondary border-border" step="0.0001" />
        </div>
      </div>
      <Button onClick={calculate} className="w-full bg-broker-primary hover:bg-broker-primary/90 text-broker-primary-foreground">Calculate Profit/Loss</Button>
      {result !== null && (
        <div className={`border rounded-xl p-4 text-center ${result >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
          <p className="text-sm text-muted-foreground">Profit / Loss</p>
          <p className={`text-2xl font-bold ${result >= 0 ? "text-green-500" : "text-red-500"}`}>
            {result >= 0 ? "+" : ""}${result.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

const swapData: Record<string, { buy: number; sell: number }> = {
  "EUR/USD": { buy: -6.8, sell: 2.1 },
  "GBP/USD": { buy: -7.4, sell: 2.6 },
  "USD/JPY": { buy: 4.2, sell: -8.1 },
  "XAU/USD": { buy: -18.5, sell: -12.2 },
  "US30": { buy: -9.5, sell: -9.5 },
  "AUD/USD": { buy: -3.5, sell: 1.2 },
};

const SwapCalculator = () => {
  const [symbol, setSymbol] = useState("EUR/USD");
  const [lotSize, setLotSize] = useState("1");
  const [days, setDays] = useState("1");
  const [direction, setDirection] = useState("buy");

  const swap = swapData[symbol] || { buy: 0, sell: 0 };
  const swapRate = direction === "buy" ? swap.buy : swap.sell;
  const totalSwap = parseFloat(lotSize) * swapRate * parseFloat(days);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Currency Pair</Label>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(swapData).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Direction</Label>
        <Select value={direction} onValueChange={setDirection}>
          <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy (Long)</SelectItem>
            <SelectItem value="sell">Sell (Short)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Lot Size</Label>
        <Input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} className="bg-secondary border-border" step="0.01" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Swap Long</p>
          <p className="font-semibold">{swap.buy} pts</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Swap Short</p>
          <p className="font-semibold">{swap.sell} pts</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Number of Days</Label>
        <Input type="number" value={days} onChange={e => setDays(e.target.value)} className="bg-secondary border-border" min="1" />
      </div>
      <div className={`border rounded-xl p-4 text-center ${totalSwap >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
        <p className="text-sm text-muted-foreground">Total Swap</p>
        <p className={`text-2xl font-bold ${totalSwap >= 0 ? "text-green-500" : "text-red-500"}`}>
          {totalSwap >= 0 ? "+" : ""}${isNaN(totalSwap) ? "0.00" : totalSwap.toFixed(2)}
        </p>
      <p className="text-xs text-muted-foreground mt-1">over {days} day(s)</p>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">
          ⚠ Swap rates shown are indicative only and may differ from live rates on your trading platform. Check Condor for actual swap charges.
        </p>
    </div>
  );
};

const tradingHours = [
  { market: "Forex", open: "Sunday 22:00", close: "Friday 22:00", timezone: "GMT", status: "24/5" },
  { market: "US Stocks", open: "14:30", close: "21:00", timezone: "GMT", status: "Mon-Fri" },
  { market: "EU Stocks", open: "08:00", close: "16:30", timezone: "GMT", status: "Mon-Fri" },
  { market: "Crypto", open: "24/7", close: "24/7", timezone: "GMT", status: "Always Open" },
  { market: "Commodities", open: "Sunday 23:00", close: "Friday 22:00", timezone: "GMT", status: "24/5" },
  { market: "Indices", open: "Monday 00:00", close: "Friday 21:00", timezone: "GMT", status: "Mon-Fri" },
];

const BrokerTools = () => {
  return (
    <BrokerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Trading Tools</h1>
          <p className="text-muted-foreground">Professional-grade calculators and market info</p>
        </div>

        <Tabs defaultValue="pip" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-secondary">
            <TabsTrigger value="pip" className="gap-2"><Calculator className="w-4 h-4" /> Pip</TabsTrigger>
            <TabsTrigger value="margin" className="gap-2"><TrendingUp className="w-4 h-4" /> Margin</TabsTrigger>
            <TabsTrigger value="profit" className="gap-2"><BarChart3 className="w-4 h-4" /> Profit/Loss</TabsTrigger>
            <TabsTrigger value="swap" className="gap-2"><Globe className="w-4 h-4" /> Swap</TabsTrigger>
            <TabsTrigger value="hours" className="gap-2"><Clock className="w-4 h-4" /> Hours</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="pip">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Pip Calculator</h2>
                <PipCalculator />
              </div>
            </TabsContent>

            <TabsContent value="margin">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Margin Calculator</h2>
                <MarginCalculator />
              </div>
            </TabsContent>

            <TabsContent value="profit">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Profit / Loss Calculator</h2>
                <ProfitCalculator />
              </div>
            </TabsContent>

            <TabsContent value="swap">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Swap Calculator</h2>
                <SwapCalculator />
              </div>
            </TabsContent>

            <TabsContent value="hours">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Trading Hours</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Market</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Opens</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Closes</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Timezone</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradingHours.map((h, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-3 px-4 font-medium">{h.market}</td>
                          <td className="py-3 px-4 text-muted-foreground">{h.open}</td>
                          <td className="py-3 px-4 text-muted-foreground">{h.close}</td>
                          <td className="py-3 px-4 text-muted-foreground">{h.timezone}</td>
                          <td className="py-3 px-4"><span className="bg-broker-primary/10 text-broker-primary px-2 py-1 rounded text-xs font-medium">{h.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </BrokerDashboardLayout>
  );
};

export default BrokerTools;
