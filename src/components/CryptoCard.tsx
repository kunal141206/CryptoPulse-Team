
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

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

interface CryptoCardProps {
  crypto: CryptoData;
  onToggleFavorite: (symbol: string) => void;
  onSelect: (symbol: string) => void;
  isSelected: boolean;
}

const CryptoCard: React.FC<CryptoCardProps> = ({
  crypto,
  onToggleFavorite,
  onSelect,
  isSelected
}) => {
  const isPositive = crypto.change24h >= 0;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(crypto.symbol)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {crypto.icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{crypto.name}</h3>
              <p className="text-xs text-muted-foreground">{crypto.symbol}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(crypto.symbol);
            }}
            className="p-1 h-auto"
          >
            <Star 
              className={`w-4 h-4 ${
                crypto.isFavorite ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
              }`} 
            />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">
              ${crypto.price.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Volume: ${(crypto.volume24h / 1000000).toFixed(2)}M
          </div>
          
          {/* Simple Sparkline */}
          <div className="h-8 flex items-end gap-px">
            {crypto.sparklineData.slice(-10).map((value, index) => {
              const height = Math.max(2, (value / Math.max(...crypto.sparklineData)) * 24);
              return (
                <div
                  key={index}
                  className={`w-1 rounded-t-sm ${
                    isPositive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;
