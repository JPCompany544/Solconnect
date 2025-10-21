"use client";

// WalletProvider.tsx - Mobile + Desktop Phantom flow for Next.js

import React, { FC, ReactNode, useMemo, useState, useRef, useEffect } from "react";
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

  // Mobile: only provide connection context, deep link handles approval
  if (isMobile) return <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>;

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
export const useMobileConnect = (): {
  connectMobilePhantom: () => void;
  downloadModalOpen: boolean;
} => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const inProgress = useRef(false); // prevent multiple clicks

  const connectMobilePhantom = () => {
    if (typeof window === "undefined" || inProgress.current) return;
    inProgress.current = true;

    const currentUrl = encodeURIComponent(window.location.origin);
    const redirectUri = encodeURIComponent(`${window.location.origin}/dashboard`);
    const cluster = "mainnet";

    // Deep link that Phantom understands for connection
    const deepLink = `phantom://connect?app_url=${currentUrl}&redirect_uri=${redirectUri}&cluster=${cluster}`;

    let appOpened = false;

    // Detect if user switches to Phantom app
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        inProgress.current = false;
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // iOS Safari: attempt hidden iframe first
    const iframe = document.createElement("iframe");
    iframe.src = deepLink;
    iframe.style.display = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);

    // Android / fallback: direct redirect
    setTimeout(() => {
      window.location.href = deepLink;
    }, 50);

    // If Phantom not installed / user didn’t open, show download modal after 3s
    setTimeout(() => {
      if (!appOpened) setDownloadModalOpen(true);
      inProgress.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 3000);
  };

  // Optional: automatically hide download modal if Phantom is installed
  useEffect(() => {
    if (downloadModalOpen && window.solana?.isPhantom) {
      setDownloadModalOpen(false);
    }
  }, [downloadModalOpen]);

  return { connectMobilePhantom, downloadModalOpen };
};
