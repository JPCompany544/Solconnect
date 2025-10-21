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
    if (typeof window === "undefined") return;

    // Open the dApp in Phantom's mobile browser where MWA can work
    const currentUrl = encodeURIComponent(window.location.href);
    const deepLink = `phantom://browse?url=${currentUrl}`;

    window.location.href = deepLink;
  };

  return { connectMobilePhantom, downloadModalOpen };
};

// ----- Exports -----
export { WalletConnectionProvider, useMobileConnect };
