import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { Chain } from "viem";
import { hardhat } from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

// Get projectId from environment or use Scaffold-ETH default
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || scaffoldConfig.walletConnectProjectId;

if (!projectId) {
  throw new Error('Project ID is not defined. Please set NEXT_PUBLIC_PROJECT_ID in your environment or configure walletConnectProjectId in scaffold.config.ts')
}

const { targetNetworks } = scaffoldConfig;

// Define local hardhat network for Reown AppKit
const localHardhatNetwork: AppKitNetwork = {
  id: hardhat.id,
  name: hardhat.name,
  nativeCurrency: hardhat.nativeCurrency,
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: hardhat.blockExplorers,
  contracts: hardhat.contracts,
};

// Convert Scaffold-ETH target networks to Reown AppKit networks
// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

// Convert to AppKitNetwork format with proper handling for local networks
export const networks = enabledChains.map(chain => {
  // Handle hardhat local network
  if (chain.id === hardhat.id) {
    return localHardhatNetwork;
  }
  
  // Handle mainnet
  if (chain.id === 1) {
    return mainnet;
  }
  
  // For other networks, use type assertion
  return chain as unknown as AppKitNetwork;
}) as [AppKitNetwork, ...AppKitNetwork[]];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig 