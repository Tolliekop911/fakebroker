import { useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrokerNavigation from "@/components/broker/BrokerNavigation";
import BrokerFooter from "@/components/broker/BrokerFooter";
import { supabase } from "@/integrations/supabase/client";

// Symbol display info
const symbolInfo: Record<string, { symbol: string; name: string }> = {
  "EUR-USD": { symbol: "EUR/USD", name: "Euro / US Dollar" },
  "GBP-USD": { symbol: "GBP/USD", name: "British Pound / US Dollar" },
  "USD-JPY": { symbol: "USD/JPY", name: "US Dollar / Japanese Yen" },
  "USD-CHF": { symbol: "USD/CHF", name: "US Dollar / Swiss Franc" },
  "AUD-USD": { symbol: "AUD/USD", name: "Australian Dollar / US Dollar" },
  "USD-CAD": { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar" },
  "NZD-USD": { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar" },
  "EUR-GBP": { symbol: "EUR/GBP", name: "Euro / British Pound" },
  "US500": { symbol: "US500", name: "S&P 500" },
  "US30": { symbol: "US30", name: "Dow Jones 30" },
  "US100": { symbol: "US100", name: "Nasdaq 100" },
  "XAUUSD": { symbol: "XAU/USD", name: "Gold / US Dollar" },
  "XAGUSD": { symbol: "XAG/USD", name: "Silver / US Dollar" },
  "USOIL": { symbol: "USOIL", name: "Crude Oil WTI" },
  "BTC-USD": { symbol: "BTC/USD", name: "Bitcoin / US Dollar" },
  "ETH-USD": { symbol: "ETH/USD", name: "Ethereum / US Dollar" },
  "XRP-USD": { symbol: "XRP/USD", name: "Ripple / US Dollar" },
  "SOL-USD": { symbol: "SOL/USD", name: "Solana / US Dollar" },
};

// Map symbols to TradingView format
const getTradingViewSymbol = (symbol: string): string => {
  const symbolMap: Record<string, string> = {
    "EUR-USD": "FX:EURUSD",
    "GBP-USD": "FX:GBPUSD",
    "USD-JPY": "FX:USDJPY",
    "USD-CHF": "FX:USDCHF",
    "AUD-USD": "FX:AUDUSD",
    "USD-CAD": "FX:USDCAD",
    "NZD-USD": "FX:NZDUSD",
    "EUR-GBP": "FX:EURGBP",
    "US500": "FOREXCOM:SPXUSD",
    "US30": "FOREXCOM:DJI",
    "US100": "NASDAQ:NDX",
    "XAUUSD": "OANDA:XAUUSD",
    "XAGUSD": "OANDA:XAGUSD",
    "USOIL": "TVC:USOIL",
    "BTC-USD": "BINANCE:BTCUSDT",
    "ETH-USD": "BINANCE:ETHUSDT",
    "XRP-USD": "BINANCE:XRPUSDT",
    "SOL-USD": "BINANCE:SOLUSDT",
  };
  return symbolMap[symbol] || "FX:EURUSD";
};

interface LiveMarketData {
  bid: number;
  ask: number;
  price: number;
  spread: number;
  change: number;
  timestamp: string;
}

const MarketDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [liveData, setLiveData] = useState<LiveMarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const market = symbol ? symbolInfo[symbol] : null;

  // Fetch live data from edge function
  const fetchLiveData = useCallback(async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-market-price', {
        body: { symbol }
      });
      
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      
      setLiveData(data);
    } catch (err) {
      console.error('Failed to fetch live data:', err);
      setError('Failed to fetch live prices');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Initial fetch and auto-refresh (1/min) to stay within data-provider rate limits
  useEffect(() => {
    let timer: number | null = null;

    const tick = async () => {
      if (!document.hidden) {
        await fetchLiveData();
      }
      timer = window.setTimeout(tick, 60000);
    };

    tick();

    const onVisibilityChange = () => {
      if (!document.hidden) fetchLiveData();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (timer) window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchLiveData]);

  useEffect(() => {
    if (!containerRef.current || !symbol) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Create TradingView advanced chart widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      symbol: getTradingViewSymbol(symbol),
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      support_host: "https://www.tradingview.com"
    });

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

  }, [symbol]);

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <BrokerNavigation />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Market Not Found</h1>
            <p className="text-muted-foreground mb-8">The requested market could not be found.</p>
            <Link to="/markets">
              <Button className="bg-broker-primary hover:bg-broker-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Markets
              </Button>
            </Link>
          </div>
        </main>
        <BrokerFooter />
      </div>
    );
  }

  const displayChange = liveData?.change ?? 0;
  const isPositive = displayChange >= 0;

  // Format price based on value
  const formatPrice = (price: number) => {
    if (price > 1000) return price.toFixed(2);
    if (price > 10) return price.toFixed(2);
    return price.toFixed(5);
  };

  return (
    <div className="min-h-screen bg-background">
      <BrokerNavigation />
      
      <main className="pt-24 pb-0">
        {/* Normal view top content */}
        {!isFullscreen && (
          <div className="container mx-auto px-6">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <Link to="/markets">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-heading font-bold">
                    {market.symbol}
                  </h1>
                  <p className="text-muted-foreground">{market.name}</p>
                </div>
                <div
                  className={`flex items-center gap-2 text-2xl font-bold ${isPositive ? "text-broker-primary" : "text-red-500"}`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-6 h-6" />
                  ) : (
                    <TrendingDown className="w-6 h-6" />
                  )}
                  {isPositive ? "+" : ""}
                  {displayChange.toFixed(2)}%
                </div>
              </div>

              {/* Live Price Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Bid</div>
                  <div className="text-xl font-bold text-foreground font-mono">
                    {loading && !liveData ? "..." : liveData ? formatPrice(liveData.bid) : "--"}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Ask</div>
                  <div className="text-xl font-bold text-foreground font-mono">
                    {loading && !liveData ? "..." : liveData ? formatPrice(liveData.ask) : "--"}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Spread</div>
                  <div className="text-xl font-bold text-broker-primary font-mono">
                    {liveData
                      ? liveData.spread < 1
                        ? liveData.spread.toFixed(4)
                        : liveData.spread.toFixed(2)
                      : "--"}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Change</div>
                    <div
                      className={`text-xl font-bold font-mono ${isPositive ? "text-broker-primary" : "text-red-500"}`}
                    >
                      {isPositive ? "+" : ""}
                      {displayChange.toFixed(2)}%
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchLiveData}
                    disabled={loading}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 text-center text-sm text-destructive">
                  {error} - Prices shown on chart are live from TradingView
                </div>
              )}
          </div>
        )}

        {/* Chart section (same DOM node in normal + fullscreen so it always fills container) */}
        <section className="w-full px-2 sm:px-4 lg:px-6 pb-12">
          <div
            className={`bg-card border border-border rounded-2xl overflow-hidden relative tradingview-panel ${
              isFullscreen ? "fixed inset-0 z-50 rounded-none border-0" : ""
            }`}
          >
            {/* Overlay header + exit button in fullscreen */}
            {isFullscreen && (
              <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
                    <Minimize2 className="w-4 h-4 mr-2" />
                    Exit Fullscreen
                  </Button>
                  <span className="text-xl font-heading font-bold whitespace-nowrap">{market.symbol}</span>
                  <span className="text-muted-foreground text-sm truncate">{market.name}</span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bid:</span>{" "}
                    <span className="font-mono font-bold">{liveData ? formatPrice(liveData.bid) : "--"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ask:</span>{" "}
                    <span className="font-mono font-bold">{liveData ? formatPrice(liveData.ask) : "--"}</span>
                  </div>
                  <div className={`font-bold ${isPositive ? "text-broker-primary" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}
                    {displayChange.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            {/* Fullscreen button (normal mode) */}
            {!isFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="absolute top-3 right-3 z-10 bg-card/80 backdrop-blur-sm"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            )}

            <div
              ref={containerRef}
              className="tradingview-widget-container"
              style={{
                height: isFullscreen ? "100vh" : "800px",
                width: "100%",
                paddingTop: isFullscreen ? "44px" : "0px",
              }}
            />
          </div>
        </section>
      </main>

      {!isFullscreen && <BrokerFooter />}
    </div>
  );
};

export default MarketDetail;