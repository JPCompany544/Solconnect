"use client";

// WalletProvider.tsx - Solana wallet integration for desktop and mobile web
// Desktop: Uses wallet adapters for browser extensions with auto-connect
// Mobile: Uses iframe deep link to open Phantom app, with timeout fallback to download

import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

interface Props {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
  // Detect mobile devices (iOS/Android) for conditional mobile logic
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }, []);

  // Network configuration - easily switchable for testing (Mainnet for production)
  const network = WalletAdapterNetwork.Mainnet; // Change to Devnet for testing

  // Memoize Solana RPC endpoint to prevent unnecessary re-computation
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Memoize wallet adapters for desktop browsers
  // Mobile devices can still use these if extensions are available, but primary flow uses deep links
  const wallets = useMemo(
    () => [
      // Phantom Wallet Adapter - primary desktop wallet support
      // Handles connection to Phantom browser extension
      new PhantomWalletAdapter(),

      // Solflare Wallet Adapter - alternative desktop wallet option
      // Provides additional wallet choice for desktop users
      new SolflareWalletAdapter(),
    ],
    [network] // Dependencies for memoization
  );

  return (
    // ConnectionProvider establishes connection to Solana RPC
    <ConnectionProvider endpoint={endpoint}>
      {/* WalletProvider manages wallet state and enables auto-connect */}
      <WalletProvider
        wallets={wallets}
        autoConnect // Automatically reconnect to previously authorized wallets
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// useMobileConnect hook - provides mobile Phantom connection functionality
// Uses iframe deep link trick with timeout fallback for iOS compliance
export const useMobileConnect = (): { connectMobilePhantom: () => void } => {
  const connectMobilePhantom = () => {
    // Encode current page URL for app_url parameter
    const currentUrl = encodeURIComponent(window.location.href);

    // Phantom deep link URL for mobile app connection
    const phantomDeepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;

    // Create hidden iframe to attempt opening Phantom app
    // This works on iOS where direct window.location.href may not trigger app opening
    const iframe = document.createElement('iframe');
    iframe.src = phantomDeepLink;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Timeout fallback: If Phantom app doesn't open within ~1.5s, redirect to download page
    // This handles cases where Phantom is not installed
    setTimeout(() => {
      window.location.href = 'https://phantom.app/download';
    }, 1500);
  };

  return { connectMobilePhantom };
};
