"use client";

// WalletProvider.tsx - Phantom wallet integration for Next.js web projects
// Desktop: Auto-select Phantom, alert if not installed
// Mobile: Iframe deep link to open Phantom app, timeout fallback to download

import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

interface Props {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
  // Detect mobile devices
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  }, []);

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Only Phantom wallet
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  if (isMobile) {
    // Mobile: only connection context
    return <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>;
  }

  // Desktop: WalletProvider with Phantom
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Mobile Phantom connection hook with visibilitychange detection
export const useMobileConnect = (): { connectMobilePhantom: () => void } => {
  const connectMobilePhantom = () => {
    if (typeof window === "undefined") return;

    const currentUrl = encodeURIComponent(window.location.href);
    const deepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;

    let appOpened = false;

    // Listen for visibility change to detect if user switched to Phantom app
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        console.log("Phantom app opened successfully"); // Optional logging
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Direct redirect to Phantom deep link (works on all browsers)
    window.location.href = deepLink;

    // Timeout fallback: If app didn't open within 2s, redirect to download
    // This handles cases where Phantom is not installed or user cancels
    setTimeout(() => {
      if (!appOpened) {
        console.log("Phantom not detected, redirecting to download"); // Optional logging
        window.location.href = "https://phantom.app/download";
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 2000);
  };

  return { connectMobilePhantom };
};
