"use client";

import { useEffect, useState } from "react";
// import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"; // Commented out for Reown migration
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
// import { BlockieAvatar } from "~~/components/scaffold-eth"; // Commented out for Reown migration
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
// import { wagmiConfig } from "~~/services/web3/wagmiConfig"; // Commented out for Reown migration
import { wagmiAdapter } from "~~/config/wagmi"; // Using Reown wagmi adapter

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className={`flex flex-col min-h-screen `}>
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  // const { resolvedTheme } = useTheme(); // Commented out for Reown migration
  // const isDarkMode = resolvedTheme === "dark"; // Commented out for Reown migration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as any}>
      <QueryClientProvider client={queryClient}>
        {/* Replaced RainbowKitProvider with Reown AppKit - the modal is initialized in context/Web3Modal.tsx */}
        {/* 
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
        */}
          <ProgressBar height="3px" color="#2299dd" />
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        {/* </RainbowKitProvider> */}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
