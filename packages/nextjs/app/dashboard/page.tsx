"use client";

import { useState, useEffect, useMemo } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PresentationChartLineIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";
import { PortfolioChart } from "~~/components/dashboard/PortfolioChart";
import { AnalyticsPanel } from "~~/components/dashboard/AnalyticsPanel";

// Types for our data structures
interface Transaction {
  type: 'buy' | 'sell' | 'transfer';
  amount: string;
  price?: string;
  timestamp: number;
  hash: string;
  from?: string;
  to?: string;
}

interface PortfolioMetrics {
  totalValue: number;
  totalTokens: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercentage: number;
  avgBuyPrice: number;
  avgSellPrice: number;
}

const Dashboard: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [hideBalances, setHideBalances] = useState(false);

  // Contract data hooks
  const { data: tokenG9Symbol } = useScaffoldReadContract({
    contractName: "TokenG9",
    functionName: "symbol",
  });

  const { data: tokenG9Balance } = useScaffoldReadContract({
    contractName: "TokenG9",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: vendorContractData } = useDeployedContractInfo({ contractName: "Vendor" });
  const { data: vendorTokenBalance } = useScaffoldReadContract({
    contractName: "TokenG9",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  const { data: vendorEthBalance } = useWatchBalance({ address: vendorContractData?.address });

  // Event history for transaction analytics
  const { data: buyEvents } = useScaffoldEventHistory({
    contractName: "Vendor",
    eventName: "BuyTokens",
    fromBlock: 0n,
  });

  const { data: sellEvents } = useScaffoldEventHistory({
    contractName: "Vendor",
    eventName: "SellTokens",
    fromBlock: 0n,
  });

  // Process transaction data
  const transactions = useMemo(() => {
    const allTransactions: Transaction[] = [];
    
    // Process buy events
    if (buyEvents) {
      buyEvents.forEach(event => {
        if (event.args.buyer === connectedAddress) {
          allTransactions.push({
            type: 'buy',
            amount: formatEther(event.args.amountOfTokens),
            price: formatEther(event.args.amountOfETH),
            timestamp: Date.now(), // In a real app, you'd get this from the block
            hash: event.transactionHash || '',
          });
        }
      });
    }

    // Process sell events
    if (sellEvents) {
      sellEvents.forEach(event => {
        if (event.args.seller === connectedAddress) {
          allTransactions.push({
            type: 'sell',
            amount: formatEther(event.args.amountOfTokens),
            price: formatEther(event.args.amountOfETH),
            timestamp: Date.now(),
            hash: event.transactionHash || '',
          });
        }
      });
    }

    return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
  }, [buyEvents, sellEvents, connectedAddress]);

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo((): PortfolioMetrics => {
    const buyTransactions = transactions.filter(tx => tx.type === 'buy');
    const sellTransactions = transactions.filter(tx => tx.type === 'sell');
    
    const totalBought = buyTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalSold = sellTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalInvested = buyTransactions.reduce((sum, tx) => sum + parseFloat(tx.price || '0'), 0);
    const totalReceived = sellTransactions.reduce((sum, tx) => sum + parseFloat(tx.price || '0'), 0);
    
    const currentTokens = parseFloat(formatEther(tokenG9Balance || 0n));
    const currentTokenValue = currentTokens * 0.008; // Current sell price
    
    const totalValue = currentTokenValue + totalReceived;
    const profitLoss = totalValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
    
    const avgBuyPrice = totalBought > 0 ? totalInvested / totalBought : 0;
    const avgSellPrice = totalSold > 0 ? totalReceived / totalSold : 0;

    return {
      totalValue,
      totalTokens: currentTokens,
      totalInvested,
      profitLoss,
      profitLossPercentage,
      avgBuyPrice,
      avgSellPrice,
    };
  }, [transactions, tokenG9Balance]);

  // Chart data for visualization
  const chartData = useMemo(() => {
    const data = [];
    let runningBalance = 0;
    let runningValue = 0;

    // Sort transactions by timestamp for chronological order
    const sortedTransactions = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

    sortedTransactions.forEach((tx, index) => {
      if (tx.type === 'buy') {
        runningBalance += parseFloat(tx.amount);
        runningValue += parseFloat(tx.price || '0');
      } else if (tx.type === 'sell') {
        runningBalance -= parseFloat(tx.amount);
        runningValue -= parseFloat(tx.price || '0');
      }

      data.push({
        index,
        balance: runningBalance,
        value: runningValue,
        timestamp: tx.timestamp,
        type: tx.type,
      });
    });

    return data;
  }, [transactions]);

  useEffect(() => {
    // Simulate loading delay for smooth UX
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!connectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center p-4">
        <div className="action-card border-0 rounded-2xl p-8 sm:p-12 text-center max-w-md">
          <CurrencyDollarIcon className="h-16 w-16 mx-auto text-primary opacity-80 mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-4">Connect Wallet</h2>
          <p className="text-base-content/70 mb-6">Please connect your wallet to view your dashboard</p>
          <appkit-button />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modern Background */}
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient">Portfolio Dashboard</h1>
                <p className="text-base sm:text-lg text-base-content/70 mt-2">Your Token Vendor Analytics</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setHideBalances(!hideBalances)}
                  className="btn btn-ghost btn-sm rounded-full hover:bg-base-200"
                  title={hideBalances ? "Show balances" : "Hide balances"}
                >
                  {hideBalances ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                </button>
                <SwitchTheme />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="action-card border-0 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-base-300 rounded w-3/4 mb-3"></div>
                    <div className="h-8 bg-base-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-base-300 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
                {/* Total Portfolio Value */}
                <div className="stat-card rounded-xl p-4 sm:p-6 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <CurrencyDollarIcon className="h-8 w-8 text-primary" />
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        portfolioMetrics.profitLoss >= 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                      }`}>
                        {portfolioMetrics.profitLoss >= 0 ? '+' : ''}{portfolioMetrics.profitLossPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                      {hideBalances ? '••••••' : `${portfolioMetrics.totalValue.toFixed(4)} ETH`}
                    </div>
                    <div className="text-xs sm:text-sm text-base-content/70">Total Portfolio Value</div>
                  </div>
                </div>

                {/* Token Balance */}
                <div className="stat-card rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <ChartBarIcon className="h-8 w-8 text-secondary" />
                    <div className="text-xs text-base-content/60">Current Holdings</div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1">
                    {portfolioMetrics.totalTokens.toFixed(2)}
                  </div>
                  <div className="text-xs sm:text-sm text-base-content/70">{tokenG9Symbol} Tokens</div>
                </div>

                {/* Profit/Loss */}
                <div className="stat-card rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    {portfolioMetrics.profitLoss >= 0 ? (
                      <ArrowTrendingUpIcon className="h-8 w-8 text-success" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-8 w-8 text-error" />
                    )}
                    <div className="text-xs text-base-content/60">P&L</div>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-bold mb-1 ${
                    portfolioMetrics.profitLoss >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {portfolioMetrics.profitLoss >= 0 ? '+' : ''}{portfolioMetrics.profitLoss.toFixed(4)} ETH
                  </div>
                  <div className="text-xs sm:text-sm text-base-content/70">Total Profit/Loss</div>
                </div>

                {/* Total Invested */}
                <div className="stat-card rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <PresentationChartLineIcon className="h-8 w-8 text-info" />
                    <div className="text-xs text-base-content/60">Investment</div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-info mb-1">
                    {portfolioMetrics.totalInvested.toFixed(4)} ETH
                  </div>
                  <div className="text-xs sm:text-sm text-base-content/70">Total Invested</div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="glass-effect rounded-xl p-1 inline-flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'overview'
                        ? 'bg-primary text-primary-content shadow-md'
                        : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
                    }`}
                  >
                    <ChartBarIcon className="h-4 w-4 inline mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-primary text-primary-content shadow-md'
                        : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
                    }`}
                  >
                    <PresentationChartLineIcon className="h-4 w-4 inline mr-2" />
                    Analytics
                  </button>
                </div>
              </div>

              {/* Charts and Analytics Section */}
              {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Enhanced Portfolio Performance Chart */}
                  <div className="lg:col-span-2 action-card border-0 rounded-2xl p-6 sm:p-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gradient mb-4 sm:mb-0">Portfolio Performance</h3>
                      <div className="flex bg-base-200 rounded-lg p-1">
                        {(['24h', '7d', '30d', 'all'] as const).map((timeframe) => (
                          <button
                            key={timeframe}
                            onClick={() => setSelectedTimeframe(timeframe)}
                            className={`px-3 py-1 text-sm rounded-md transition-all ${
                              selectedTimeframe === timeframe
                                ? 'bg-primary text-primary-content shadow-md'
                                : 'text-base-content/70 hover:text-base-content'
                            }`}
                          >
                            {timeframe}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <PortfolioChart 
                      data={chartData} 
                      timeframe={selectedTimeframe} 
                      tokenSymbol={tokenG9Symbol || 'G9'} 
                    />
                  </div>

                {/* Quick Stats */}
                <div className="space-y-4 sm:space-y-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  <div className="action-card border-0 rounded-xl p-4 sm:p-6">
                    <h4 className="text-lg font-semibold text-gradient mb-4">Trading Stats</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-base-content/70">Avg Buy Price</span>
                        <span className="font-semibold">{portfolioMetrics.avgBuyPrice.toFixed(6)} ETH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-base-content/70">Avg Sell Price</span>
                        <span className="font-semibold">{portfolioMetrics.avgSellPrice.toFixed(6)} ETH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-base-content/70">Total Transactions</span>
                        <span className="font-semibold">{transactions.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="action-card border-0 rounded-xl p-4 sm:p-6">
                    <h4 className="text-lg font-semibold text-gradient mb-4">Market Info</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-base-content/70">Buy Price</span>
                        <span className="font-semibold text-success">0.010 ETH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-base-content/70">Sell Price</span>
                        <span className="font-semibold text-warning">0.008 ETH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-base-content/70">Vendor Balance</span>
                        <span className="font-semibold">{Number(formatEther(vendorTokenBalance || 0n)).toFixed(0)} {tokenG9Symbol}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <AnalyticsPanel 
                    transactions={transactions} 
                    currentBalance={portfolioMetrics.totalTokens}
                    tokenSymbol={tokenG9Symbol || 'G9'}
                  />
                </div>
              )}

              {/* Recent Transactions */}
              <div className="action-card border-0 rounded-2xl p-6 sm:p-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gradient">Recent Transactions</h3>
                  <div className="text-sm text-base-content/60">
                    {transactions.length} total transactions
                  </div>
                </div>
                
                {transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="space-y-3">
                      {transactions.slice(0, 10).map((tx, index) => (
                        <div key={index} className="glass-effect rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              tx.type === 'buy' ? 'bg-success/20 text-success' :
                              tx.type === 'sell' ? 'bg-warning/20 text-warning' :
                              'bg-info/20 text-info'
                            }`}>
                              {tx.type === 'buy' ? (
                                <ArrowUpIcon className="h-4 w-4" />
                              ) : tx.type === 'sell' ? (
                                <ArrowDownIcon className="h-4 w-4" />
                              ) : (
                                <ClockIcon className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold capitalize">{tx.type} Tokens</div>
                              <div className="text-sm text-base-content/70">
                                {parseFloat(tx.amount).toFixed(2)} {tokenG9Symbol}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {tx.price ? `${parseFloat(tx.price).toFixed(4)} ETH` : 'Transfer'}
                            </div>
                            <div className="text-sm text-base-content/70">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ClockIcon className="h-12 w-12 mx-auto text-base-content/30 mb-4" />
                    <p className="text-base-content/50">No transactions yet</p>
                    <p className="text-sm text-base-content/30 mt-2">Start trading to see your transaction history</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;