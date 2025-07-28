import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { Chain } from "viem";
import scaffoldConfig from "~~/scaffold.config";

// Get projectId from environment or use Scaffold-ETH default
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || scaffoldConfig.walletConnectProjectId;

if (!projectId) {
  throw new Error('Project ID is not defined. Please set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in your environment or configure walletConnectProjectId in scaffold.config.ts')
}

const { targetNetworks } = scaffoldConfig;

// Convert Scaffold-ETH target networks to Reown AppKit networks
// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

// Convert to AppKitNetwork format, fallback to original chains if conversion fails
export const networks = enabledChains.map(chain => {
  // Try to find matching AppKit network, otherwise use the original chain
  try {
    // For common networks, Reown should have them defined
    if (chain.id === 1) return mainnet;
    // For other networks, we'll use the chain as-is and hope Reown can handle it
    return chain as unknown as AppKitNetwork;
  } catch (error) {
    console.warn(`Could not convert chain ${chain.name} to AppKitNetwork, using as-is`);
    return chain as unknown as AppKitNetwork;
  }
}) as [AppKitNetwork, ...AppKitNetwork[]];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig 