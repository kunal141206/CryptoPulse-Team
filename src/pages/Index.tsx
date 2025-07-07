
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CryptoCard from "@/components/CryptoCard";
import PriceChart from "@/components/PriceChart";
import MarketStats from "@/components/MarketStats";
import ThemeToggle from "@/components/ThemeToggle";
import { Moon, Sun, Download, Star } from "lucide-react";

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  icon: string;
  isFavorite: boolean;
  sparklineData: number[];
}

const SUPPORTED_CRYPTOS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: 'BNB' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: 'ADA' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: 'SOL' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: 'XRP' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: 'DOT' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'DOGE' },
];

const Index = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState('BTCUSDT');
  const [chartDuration, setChartDuration] = useState('24H');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Initialize crypto data
  useEffect(() => {
    const initialData = SUPPORTED_CRYPTOS.map(crypto => ({
      symbol: crypto.symbol,
      name: crypto.name,
      price: Math.random() * 50000 + 1000, // Mock initial price
      change24h: (Math.random() - 0.5) * 20, // Random change
      volume24h: Math.random() * 1000000000,
      icon: crypto.icon,
      isFavorite: false,
      sparklineData: Array.from({ length: 20 }, () => Math.random() * 100)
    }));
    setCryptoData(initialData);
  }, []);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const streams = SUPPORTED_CRYPTOS.map(crypto => 
          `${crypto.symbol.toLowerCase()}@ticker`
        ).join('/');
        
        const websocket = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
        
        websocket.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          toast.success('Connected to live data feed');
        };

        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          updateCryptoPrice(data);
        };

        websocket.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          toast.error('Disconnected from live data feed');
          // Reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast.error('Connection error - using demo data');
        };

        setWs(websocket);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        toast.error('Using demo data - live connection unavailable');
        startDemoMode();
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Demo mode for when WebSocket fails
  const startDemoMode = () => {
    const interval = setInterval(() => {
      setCryptoData(prev => prev.map(crypto => ({
        ...crypto,
        price: crypto.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% random change
        change24h: crypto.change24h + (Math.random() - 0.5) * 2,
        sparklineData: [...crypto.sparklineData.slice(1), crypto.price]
      })));
    }, 2000);

    return () => clearInterval(interval);
  };

  const updateCryptoPrice = (tickerData: any) => {
    setCryptoData(prev => prev.map(crypto => {
      if (crypto.symbol === tickerData.s) {
        const newPrice = parseFloat(tickerData.c);
        return {
          ...crypto,
          price: newPrice,
          change24h: parseFloat(tickerData.P),
          volume24h: parseFloat(tickerData.v),
          sparklineData: [...crypto.sparklineData.slice(1), newPrice]
        };
      }
      return crypto;
    }));
  };

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
    
    setCryptoData(prev => prev.map(crypto => ({
      ...crypto,
      isFavorite: crypto.symbol === symbol ? !crypto.isFavorite : crypto.isFavorite
    })));
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Symbol', 'Name', 'Price', '24h Change %', '24h Volume'],
      ...cryptoData.map(crypto => [
        crypto.symbol,
        crypto.name,
        crypto.price.toFixed(2),
        crypto.change24h.toFixed(2),
        crypto.volume24h.toFixed(0)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptopulse-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const favoriteCoins = cryptoData.filter(crypto => favorites.includes(crypto.symbol));
  const allCoins = cryptoData;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CryptoPulse
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time cryptocurrency tracker with live market data
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Live Data' : 'Demo Mode'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Market Stats */}
        <MarketStats cryptoData={cryptoData} />

        {/* Favorites Section */}
        {favoriteCoins.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <h2 className="text-2xl font-semibold">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favoriteCoins.map(crypto => (
                <CryptoCard
                  key={crypto.symbol}
                  crypto={crypto}
                  onToggleFavorite={toggleFavorite}
                  onSelect={setSelectedCrypto}
                  isSelected={selectedCrypto === crypto.symbol}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price Chart */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Price Chart</CardTitle>
                <div className="flex gap-2">
                  {['1H', '24H', '7D'].map(duration => (
                    <Button
                      key={duration}
                      variant={chartDuration === duration ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartDuration(duration)}
                    >
                      {duration}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PriceChart
                symbol={selectedCrypto}
                duration={chartDuration}
                cryptoData={cryptoData}
              />
            </CardContent>
          </Card>
        </div>

        {/* All Cryptocurrencies */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Cryptocurrencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allCoins.map(crypto => (
              <CryptoCard
                key={crypto.symbol}
                crypto={crypto}
                onToggleFavorite={toggleFavorite}
                onSelect={setSelectedCrypto}
                isSelected={selectedCrypto === crypto.symbol}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
