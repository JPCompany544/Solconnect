"use client";

// WalletProvider.tsx - Solana wallet integration for Next.js web projects
// Desktop: Wallet adapters with auto-connect and safe connection guards
// Mobile: Deep link with detection, avoids unnecessary download redirects
// Production-ready for HTTPS deployments

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
    const ua = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  }, []);

  const network = WalletAdapterNetwork.Mainnet; // Change to Devnet if needed
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Desktop wallet adapters
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [network]
  );

  if (isMobile) {
    // Mobile: only provide connection context, wallet handled via deep link
    return <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>;
  }

  // Desktop: full WalletProvider with adapters
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
    const deepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;

    // Try opening Phantom
    const newWindow = window.open(deepLink, "_blank");

    // Fallback to download only if window failed
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      window.location.href = "https://phantom.app/download";
    }
  };

  return { connectMobilePhantom };
};
