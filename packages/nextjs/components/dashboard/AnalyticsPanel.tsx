"use client";

import { useMemo } from "react";
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ChartPieIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ScaleIcon
} from "@heroicons/react/24/outline";

interface Transaction {
  type: 'buy' | 'sell' | 'transfer';
  amount: string;
  price?: string;
  timestamp: number;
  hash: string;
}

interface AnalyticsPanelProps {
  transactions: Transaction[];
  currentBalance: number;
  tokenSymbol: string;
}

export const AnalyticsPanel = ({ transactions, currentBalance, tokenSymbol }: AnalyticsPanelProps) => {
  const analytics = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    // Time-based filtering
    const last24h = transactions.filter(tx => now - tx.timestamp <= oneDay);
    const last7d = transactions.filter(tx => now - tx.timestamp <= oneWeek);
    const last30d = transactions.filter(tx => now - tx.timestamp <= oneMonth);

    // Transaction type analysis
    const buyTxs = transactions.filter(tx => tx.type === 'buy');
    const sellTxs = transactions.filter(tx => tx.type === 'sell');
    const transferTxs = transactions.filter(tx => tx.type === 'transfer');

    // Volume analysis
    const totalBuyVolume = buyTxs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalSellVolume = sellTxs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalTransferVolume = transferTxs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    // Value analysis
    const totalBuyValue = buyTxs.reduce((sum, tx) => sum + parseFloat(tx.price || '0'), 0);
    const totalSellValue = sellTxs.reduce((sum, tx) => sum + parseFloat(tx.price || '0'), 0);

    // Average transaction sizes
    const avgBuySize = buyTxs.length > 0 ? totalBuyVolume / buyTxs.length : 0;
    const avgSellSize = sellTxs.length > 0 ? totalSellVolume / sellTxs.length : 0;

    // Trading frequency
    const avgTimeBetweenTxs = transactions.length > 1 ? 
      (Math.max(...transactions.map(tx => tx.timestamp)) - Math.min(...transactions.map(tx => tx.timestamp))) / (transactions.length - 1) : 0;

    // Activity score (transactions per week)
    const activityScore = (transactions.length / Math.max(1, (now - Math.min(...transactions.map(tx => tx.timestamp))) / oneWeek)) || 0;

    // Portfolio turnover ratio
    const turnoverRatio = currentBalance > 0 ? (totalSellVolume / currentBalance) : 0;

    return {
      timeframes: {
        last24h: last24h.length,
        last7d: last7d.length,
        last30d: last30d.length,
      },
      volumes: {
        totalBuy: totalBuyVolume,
        totalSell: totalSellVolume,
        totalTransfer: totalTransferVolume,
        net: totalBuyVolume - totalSellVolume,
      },
      values: {
        totalBuyValue,
        totalSellValue,
        netValue: totalSellValue - totalBuyValue,
      },
      averages: {
        buySize: avgBuySize,
        sellSize: avgSellSize,
        timeBetweenTxs: avgTimeBetweenTxs,
      },
      metrics: {
        activityScore,
        turnoverRatio,
        totalTransactions: transactions.length,
        buyRatio: transactions.length > 0 ? (buyTxs.length / transactions.length) * 100 : 0,
        sellRatio: transactions.length > 0 ? (sellTxs.length / transactions.length) * 100 : 0,
      }
    };
  }, [transactions, currentBalance]);

  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(ms / (60 * 1000))}m`;
  };

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <CalendarDaysIcon className="h-6 w-6 text-primary" />
            <span className="text-xs text-base-content/60">24h</span>
          </div>
          <div className="text-xl font-bold text-primary">{analytics.timeframes.last24h}</div>
          <div className="text-xs text-base-content/70">Transactions</div>
        </div>

        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <CalendarDaysIcon className="h-6 w-6 text-secondary" />
            <span className="text-xs text-base-content/60">7d</span>
          </div>
          <div className="text-xl font-bold text-secondary">{analytics.timeframes.last7d}</div>
          <div className="text-xs text-base-content/70">Transactions</div>
        </div>

        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <CalendarDaysIcon className="h-6 w-6 text-accent" />
            <span className="text-xs text-base-content/60">30d</span>
          </div>
          <div className="text-xl font-bold text-accent">{analytics.timeframes.last30d}</div>
          <div className="text-xs text-base-content/70">Transactions</div>
        </div>
      </div>

      {/* Trading Patterns */}
      <div className="action-card border-0 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gradient mb-4 flex items-center">
          <ChartPieIcon className="h-5 w-5 mr-2" />
          Trading Patterns
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buy vs Sell Distribution */}
          <div>
            <div className="text-sm font-medium text-base-content/80 mb-3">Transaction Distribution</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm">Buys</span>
                </div>
                <span className="text-sm font-semibold">{analytics.metrics.buyRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.metrics.buyRatio}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-sm">Sells</span>
                </div>
                <span className="text-sm font-semibold">{analytics.metrics.sellRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-2">
                <div 
                  className="bg-warning h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.metrics.sellRatio}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Volume Analysis */}
          <div>
            <div className="text-sm font-medium text-base-content/80 mb-3">Volume Analysis</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-base-content/70">Total Buy Volume</span>
                <span className="font-semibold text-success">{analytics.volumes.totalBuy.toFixed(2)} {tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-base-content/70">Total Sell Volume</span>
                <span className="font-semibold text-warning">{analytics.volumes.totalSell.toFixed(2)} {tokenSymbol}</span>
              </div>
              <div className="flex justify-between border-t border-base-300 pt-2">
                <span className="text-sm font-medium">Net Position</span>
                <span className={`font-bold ${analytics.volumes.net >= 0 ? 'text-success' : 'text-error'}`}>
                  {analytics.volumes.net >= 0 ? '+' : ''}{analytics.volumes.net.toFixed(2)} {tokenSymbol}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="action-card border-0 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gradient mb-4 flex items-center">
          <TrendingUpIcon className="h-5 w-5 mr-2" />
          Performance Metrics
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <ScaleIcon className="h-5 w-5 text-info" />
              <div className="text-xs text-base-content/60">Average</div>
            </div>
            <div className="text-lg font-bold text-info">{analytics.averages.buySize.toFixed(2)}</div>
            <div className="text-xs text-base-content/70">Avg Buy Size ({tokenSymbol})</div>
          </div>

          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <ScaleIcon className="h-5 w-5 text-warning" />
              <div className="text-xs text-base-content/60">Average</div>
            </div>
            <div className="text-lg font-bold text-warning">{analytics.averages.sellSize.toFixed(2)}</div>
            <div className="text-xs text-base-content/70">Avg Sell Size ({tokenSymbol})</div>
          </div>

          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="h-5 w-5 text-secondary" />
              <div className="text-xs text-base-content/60">Frequency</div>
            </div>
            <div className="text-lg font-bold text-secondary">
              {analytics.averages.timeBetweenTxs > 0 ? formatDuration(analytics.averages.timeBetweenTxs) : 'N/A'}
            </div>
            <div className="text-xs text-base-content/70">Avg Time Between Txs</div>
          </div>

          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUpIcon className="h-5 w-5 text-success" />
              <div className="text-xs text-base-content/60">Activity</div>
            </div>
            <div className="text-lg font-bold text-success">{analytics.metrics.activityScore.toFixed(1)}</div>
            <div className="text-xs text-base-content/70">Txs per Week</div>
          </div>

          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-primary" />
              <div className="text-xs text-base-content/60">Turnover</div>
            </div>
            <div className="text-lg font-bold text-primary">{(analytics.metrics.turnoverRatio * 100).toFixed(1)}%</div>
            <div className="text-xs text-base-content/70">Portfolio Turnover</div>
          </div>

          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDownIcon className="h-5 w-5 text-accent" />
              <div className="text-xs text-base-content/60">Total</div>
            </div>
            <div className="text-lg font-bold text-accent">{analytics.metrics.totalTransactions}</div>
            <div className="text-xs text-base-content/70">All Transactions</div>
          </div>
        </div>
      </div>

      {/* Value Flow Analysis */}
      <div className="action-card border-0 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gradient mb-4 flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
          Value Flow Analysis
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-2">{analytics.values.totalBuyValue.toFixed(4)} ETH</div>
            <div className="text-sm text-base-content/70">Total Invested</div>
            <div className="mt-2 bg-success/10 rounded-full px-3 py-1 inline-block">
              <TrendingDownIcon className="h-4 w-4 inline mr-1 text-success" />
              <span className="text-success text-xs font-medium">Outflow</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-warning mb-2">{analytics.values.totalSellValue.toFixed(4)} ETH</div>
            <div className="text-sm text-base-content/70">Total Returned</div>
            <div className="mt-2 bg-warning/10 rounded-full px-3 py-1 inline-block">
              <TrendingUpIcon className="h-4 w-4 inline mr-1 text-warning" />
              <span className="text-warning text-xs font-medium">Inflow</span>
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${analytics.values.netValue >= 0 ? 'text-success' : 'text-error'}`}>
              {analytics.values.netValue >= 0 ? '+' : ''}{analytics.values.netValue.toFixed(4)} ETH
            </div>
            <div className="text-sm text-base-content/70">Net Cash Flow</div>
            <div className={`mt-2 rounded-full px-3 py-1 inline-block ${
              analytics.values.netValue >= 0 ? 'bg-success/10' : 'bg-error/10'
            }`}>
              {analytics.values.netValue >= 0 ? (
                <TrendingUpIcon className="h-4 w-4 inline mr-1 text-success" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 inline mr-1 text-error" />
              )}
              <span className={`text-xs font-medium ${analytics.values.netValue >= 0 ? 'text-success' : 'text-error'}`}>
                {analytics.values.netValue >= 0 ? 'Positive' : 'Negative'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};