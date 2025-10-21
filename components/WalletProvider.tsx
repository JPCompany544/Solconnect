"use client";

// WalletProvider.tsx - Solana wallet integration for desktop and mobile web
// Desktop: Uses wallet adapters for browser extensions with auto-connect
// Mobile: Uses deep link to open Phantom app, detects app open via visibilitychange
// Fallback: Redirects to download page only if Phantom not installed

import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

interface Props {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
  // Detect mobile devices (iOS/Android)
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }, []);

  // Solana network configuration
  const network = WalletAdapterNetwork.Mainnet; // Change to Devnet for testing
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Desktop wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Mobile Phantom connection hook
export const useMobileConnect = (): { connectMobilePhantom: () => void } => {
  const connectMobilePhantom = () => {
    if (typeof window === "undefined") return;

    const currentUrl = encodeURIComponent(window.location.href);
    const phantomDeepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;

    let appOpened = false;

    // Listen for visibility change to detect if user switched to Phantom app
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true; // App opened successfully
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Open Phantom via deep link
    window.location.href = phantomDeepLink;

    // Fallback: If app didn't open within 2s, redirect to download page
    setTimeout(() => {
      if (!appOpened) {
        window.location.href = "https://phantom.app/download";
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 2000);
  };

  return { connectMobilePhantom };
};
