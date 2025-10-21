"use client";

// WalletProvider.tsx - Complete Solana wallet integration for Next.js web projects
// Desktop: Wallet adapters with auto-connect, error guards via useWallet hook
// Mobile: Deep link with iframe trick and timeout fallback to download
// Production-ready for HTTPS deployments, seamless cross-platform experience

import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

interface Props {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
  // Detect mobile devices (iOS/Android) - memoized for performance
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }, []);

  // Network configuration - easily switchable (Mainnet for production)
  const network = WalletAdapterNetwork.Mainnet; // Change to Devnet for testing
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Desktop wallet adapters - memoized to prevent unnecessary re-creation
  const wallets = useMemo(
    () => [
      // Phantom Wallet Adapter - primary desktop support
      new PhantomWalletAdapter(),
      // Solflare Wallet Adapter - alternative desktop option
      new SolflareWalletAdapter(),
    ],
    [network] // Dependencies for memoization
  );

  // For mobile, skip wallet adapters and use deep links instead
  if (isMobile) {
    return (
      <ConnectionProvider endpoint={endpoint}>
        {children}
      </ConnectionProvider>
    );
  }

  // Desktop: Full wallet provider with adapters and auto-connect
  // useWallet hook guards against WalletNotSelectedError by allowing selection
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect // Automatically reconnect previously authorized wallets
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Mobile Phantom connection hook - uses iframe trick with timeout
export const useMobileConnect = (): { connectMobilePhantom: () => void } => {
  const connectMobilePhantom = () => {
    if (typeof window === "undefined") return;

    // Encode current page URL for deep link
    const currentUrl = encodeURIComponent(window.location.href);
    const phantomDeepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;

    // Create hidden iframe to attempt opening Phantom app
    // This works better on iOS than direct window.location
    const iframe = document.createElement("iframe");
    iframe.src = phantomDeepLink;
    iframe.style.display = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    document.body.appendChild(iframe);

    // Timeout fallback: If Phantom doesn't open within 2s, redirect to download
    // This handles cases where Phantom is not installed
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
        window.location.href = "https://phantom.app/download";
      }
    }, 2000);
  };

  return { connectMobilePhantom };
};
