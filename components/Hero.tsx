"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useMobileConnect } from "./WalletProvider";

export default function Hero() {
  const [token, setToken] = useState<string | null>(null);
  const { wallets, select, connected, connect, publicKey } = useWallet();
  const router = useRouter();
  const { connectMobilePhantom, downloadModalOpen } = useMobileConnect();

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      localStorage.setItem("phantom_wallet", publicKey.toString());
      router.push("/dashboard");
    }
  }, [connected, publicKey, router]);

  const handleVerify = (token: string) => setToken(token);
  const handleExpire = () => setToken(null);
  const handleError = (err: string) => {
    console.log("hCaptcha error:", err);
    setToken(null);
  };

  const handleConnect = async () => {
    if (!token) {
      alert("Please complete the captcha to connect your wallet.");
      return;
    }

    if (isMobile) {
      // Mobile: open Phantom via deep link
      connectMobilePhantom();
    } else {
      // Desktop: auto-select Phantom and connect
      const phantomWallet = wallets.find((wallet) => wallet.adapter.name === "Phantom");
      if (!phantomWallet) {
        alert("Please install Phantom wallet to continue.");
        return;
      }
      select(phantomWallet.adapter.name);
      try {
        await connect();
      } catch (err) {
        console.error("Connection failed:", err);
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />

      {/* Blurred shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg blur-xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg blur-xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg blur-xl" />
      </div>

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

      {/* Mobile Download Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xs text-center">
            <h2 className="text-lg font-bold mb-4">Phantom Wallet Not Detected</h2>
            <p className="text-sm mb-6">
              It seems you don’t have Phantom installed. Please download the wallet to continue.
            </p>
            <a
              href="https://phantom.app/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Download Phantom
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
