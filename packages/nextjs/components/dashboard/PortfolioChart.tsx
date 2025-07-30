"use client";

import { useMemo } from "react";
import { PresentationChartLineIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";

interface ChartDataPoint {
  index: number;
  balance: number;
  value: number;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer';
}

interface PortfolioChartProps {
  data: ChartDataPoint[];
  timeframe: '24h' | '7d' | '30d' | 'all';
  tokenSymbol: string;
}

export const PortfolioChart = ({ data, timeframe, tokenSymbol }: PortfolioChartProps) => {
  const chartMetrics = useMemo(() => {
    if (data.length === 0) return { change: 0, changePercent: 0, trend: 'neutral' as const };
    
    const firstValue = data[0]?.balance || 0;
    const lastValue = data[data.length - 1]?.balance || 0;
    const change = lastValue - firstValue;
    const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    return { change, changePercent, trend };
  }, [data]);

  const maxBalance = useMemo(() => {
    return Math.max(...data.map(point => point.balance), 1);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="relative h-64 sm:h-80 bg-base-200/50 rounded-xl p-6 flex items-center justify-center">
        <div className="text-center">
          <PresentationChartLineIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
          <h4 className="text-lg font-semibold text-base-content/60 mb-2">No Data Available</h4>
          <p className="text-sm text-base-content/40">Start trading to see your portfolio performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            chartMetrics.trend === 'up' ? 'bg-success/20 text-success' :
            chartMetrics.trend === 'down' ? 'bg-error/20 text-error' :
            'bg-base-300 text-base-content'
          }`}>
            {chartMetrics.trend === 'up' ? (
              <ArrowTrendingUpIcon className="h-5 w-5" />
            ) : chartMetrics.trend === 'down' ? (
              <ArrowTrendingDownIcon className="h-5 w-5" />
            ) : (
              <PresentationChartLineIcon className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-sm text-base-content/70">Portfolio Change ({timeframe})</div>
            <div className={`text-lg font-bold ${
              chartMetrics.trend === 'up' ? 'text-success' :
              chartMetrics.trend === 'down' ? 'text-error' :
              'text-base-content'
            }`}>
              {chartMetrics.change >= 0 ? '+' : ''}{chartMetrics.change.toFixed(2)} {tokenSymbol}
            </div>
          </div>
        </div>
        <div className={`text-right px-3 py-1 rounded-full text-sm font-medium ${
          chartMetrics.trend === 'up' ? 'bg-success/20 text-success' :
          chartMetrics.trend === 'down' ? 'bg-error/20 text-error' :
          'bg-base-300 text-base-content'
        }`}>
          {chartMetrics.changePercent >= 0 ? '+' : ''}{chartMetrics.changePercent.toFixed(1)}%
        </div>
      </div>

      {/* Interactive Chart Area */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-b from-base-100 to-base-200 rounded-xl p-4 overflow-hidden border border-base-300">
        {/* Grid Lines */}
        <div className="absolute inset-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-b border-base-300/30"
              style={{ top: `${i * 25}%` }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute h-full border-r border-base-300/30"
              style={{ left: `${i * 20}%` }}
            />
          ))}
        </div>

        {/* Chart Bars */}
        <div className="relative h-full flex items-end justify-between px-2 z-10">
          {data.slice(-20).map((point, index) => {
            const height = Math.max(8, (point.balance / maxBalance) * 85);
            const isRecent = index >= data.slice(-20).length - 5;
            
            return (
              <div
                key={index}
                className="group relative flex-1 mx-0.5 cursor-pointer"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                  <div className="bg-base-100 border border-base-300 rounded-lg px-3 py-2 text-xs font-medium shadow-lg whitespace-nowrap">
                    <div className="text-center">
                      <div className="font-semibold">{point.balance.toFixed(2)} {tokenSymbol}</div>
                      <div className="text-base-content/60 capitalize">{point.type} Transaction</div>
                      <div className="text-base-content/50">
                        {new Date(point.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80 ${
                    point.type === 'buy' ? 'bg-gradient-to-t from-success/60 to-success' :
                    point.type === 'sell' ? 'bg-gradient-to-t from-warning/60 to-warning' :
                    'bg-gradient-to-t from-info/60 to-info'
                  } ${isRecent ? 'shadow-lg animate-pulse' : ''}`}
                  style={{ height: `${height}%` }}
                />

                {/* Glow effect for recent transactions */}
                {isRecent && (
                  <div
                    className={`absolute bottom-0 w-full rounded-t-sm blur-sm opacity-50 ${
                      point.type === 'buy' ? 'bg-success' :
                      point.type === 'sell' ? 'bg-warning' :
                      'bg-info'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Trend Line Overlay */}
        {data.length > 1 && (
          <div className="absolute inset-4 pointer-events-none">
            <svg className="w-full h-full">
              <path
                d={`M ${data.slice(-20).map((point, index) => {
                  const x = (index / (data.slice(-20).length - 1)) * 100;
                  const y = 100 - (point.balance / maxBalance) * 85;
                  return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                }).join(' ')}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`${
                  chartMetrics.trend === 'up' ? 'text-success' :
                  chartMetrics.trend === 'down' ? 'text-error' :
                  'text-primary'
                } opacity-60`}
                strokeDasharray="4 4"
              />
            </svg>
          </div>
        )}

        {/* Y-axis Labels */}
        <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-base-content/50">
          {[maxBalance, maxBalance * 0.75, maxBalance * 0.5, maxBalance * 0.25, 0].map((value, index) => (
            <div key={index} className="transform -translate-y-1/2">
              {value.toFixed(0)}
            </div>
          ))}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-t from-success/60 to-success rounded"></div>
          <span className="text-base-content/70">Buy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-t from-warning/60 to-warning rounded"></div>
          <span className="text-base-content/70">Sell</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-t from-info/60 to-info rounded"></div>
          <span className="text-base-content/70">Transfer</span>
        </div>
      </div>
    </div>
  );
};