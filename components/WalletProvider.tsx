"use client";

// WalletProvider.tsx - Solana wallet integration for desktop and mobile web
// Desktop: Uses wallet adapters for browser extensions
// Mobile: Uses deep links to open Phantom mobile app

import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

interface Props {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
  // Detect mobile devices (iOS/Android) via user agent
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }, []);

  // Mobile connect function: Opens Phantom app via deep link
  // If Phantom is installed, opens the app; otherwise, shows download prompt
  const connectMobilePhantom = () => {
    if (!isMobile) return;

    const currentUrl = encodeURIComponent(window.location.href);
    const phantomDeepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;

    // Open the deep link
    window.location.href = phantomDeepLink;
  };

  // Network configuration - easily switchable (Mainnet for production, Devnet for testing)
  const network = WalletAdapterNetwork.Mainnet; // Change to Devnet for testing

  // Memoize Solana RPC endpoint to prevent unnecessary re-computation
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Memoize wallet adapters
  // For mobile, we still include adapters in case the user has extensions,
  // but primary mobile flow uses deep links
  const wallets = useMemo(
    () => [
      // Phantom Wallet Adapter - supports desktop browser extension
      // Automatically detects and connects to Phantom extension
      new PhantomWalletAdapter(),

      // Solflare Wallet Adapter - additional desktop wallet support
      // Provides alternative wallet option for desktop users
      new SolflareWalletAdapter(),
    ],
    [network] // Dependencies for memoization
  );

  return (
    // ConnectionProvider establishes Solana RPC connection
    <ConnectionProvider endpoint={endpoint}>
      {/* WalletProvider manages wallet state and adapters */}
      <WalletProvider
        wallets={wallets}
        autoConnect // Automatically reconnect previously authorized wallets
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Export mobile connect function for use in components (e.g., connect button)
export const useMobileConnect = () => {
  const connectMobilePhantom = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    const phantomDeepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;
    window.location.href = phantomDeepLink;
  };

  return { connectMobilePhantom };
};
