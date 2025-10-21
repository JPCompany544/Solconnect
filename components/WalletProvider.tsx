"use client";

// WalletProvider.tsx - Production-ready Phantom wallet integration for Next.js

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

  if (isMobile) {
    // Mobile: just provide connection context; deep link handles connection
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

// Mobile Phantom connection hook with proper deep link parameters
export const useMobileConnect = (): {
  connectMobilePhantom: () => void;
  downloadModalOpen: boolean;
} => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const inProgress = useRef(false); // Prevent multiple simultaneous connection attempts

  const connectMobilePhantom = () => {
    if (typeof window === "undefined" || inProgress.current) return;
    inProgress.current = true;

    // Current page URL for app_url parameter
    const currentUrl = encodeURIComponent(window.location.href);

    // Redirect URI: after approval in Phantom, redirect back to dashboard
    const dashboardUrl = `${window.location.origin}/dashboard`;
    const redirectUri = encodeURIComponent(dashboardUrl);

    // Cluster: default to mainnet for production
    const cluster = "mainnet";

    // Phantom deep link with required parameters for connection and redirect
    const deepLink = `https://phantom.app/ul/v1/connect?app_url=${currentUrl}&redirect_uri=${redirectUri}&cluster=${cluster}`;

    let appOpened = false;

    // Detect if user switched to Phantom app (visibilitychange event)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        inProgress.current = false;
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // iOS Safari: Use hidden iframe to trigger app open (more reliable on iOS)
    const iframe = document.createElement("iframe");
    iframe.src = deepLink;
    iframe.style.display = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    document.body.appendChild(iframe);

    // Clean up iframe after short delay
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);

    // Android / fallback: Direct redirect as backup
    setTimeout(() => {
      window.location.href = deepLink;
    }, 50);

    // Timeout fallback: If Phantom app didn't open within 3s, show download modal
    setTimeout(() => {
      if (!appOpened) setDownloadModalOpen(true);
      inProgress.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 3000);
  };

  // Close modal if user installs Phantom later
  useEffect(() => {
    if (downloadModalOpen && window.solana?.isPhantom) {
      setDownloadModalOpen(false);
    }
  }, [downloadModalOpen]);

  return { connectMobilePhantom, downloadModalOpen };
};
