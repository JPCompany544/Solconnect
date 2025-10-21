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

// Mobile Phantom connection hook
export const useMobileConnect = (): {
  connectMobilePhantom: () => void;
  downloadModalOpen: boolean;
} => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const inProgress = useRef(false); // persist across renders

  const connectMobilePhantom = () => {
    if (typeof window === "undefined" || inProgress.current) return;
    inProgress.current = true;

    const currentUrl = encodeURIComponent(window.location.href);
    const deepLink = `phantom://connect?app_url=${currentUrl}`;

    let appOpened = false;

    // Detect if user switches to Phantom app (best effort)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        inProgress.current = false;
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // iOS Safari: attempt via hidden iframe
    const iframe = document.createElement("iframe");
    iframe.src = deepLink;
    iframe.style.display = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    document.body.appendChild(iframe);

    // Remove iframe after 1s
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);

    // Android / fallback: direct redirect
    setTimeout(() => {
      window.location.href = deepLink;
    }, 50);

    // Timeout fallback: show download modal if app not opened in 3s
    setTimeout(() => {
      if (!appOpened) setDownloadModalOpen(true);
      inProgress.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 3000);
  };

  // Optional: close download modal automatically if user installed Phantom
  useEffect(() => {
    if (downloadModalOpen && window.solana?.isPhantom) {
      setDownloadModalOpen(false);
    }
  }, [downloadModalOpen]);

  return { connectMobilePhantom, downloadModalOpen };
};
