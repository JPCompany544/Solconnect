"use client";

// WalletProvider.tsx - Production-ready Phantom wallet integration for Next.js

import React, { FC, ReactNode, useMemo, useState, useRef } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

interface Props {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  }, []);

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  if (isMobile) {
    return <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Mobile Phantom connection hook
export const useMobileConnect = (): {
  connectMobilePhantom: () => void;
  downloadModalOpen: boolean;
} => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const inProgress = useRef(false); // persists across renders

  const connectMobilePhantom = () => {
    if (typeof window === "undefined" || inProgress.current) return;
    inProgress.current = true;

    const currentUrl = encodeURIComponent(window.location.href);
    const deepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}`;
    let appOpened = false;

    // iOS/Android visibility detection (best effort)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        inProgress.current = false;
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Attempt iframe first (iOS Safari)
    const iframe = document.createElement("iframe");
    iframe.src = deepLink;
    iframe.style.display = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);

    // Then direct redirect (Android Chrome / fallback)
    setTimeout(() => {
      window.location.href = deepLink;
    }, 50);

    // Timeout fallback: show download modal after 3s if app not opened
    setTimeout(() => {
      if (!appOpened) setDownloadModalOpen(true);
      inProgress.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 3000);
  };

  return { connectMobilePhantom, downloadModalOpen };
};
