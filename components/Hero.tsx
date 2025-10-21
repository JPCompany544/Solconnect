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

  // Detect mobile device
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  }, []);

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

    let selectedWallet;
    if (isMobile) {
      // Mobile: select SolanaMobileWalletAdapter (works in Phantom app browser)
      selectedWallet = wallets.find((w) => w.adapter.name !== "Phantom");
      if (!selectedWallet) {
        const available = wallets.map(w => w.adapter.name).join(', ');
        console.error("Mobile wallet adapter not found. Available wallets:", available);
        alert(`Mobile wallet adapter not found. Available: ${available}. Please try again.`);
        return;
      }
    } else {
      // Desktop: select Phantom and connect
      selectedWallet = wallets.find((w) => w.adapter.name === "Phantom");
      if (!selectedWallet) {
        console.error("Phantom wallet not found.");
        alert("Please install Phantom wallet to continue.");
        return;
      }
      // Check for window.solana
      if (typeof window === 'undefined' || !window.solana || !window.solana.isPhantom) {
        console.error("Phantom wallet not detected in browser.");
        alert("Phantom wallet not detected. Please install the extension.");
        return;
      }
      console.log("Selecting wallet:", selectedWallet.adapter.name);
      select(selectedWallet.adapter.name);
      try {
        await connect();
        console.log("Successfully connected to wallet:", selectedWallet.adapter.name, "Public key:", publicKey?.toString());
      } catch (err) {
        console.error("Wallet connection failed:", err);
        alert("Connection failed. Please try again.");
      }
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
          className="flex items-center mx-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg mb-8 transition-all duration-300 shadow-lg min-h-[48px] touch-manipulation"
          onClick={handleConnect}
        >
          <img
            src="/images/phantom-wallet-logo.png"
            alt="Phantom"
            className="w-6 h-6 rounded-full mr-2"
          />
          {connected ? "Connected" : "Connect Phantom"}
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
