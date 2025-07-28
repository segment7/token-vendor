"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "../RainbowKitCustomConnectButton/AddressInfoDropdown";
import { AddressQRCodeModal } from "../RainbowKitCustomConnectButton/AddressQRCodeModal";
import { WrongNetworkDropdown } from "../RainbowKitCustomConnectButton/WrongNetworkDropdown";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Address } from "viem";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Reown Connect Button (preserving original RainbowKit design)
 * Uses Reown AppKit's modal for wallet connection but maintains Scaffold-ETH styling
 */
export const ReownCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Open Reown modal function
  const openConnectModal = () => {
    // Try to access the global modal
    if (typeof window !== 'undefined') {
      // Check for appkit-button or modal in global scope
      const appkitButton = document.querySelector('appkit-button');
      if (appkitButton) {
        // Trigger click on hidden appkit button
        (appkitButton as any).click();
        return;
      }
      
      // Fallback: try to access modal directly
      if ((window as any).modal && (window as any).modal.open) {
        (window as any).modal.open();
        return;
      }
    }
    
    // Final fallback to first available connector
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const connected = isConnected && address;
  const blockExplorerAddressLink = address
    ? getBlockExplorerAddressLink(targetNetwork, address)
    : undefined;

  return (
    <>
      {(() => {
        if (!connected) {
          return (
            <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
              Connect Wallet
            </button>
          );
        }

        // Note: We're not implementing chain switching validation here since 
        // Reown handles this automatically. If needed, chain validation can be added.

        return (
          <>
            <div className="flex flex-col items-center mr-1">
              <Balance address={address as Address} className="min-h-0 h-auto" />
              <span className="text-xs" style={{ color: networkColor }}>
                {targetNetwork.name}
              </span>
            </div>
            <AddressInfoDropdown
              address={address as Address}
              displayName={address} // Reown doesn't provide ENS resolution in the same way
              ensAvatar={undefined} // Will be handled by AddressInfoDropdown internally
              blockExplorerAddressLink={blockExplorerAddressLink}
            />
            <AddressQRCodeModal address={address as Address} modalId="qrcode-modal" />
          </>
        );
      })()}
    </>
  );
};

// Note: Not exporting as RainbowKitCustomConnectButton to avoid conflicts
// Use ReownCustomConnectButton directly or update imports to use the new name 