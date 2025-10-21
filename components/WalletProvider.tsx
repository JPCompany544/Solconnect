"use client";

// WalletProvider.tsx - Mobile + Desktop Phantom flow for Next.js

import React, { FC, ReactNode, useMemo, useState, useRef } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { SolanaMobileWalletAdapter, createDefaultAuthorizationResultCache } from '@solana-mobile/wallet-adapter-mobile';

interface Props {
  children: ReactNode;
}

// ----- Utility: Detect mobile browser -----
const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
};

// ----- Wallet Connection Provider -----
const WalletConnectionProvider: FC<Props> = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolanaMobileWalletAdapter({
      appIdentity: { name: 'SolConnect' },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
    })
  ], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// ----- Mobile Connect Hook -----
const useMobileConnect = (): { connectMobilePhantom: () => void; downloadModalOpen: boolean } => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const inProgress = useRef(false);

  const connectMobilePhantom = () => {
    if (typeof window === "undefined" || inProgress.current) return;
    inProgress.current = true;

    const appUrl = encodeURIComponent(window.location.origin);
    const redirectUri = encodeURIComponent(`${window.location.origin}/phantom-callback`);
    const cluster = "mainnet";

    // Deep link to Phantom
    const deepLink = `phantom://connect?app_url=${appUrl}&redirect_uri=${redirectUri}&cluster=${cluster}`;

    let appOpened = false;

    // Detect if user switches to Phantom (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        inProgress.current = false;
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // iOS: attempt hidden iframe
    const iframe = document.createElement("iframe");
    iframe.src = deepLink;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 500);

    // Android / fallback: redirect
    setTimeout(() => {
      window.location.href = deepLink;
    }, 50);

    // If Phantom not installed / not opened, show download modal
    setTimeout(() => {
      if (!appOpened) setDownloadModalOpen(true);
      inProgress.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 2500);
  };

  return { connectMobilePhantom, downloadModalOpen };
};

// ----- Exports -----
export { WalletConnectionProvider, useMobileConnect };
