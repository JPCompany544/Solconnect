"use client";

// WalletProvider.tsx - Integrated desktop and mobile Phantom wallet support
// Desktop: Uses wallet adapters for extension-based connection
// Mobile: Uses Mobile Wallet Adapter Protocol for app-based connection

import React, { FC, ReactNode, useMemo, useState, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  transact,
  Web3MobileWallet,
  APP_IDENTITY
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

interface Props {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
  const [mobileWallet, setMobileWallet] = useState<Web3MobileWallet | null>(null);

  // Detect mobile browsers (iOS/Android)
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }, []);

  // Define app identity for mobile wallet
  const appIdentity: APP_IDENTITY = {
    name: 'SolConnect App',
    uri: 'https://solconnect.app',
    icon: 'https://solconnect.app/images/main-logo.png'
  };

  // Mobile wallet connection function
  const connectMobileWallet = async () => {
    if (!isMobile) return;

    try {
      // Use transact to authorize with Phantom mobile app
      await transact(async (wallet) => {
        // Request authorization
        const authorizationResult = await wallet.authorize({
          cluster: "mainnet-beta",
          identity: appIdentity,
        });

        // Log the first account address
        console.log("Mobile wallet authorized:", authorizationResult.accounts[0].address);

        // Store the wallet instance for future signing
        setMobileWallet(wallet);

        return authorizationResult;
      });
    } catch (error) {
      console.warn("Mobile wallet not installed or connection failed:", error);
      // Optionally, show fallback UI here
    }
  };

  // Auto-connect mobile wallet on mount if mobile
  useEffect(() => {
    if (isMobile) {
      connectMobileWallet();
    }
  }, [isMobile]);

  // Set network to Mainnet
  const network = WalletAdapterNetwork.Mainnet;

  // Create Solana RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Desktop wallet adapters (only for non-mobile)
  const wallets = useMemo(() => {
    if (isMobile) return []; // No adapters for mobile, use protocol instead

    return [
      // Desktop Phantom Wallet Adapter
      new PhantomWalletAdapter(),
      // Additional desktop wallet support
      new SolflareWalletAdapter(),
    ];
  }, [isMobile, network]);

  // For mobile, render without WalletProvider, handle via protocol
  if (isMobile) {
    return (
      <ConnectionProvider endpoint={endpoint}>
        {children}
      </ConnectionProvider>
    );
  }

  // Desktop: Use standard wallet adapters
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
