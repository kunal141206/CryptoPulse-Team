
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

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

interface MarketStatsProps {
  cryptoData: CryptoData[];
}

const MarketStats: React.FC<MarketStatsProps> = ({ cryptoData }) => {
  if (cryptoData.length === 0) {
    return null;
  }

  const totalMarketCap = cryptoData.reduce((sum, crypto) => sum + crypto.price * 1000000, 0);
  const totalVolume = cryptoData.reduce((sum, crypto) => sum + crypto.volume24h, 0);
  
  const topGainer = cryptoData.reduce((max, crypto) => 
    crypto.change24h > max.change24h ? crypto : max
  );
  
  const topLoser = cryptoData.reduce((min, crypto) => 
    crypto.change24h < min.change24h ? crypto : min
  );

  const gainers = cryptoData.filter(crypto => crypto.change24h > 0).length;
  const losers = cryptoData.filter(crypto => crypto.change24h < 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="text-2xl font-bold">
            ${(totalMarketCap / 1000000000).toFixed(2)}B
          </div>
          <div className="text-xs text-muted-foreground">
            Total market capitization
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">24h Volume</div>
          <div className="text-2xl font-bold">
            ${(totalVolume / 1000000000).toFixed(2)}B
          </div>
          <div className="text-xs text-muted-foreground">
            Total trading volume
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Top Gainer</div>
          <div className="text-lg font-bold text-green-600">
            {topGainer.name}
          </div>
          <div className="text-sm text-green-600">
            +{topGainer.change24h.toFixed(2)}%
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Top Loser</div>
          <div className="text-lg font-bold text-red-600">
            {topLoser.name}
          </div>
          <div className="text-sm text-red-600">
            {topLoser.change24h.toFixed(2)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketStats;
