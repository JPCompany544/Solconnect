"use client";

// WalletProvider.tsx - Production-ready Phantom wallet integration for Next.js

import React, { FC, ReactNode, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

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

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Only Phantom wallet
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  if (isMobile) {
    // Mobile: just provide connection context
    return <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>;
  }

  // Desktop: WalletProvider with autoConnect
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Mobile Phantom connection hook
export const useMobileConnect = (): { connectMobilePhantom: () => void; downloadModalOpen: boolean } => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  let inProgress = false; // debounce multiple clicks

  const connectMobilePhantom = () => {
    if (typeof window === "undefined" || inProgress) return;
    inProgress = true;

    const currentUrl = encodeURIComponent(window.location.href);
    const deepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;
    let appOpened = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        inProgress = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // iOS/Safari reliable: hidden iframe + deep link
    const iframe = document.createElement("iframe");
    iframe.src = deepLink;
    iframe.style.display = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    document.body.appendChild(iframe);

    // Remove iframe after 1s to avoid memory leaks
    setTimeout(() => document.body.removeChild(iframe), 1000);

    // Timeout fallback: 3s
    setTimeout(() => {
      if (!appOpened) {
        setDownloadModalOpen(true); // show modal instead of forced redirect
        inProgress = false;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 3000);
  };

  return { connectMobilePhantom, downloadModalOpen };
};
