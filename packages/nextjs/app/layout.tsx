import { Space_Grotesk } from "next/font/google";
// import "@rainbow-me/rainbowkit/styles.css"; // Commented out for Reown migration
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { headers } from "next/headers"; // Added for Reown SSR support
import ReownContextProvider from "~~/context/Web3Modal"; // Added for Reown

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata = getMetadata({
  title: "Challenge #2 | SpeedRunEthereum",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = async ({ children }: { children: React.ReactNode }) => {
  const headersData = await headers();
  const cookies = headersData.get('cookie');

  return (
    <html suppressHydrationWarning className={`${spaceGrotesk.variable} font-space-grotesk`}>
      <body>
        <ThemeProvider enableSystem>
          <ReownContextProvider cookies={cookies}>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </ReownContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
