"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Address, AddressInput, IntegerInput } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { getTokenPrice, multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { CurrencyDollarIcon, ArrowUpIcon, ArrowDownIcon, PaperAirplaneIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const TokenVendor: NextPage = () => {
  const [toAddress, setToAddress] = useState("");
  const [tokensToSend, setTokensToSend] = useState("");
  const [tokensToBuy, setTokensToBuy] = useState<string | bigint>("");
  const [isApproved, setIsApproved] = useState(false);
  const [tokensToSell, setTokensToSell] = useState<string>("");

  const { address } = useAccount();
  const { data: tokenG9Symbol } = useScaffoldReadContract({
    contractName: "TokenG9",
    functionName: "symbol",
  });

  const { data: tokenG9Balance } = useScaffoldReadContract({
    contractName: "TokenG9",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: vendorContractData } = useDeployedContractInfo({ contractName: "Vendor" });
  const { writeContractAsync: writeVendorAsync } = useScaffoldWriteContract({ contractName: "Vendor" });
  const { writeContractAsync: writeTokenG9Async } = useScaffoldWriteContract({ contractName: "TokenG9" });

  const { data: vendorTokenBalance } = useScaffoldReadContract({
    contractName: "TokenG9",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  const { data: vendorEthBalance } = useWatchBalance({ address: vendorContractData?.address });

  const { data: tokensPerEth } = useScaffoldReadContract({
    contractName: "Vendor",
    functionName: "tokensPerEth",
  });
  const { address: connectedAddress } = useAccount();

  return (
    <>
      {/* Modern Background with Gradient */}
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

        <div className="relative flex items-center flex-col flex-grow pt-4 sm:pt-6 lg:pt-10 px-4 sm:px-6 lg:px-8">
          {/* Header with Theme Toggle */}
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mb-6 sm:mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">Token Vendor</h1>
                <p className="text-sm sm:text-base text-base-content/70 mt-1">Modern DeFi Token Exchange</p>
              </div>
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard"
                  className="btn btn-ghost btn-sm rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  title="View Dashboard"
                >
                  <ChartBarIcon className="h-4 w-4" />
                  Dashboard
                </Link>
                <SwitchTheme />
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            {connectedAddress && (
              <div className="glass-effect rounded-xl p-3 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-base-content/60">Your Balance</div>
                  <div className="text-lg font-semibold text-primary">
                    {parseFloat(formatEther(tokenG9Balance || 0n)).toFixed(2)} {tokenG9Symbol}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60">Market Price</div>
                  <div className="text-lg font-semibold text-secondary">0.008 ETH</div>
                </div>
              </div>
            )}
          </div>

          {/* Wallet Connection & Balance Section */}
          <div className="relative action-card border-0 rounded-2xl p-6 sm:p-8 lg:p-10 mt-4 sm:mt-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl animate-fade-in-up"
               style={{animationDelay: '0.1s'}}>
            {/* Wallet Connection */}
            <div className="flex justify-center items-center flex-col space-y-4 sm:space-y-6 w-full">
              {connectedAddress ? (
                <>
                  <div className="glass-effect rounded-2xl p-4 sm:p-6 w-full text-center">
                    <p className="text-sm sm:text-base font-medium text-base-content/80 mb-3">🔗 Connected Wallet</p>
                    <div className="break-all">
                      <Address address={connectedAddress} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="glass-effect rounded-2xl p-6 sm:p-8 w-full text-center">
                    <div className="mb-4">
                      <CurrencyDollarIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-primary opacity-80" />
                    </div>
                    <p className="text-lg sm:text-xl font-semibold mb-4">Connect Your Wallet</p>
                    <p className="text-sm sm:text-base text-base-content/70 mb-6 px-2">Start trading tokens on the decentralized exchange</p>
                    <div className="scale-110 sm:scale-125">
                      <appkit-button />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {connectedAddress && (
              <>
                {/* Balance Section */}
                <div className="w-full mt-8 sm:mt-10">
                  <div className="balance-card rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-gradient">Your Portfolio</h2>
                      <div className="bg-base-100/50 backdrop-blur rounded-xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:space-x-3">
                          <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary">
                            {parseFloat(formatEther(tokenG9Balance || 0n)).toFixed(2)}
                          </div>
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mt-2 sm:mt-0">
                            {tokenG9Symbol}
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-base-content/60 mt-2">Token Balance</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Status */}
                <div className="w-full mt-6 sm:mt-8">
                  <h3 className="text-lg sm:text-xl font-bold text-center mb-6 text-gradient">Market Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="stat-card rounded-xl p-4 sm:p-5 text-center">
                      <div className="text-xs sm:text-sm font-medium text-base-content/70 mb-2">Vendor Tokens</div>
                      <div className="text-2xl sm:text-3xl font-bold text-info mb-1">
                        {Number(formatEther(vendorTokenBalance || 0n)).toFixed(0)}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-secondary">{tokenG9Symbol}</div>
                    </div>
                    <div className="stat-card rounded-xl p-4 sm:p-5 text-center">
                      <div className="text-xs sm:text-sm font-medium text-base-content/70 mb-2">Vendor ETH</div>
                      <div className="text-2xl sm:text-3xl font-bold text-success mb-1">
                        {Number(formatEther(vendorEthBalance?.value || 0n)).toFixed(3)}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-secondary">ETH</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Buy Tokens */}
          {connectedAddress && (
            <div className="action-card border-0 rounded-2xl p-6 sm:p-8 mt-8 sm:mt-10 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl animate-fade-in-up"
                 style={{animationDelay: '0.3s'}}>
              <div className="w-full text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center mb-4">
                  <ArrowUpIcon className="h-8 w-8 sm:h-10 sm:w-10 text-success mr-3" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">
                    Buy Tokens
                  </h2>
                </div>
                <div className="glass-effect rounded-xl p-3 sm:p-4 inline-block">
                  <div className="text-sm sm:text-base font-medium text-success">
                    💰 Price: <span className="font-bold text-lg">0.01 ETH</span> per token
                  </div>
                </div>
              </div>

              <div className="w-full space-y-6 sm:space-y-8">
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-semibold mb-3 text-left text-base-content/80">
                    Amount of tokens to purchase
                  </label>
                  <div className="relative">
                    <IntegerInput
                      placeholder="Enter amount (e.g., 100)"
                      value={tokensToBuy.toString()}
                      onChange={value => setTokensToBuy(value)}
                      disableMultiplyBy1e18
                    />
                  </div>
                </div>

                <button
                  className="btn-modern w-full h-14 sm:h-16 lg:h-18 text-lg sm:text-xl font-bold rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                  onClick={async () => {
                    try {
                      await writeVendorAsync({ functionName: "buyTokens", value: getTokenPrice(tokensToBuy, tokensPerEth) });
                    } catch (err) {
                      console.error("Error calling buyTokens function", err);
                    }
                  }}
                >
                  <ArrowUpIcon className="h-6 w-6 mr-2" />
                  Buy Tokens
                </button>
              </div>
            </div>
          )} 

          {/* Transfer Tokens */}
          {!!tokenG9Balance && (
            <div className="action-card border-0 rounded-2xl p-6 sm:p-8 mt-8 sm:mt-10 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl animate-fade-in-up"
                 style={{animationDelay: '0.5s'}}>
              <div className="w-full text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center mb-4">
                  <PaperAirplaneIcon className="h-8 w-8 sm:h-10 sm:w-10 text-info mr-3" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">
                    Transfer Tokens
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-base-content/70">Send tokens to another wallet</p>
              </div>

              <div className="w-full space-y-6 sm:space-y-8">
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-semibold mb-3 text-left text-base-content/80">
                    Recipient Address
                  </label>
                  <AddressInput 
                    placeholder="0x..." 
                    value={toAddress} 
                    onChange={value => setToAddress(value)} 
                  />
                </div>
                
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-semibold mb-3 text-left text-base-content/80">
                    Amount to Send
                  </label>
                  <IntegerInput
                    placeholder="Enter amount (e.g., 50)"
                    value={tokensToSend}
                    onChange={value => setTokensToSend(value as string)}
                    disableMultiplyBy1e18
                  />
                </div>

                <button
                  className="btn-modern w-full h-14 sm:h-16 lg:h-18 text-lg sm:text-xl font-bold rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  onClick={async () => {
                    try {
                      await writeTokenG9Async({
                        functionName: "transfer",
                        args: [toAddress, multiplyTo1e18(tokensToSend)],
                      });
                    } catch (err) {
                      console.error("Error calling transfer function", err);
                    }
                  }}
                >
                  <PaperAirplaneIcon className="h-6 w-6 mr-2" />
                  Send Tokens
                </button>
              </div>
            </div>
          )}

          {/* Sell Tokens */}
          {!!tokenG9Balance && (
            <div className="action-card border-0 rounded-2xl p-6 sm:p-8 mt-8 sm:mt-10 mb-12 sm:mb-16 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl animate-fade-in-up"
                 style={{animationDelay: '0.7s'}}>
              <div className="w-full text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center mb-4">
                  <ArrowDownIcon className="h-8 w-8 sm:h-10 sm:w-10 text-warning mr-3" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">
                    Sell Tokens
                  </h2>
                </div>
                <div className="glass-effect rounded-xl p-3 sm:p-4 inline-block">
                  <div className="text-sm sm:text-base font-medium text-warning">
                    💸 Price: <span className="font-bold text-lg">0.008 ETH</span> per token
                  </div>
                </div>
              </div>

              <div className="w-full space-y-6 sm:space-y-8">
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-semibold mb-3 text-left text-base-content/80">
                    Amount of tokens to sell
                  </label>
                  <IntegerInput
                    placeholder="Enter amount (e.g., 50)"
                    value={tokensToSell}
                    onChange={value => setTokensToSell(value as string)}
                    disabled={isApproved}
                    disableMultiplyBy1e18
                  />
                </div>

                {/* Enhanced Step indicator with animations */}
                <div className="glass-effect rounded-xl p-4 sm:p-6">
                  <div className="text-sm sm:text-base font-semibold text-base-content mb-4">
                    Step {isApproved ? '2' : '1'} of 2 - {isApproved ? 'Complete Sale' : 'Approve Tokens'}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      !isApproved ? 'bg-primary text-primary-content animate-pulse' : 'bg-success text-success-content'
                    }`}>
                      {isApproved ? (
                        <span className="text-sm font-bold">✓</span>
                      ) : (
                        <span className="text-sm font-bold">1</span>
                      )}
                    </div>
                    <div className="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
                      <div className={`progress-modern h-full transition-all duration-800`} 
                           style={{'--value': isApproved ? '100%' : '0%'} as any}></div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isApproved ? 'bg-primary text-primary-content animate-pulse' : 'bg-base-300 text-base-content/50'
                    }`}>
                      <span className="text-sm font-bold">2</span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-base-content/70 mt-4 text-center">
                    {isApproved ? '🎉 Ready to complete the sale!' : '🔐 Approve spending allowance first'}
                  </div>
                </div>

                {/* Enhanced Buttons */}
                <div className="w-full space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                  <button
                    className={`btn-modern w-full sm:w-1/2 h-14 sm:h-16 text-base sm:text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isApproved ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isApproved}
                    onClick={async () => {
                      try {
                        await writeTokenG9Async({
                          functionName: "approve",
                          args: [vendorContractData?.address, multiplyTo1e18(tokensToSell)],
                        });
                        setIsApproved(true);
                      } catch (err) {
                        console.error("Error calling approve function", err);
                      }
                    }}
                  >
                    {isApproved ? '✅ Approved' : '🔓 Approve'}
                  </button>

                  <button
                    className={`btn-modern w-full sm:w-1/2 h-14 sm:h-16 text-base sm:text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      !isApproved ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!isApproved}
                    onClick={async () => {
                      try {
                        await writeVendorAsync({ functionName: "sellTokens", args: [multiplyTo1e18(tokensToSell)] });
                        setIsApproved(false);
                      } catch (err) {
                        console.error("Error calling sellTokens function", err);
                      }
                    }}
                  >
                    <ArrowDownIcon className="h-5 w-5 mr-2" />
                    Sell Now
                  </button>
                </div>

                {/* Enhanced Help text */}
                <div className="glass-effect rounded-xl p-4 sm:p-5">
                  <div className="text-xs sm:text-sm text-info leading-relaxed">
                    <span className="font-semibold">💡 How it works:</span> First approve the contract to spend your tokens, then complete the sale to receive ETH.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TokenVendor;
