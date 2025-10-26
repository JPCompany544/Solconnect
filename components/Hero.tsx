"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useMobileConnect } from "./WalletProvider";

export default function Hero() {
  const { wallets, select, connected, connect, publicKey } = useWallet();
  const { connectMobilePhantom } = useMobileConnect();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Detect mobile device
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Mobi|Android/i.test(navigator.userAgent);
  }, []);

  // Detect if user is inside Phantom's in-app browser
  const isPhantomInApp = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Phantom/i.test(navigator.userAgent);
  }, []);

  // Helper function to redirect to Phantom deep link
  const redirectToPhantom = () => {
    if (typeof window === "undefined") return;
    const siteUrl = encodeURIComponent(window.location.href);
    const phantomDeepLink = `phantom://browse/${siteUrl}`;
    console.log("Redirecting to Phantom app:", phantomDeepLink);
    window.location.href = phantomDeepLink;
  };

  // Redirect to dashboard when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      console.log("Wallet connected successfully. Public key:", publicKey.toString());
      localStorage.setItem("phantom_wallet", publicKey.toString());
      router.push("/dashboard");
    }
  }, [connected, publicKey, router]);

  // hCaptcha handlers
  const handleVerify = (token: string) => setToken(token);
  const handleExpire = () => setToken(null);
  const handleError = (err: string) => {
    console.error("hCaptcha error:", err);
    setToken(null);
  };

  // Connect wallet handler
  const handleConnect = async () => {
    if (!token) {
      alert("Please complete the captcha to connect your wallet.");
      return;
    }

    setIsConnecting(true);

    try {
      // Mobile device logic
      if (isMobile) {
        // Check if we're inside Phantom's in-app browser
        if (isPhantomInApp) {
          // Inside Phantom app - connect directly
          console.log("Inside Phantom in-app browser, connecting directly...");
          
          // Verify window.solana is available
          if (typeof window !== 'undefined' && window.solana?.isPhantom) {
            const phantomWallet = wallets.find((w) => w.adapter.name === "Phantom");
            
            if (phantomWallet) {
              console.log("Selecting Phantom wallet:", phantomWallet.adapter.name);
              select(phantomWallet.adapter.name);
              
              // Wait for provider to be fully ready
              await new Promise(resolve => setTimeout(resolve, 250));
              
              try {
                await connect();
                console.log("Successfully connected to Phantom. Public key:", publicKey?.toString());
              } catch (connectErr) {
                // Check if wallet actually connected despite error
                if (connected) {
                  console.log("Connection succeeded despite error, ignoring...");
                  return;
                }
                // Silent retry after short delay
                console.log("First connection attempt failed, retrying...");
                await new Promise(resolve => setTimeout(resolve, 200));
                try {
                  await connect();
                  console.log("Successfully connected on retry. Public key:", publicKey?.toString());
                } catch (retryErr) {
                  // Check again if connected
                  if (!connected) {
                    throw retryErr; // Only throw if truly failed
                  }
                  console.log("Connected successfully after retry despite error.");
                }
              }
            } else {
              console.error("Phantom wallet adapter not found in wallets list.");
              alert("Phantom wallet not available. Please try again.");
              setIsConnecting(false);
              return;
            }
          } else {
            console.error("Phantom provider not available.");
            alert("Phantom wallet not detected. Please try again.");
            setIsConnecting(false);
            return;
          }
        } else {
          // External mobile browser - redirect to Phantom app
          console.log("External mobile browser detected, redirecting to Phantom app...");
          redirectToPhantom();
          return; // Exit early as we're redirecting
        }
      } else {
        // Desktop: select Phantom and connect
        const phantomWallet = wallets.find((w) => w.adapter.name === "Phantom");
        
        if (!phantomWallet) {
          console.error("Phantom wallet not found.");
          alert("Please install Phantom wallet extension to continue.");
          setIsConnecting(false);
          return;
        }
        
        // Check for window.solana
        if (typeof window === 'undefined' || !window.solana || !window.solana.isPhantom) {
          console.error("Phantom wallet not detected in browser.");
          alert("Phantom wallet not detected. Please install the extension.");
          setIsConnecting(false);
          return;
        }
        
        console.log("Selecting Phantom wallet:", phantomWallet.adapter.name);
        select(phantomWallet.adapter.name);
        
        // Wait for provider to be fully ready
        await new Promise(resolve => setTimeout(resolve, 250));
        
        try {
          await connect();
          console.log("Successfully connected to Phantom. Public key:", publicKey?.toString());
        } catch (connectErr) {
          // Check if wallet actually connected despite error
          if (connected) {
            console.log("Connection succeeded despite error, ignoring...");
            return;
          }
          // Silent retry after short delay
          console.log("First connection attempt failed, retrying...");
          await new Promise(resolve => setTimeout(resolve, 200));
          try {
            await connect();
            console.log("Successfully connected on retry. Public key:", publicKey?.toString());
          } catch (retryErr) {
            // Check again if connected
            if (!connected) {
              throw retryErr; // Only throw if truly failed
            }
            console.log("Connected successfully after retry despite error.");
          }
        }
      }
    } catch (err) {
      // Final check: only show error if wallet is not connected
      if (!connected) {
        console.error("Wallet connection failed after retry:", err);
        alert("Connection failed. Please try again.");
      } else {
        console.log("Wallet connected successfully, ignoring error.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />

      {/* Decorative blurred shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg blur-xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg blur-xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg blur-xl" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white/80 text-lg mb-4 tracking-wide"
        >
          The crypto companion that'll take you places
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
        >
          Your trusted{" "}
          <img
            src="/images/phantom-wallet-logo.png"
            alt="Phantom"
            className="inline w-8 h-8 rounded-full align-baseline"
          />{" "}
          loan companion
        </motion.h1>

        {/* Connect button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center mx-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg mb-8 transition-all duration-300 shadow-lg min-h-[48px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleConnect}
          disabled={isConnecting || connected}
        >
          <img
            src="/images/phantom-wallet-logo.png"
            alt="Phantom"
            className="w-6 h-6 rounded-full mr-2"
          />
          {connected ? "Connected ✅" : isConnecting ? "Connecting..." : "Connect Phantom"}
        </motion.button>

        {/* Security badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-row items-center justify-center gap-4 mb-8"
        >
          {["Secure", "Fast", "Reliable"].map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-white/90 font-medium">{item}</span>
            </div>
          ))}
        </motion.div>

        {/* hCaptcha */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center items-center w-full max-w-sm mx-auto px-4"
        >
          <div className="w-full max-w-xs grid place-items-center min-h-[78px] mt-4 md:mt-0">
            <HCaptcha
              sitekey="10000000-ffff-ffff-ffff-000000000001"
              onVerify={handleVerify}
              onExpire={handleExpire}
              onError={handleError}
              theme="dark"
              size="compact"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
