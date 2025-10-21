"use client";

// WalletProvider.tsx - Comprehensive Solana wallet integration for desktop and mobile
// Supports Phantom desktop extension and mobile app via Mobile Wallet Adapter Protocol

import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler
} from "@solana-mobile/wallet-adapter-mobile";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

interface Props {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
  // Set network to Mainnet for production
  const network = WalletAdapterNetwork.Mainnet;

  // Create Solana RPC endpoint using clusterApiUrl
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Memoize wallet adapters to prevent unnecessary re-creation
  const wallets = useMemo(
    () => [
      // Mobile Wallet Adapter - handles mobile devices (iOS/Android)
      // Uses @solana-mobile/wallet-adapter-mobile for protocol-based connection
      // Automatically detects mobile and opens Phantom app
      new SolanaMobileWalletAdapter({
        // Address selector for user to choose wallet address
        addressSelector: createDefaultAddressSelector(),

        // App identity displayed in wallet
        appIdentity: {
          name: 'SolConnect App',
          uri: 'https://solconnect.app', // dApp URI
          icon: 'https://solconnect.app/images/main-logo.png' // dApp icon
        },

        // Authorization caching for seamless reconnection
        authorizationResultCache: createDefaultAuthorizationResultCache(),

        // Chain configuration
        chain: 'mainnet-beta',

        // Fallback handler if wallet not found (e.g., Phantom not installed)
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      }),

      // Desktop Phantom Wallet Adapter - standard browser extension
      // Uses @solana/wallet-adapter-wallets for desktop connection
      new PhantomWalletAdapter(),

      // Additional desktop wallet support
      new SolflareWalletAdapter(),
    ],
    // Dependency on network for endpoint changes
    [network]
  );

  return (
    // ConnectionProvider provides Solana RPC connection
    <ConnectionProvider endpoint={endpoint}>
      {/* WalletProvider manages wallet state and adapters */}
      <WalletProvider
        wallets={wallets}
        // Auto-connect previously authorized wallets on page load
        autoConnect
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
