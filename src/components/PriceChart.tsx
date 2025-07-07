
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";

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

interface PriceChartProps {
  symbol: string;
  duration: string;
  cryptoData: CryptoData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, duration, cryptoData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  const selectedCrypto = cryptoData.find(crypto => crypto.symbol === symbol);
  
  useEffect(() => {
    if (!canvasRef.current || !selectedCrypto) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get data points based on duration
    let dataPoints = selectedCrypto.sparklineData;
    if (duration === '1H') {
      dataPoints = dataPoints.slice(-12); // Last 12 points for 1H
    } else if (duration === '24H') {
      dataPoints = dataPoints.slice(-24); // Last 24 points for 24H
    }
    
    if (dataPoints.length === 0) return;

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    const minPrice = Math.min(...dataPoints);
    const maxPrice = Math.max(...dataPoints);
    const priceRange = maxPrice - minPrice || 1;
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding + (chartWidth / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }
    
    // Draw price labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (priceRange / 5) * i;
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 4);
    }
    
    // Draw chart based on type
    if (chartType === 'line') {
      // Draw line chart
      ctx.strokeStyle = selectedCrypto.change24h >= 0 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      dataPoints.forEach((price, index) => {
        const x = padding + (chartWidth / (dataPoints.length - 1)) * index;
        const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Add gradient fill
      ctx.lineTo(canvas.width - padding, canvas.height - padding);
      ctx.lineTo(padding, canvas.height - padding);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
      gradient.addColorStop(0, selectedCrypto.change24h >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fill();
    } else {
      // Draw bar chart
      const barWidth = chartWidth / dataPoints.length * 0.8;
      const barSpacing = chartWidth / dataPoints.length * 0.2;
      
      dataPoints.forEach((price, index) => {
        const x = padding + (chartWidth / dataPoints.length) * index + barSpacing / 2;
        const barHeight = ((price - minPrice) / priceRange) * chartHeight;
        const y = canvas.height - padding - barHeight;
        
        ctx.fillStyle = selectedCrypto.change24h >= 0 ? '#10b981' : '#ef4444';
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    }
    
    // Draw current price indicator
    const currentPrice = dataPoints[dataPoints.length - 1];
    const currentY = padding + chartHeight - ((currentPrice - minPrice) / priceRange) * chartHeight;
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, currentY);
    ctx.lineTo(canvas.width - padding, currentY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw current price label
    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'left';
    ctx.fillText(`Current: $${currentPrice.toFixed(2)}`, canvas.width - padding - 120, currentY - 10);
    
  }, [selectedCrypto, duration, chartType, cryptoData]);
  
  if (!selectedCrypto) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available for selected cryptocurrency
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{selectedCrypto.name} ({selectedCrypto.symbol})</h3>
          <p className="text-muted-foreground">Duration: {duration}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            Bar
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto max-h-96"
          style={{ maxWidth: '100%' }}
        />
      </div>
    </div>
  );
};

export default PriceChart;
