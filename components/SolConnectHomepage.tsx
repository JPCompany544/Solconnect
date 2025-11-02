'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Shield, Gem, Check, Copy, ExternalLink } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import HCaptcha from '@hcaptcha/react-hcaptcha';

// Modal Components
const ConnectModal = ({ isOpen, onClose, onConnect }: { isOpen: boolean; onClose: () => void; onConnect: () => void }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-[#1a1b2e] to-[#0A0B14] border border-purple-500/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-purple-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#9A4DFF] to-[#00FFA3] bg-clip-text text-transparent">
          Connect Phantom
        </h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Sol-Connect reads balances to show your instant limit. No KYC · No private key storage.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onConnect}
            className="flex-1 bg-gradient-to-r from-[#9A4DFF] to-[#7B3FCC] text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
          >
            Connect (Read-Only)
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-600 text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-800/50 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const LimitModal = ({ isOpen, onClose, onBorrow }: { isOpen: boolean; onClose: () => void; onBorrow: () => void }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-[#1a1b2e] to-[#0A0B14] border border-cyan-500/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#9A4DFF] to-[#00FFA3] bg-clip-text text-transparent">
          Your Borrowing Limit
        </h2>
        <div className="bg-black/40 rounded-xl p-6 mb-6 border border-purple-500/10">
          <p className="text-gray-300 mb-4">
            You can borrow up to <span className="text-[#00FFA3] font-bold text-2xl">2.5 SOL</span>
          </p>
          <p className="text-gray-400 text-sm mb-2">
            LTV: <span className="text-white font-semibold">75%</span>
          </p>
          <p className="text-gray-400 text-sm mb-2">
            Fee: <span className="text-white font-semibold">2%</span>
          </p>
          <p className="text-gray-300 mt-4 pt-4 border-t border-gray-700">
            Net: <span className="text-[#00FFA3] font-bold text-xl">2.45 SOL</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBorrow}
            className="flex-1 bg-gradient-to-r from-[#9A4DFF] to-[#7B3FCC] text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
          >
            Borrow Now
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-600 text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-800/50 transition-all duration-300"
          >
            Back
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProcessingModal = ({ isOpen }: { isOpen: boolean }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-[#1a1b2e] to-[#0A0B14] border border-purple-500/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-purple-500/20"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-[#9A4DFF] to-[#00FFA3] bg-clip-text text-transparent">
          Processing Transaction
        </h2>
        <p className="text-gray-300 text-center leading-relaxed">
          Confirm in Phantom wallet. Funds arrive after ~60 seconds (2 confirmations).
        </p>
      </motion.div>
    </motion.div>
  );
};

// Main Homepage Component
export default function SolConnectHomepage() {
  const { wallets, select, connected, connect, publicKey } = useWallet();
  const router = useRouter();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [processingModalOpen, setProcessingModalOpen] = useState(false);
  const [copiedVault, setCopiedVault] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const vaultAddress = "7vTx...zQk";

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

  const handleCopyVault = () => {
    navigator.clipboard.writeText("7vTxExampleVaultAddresszQk");
    setCopiedVault(true);
    setTimeout(() => setCopiedVault(false), 2000);
  };

  const handleConnect = () => {
    setConnectModalOpen(false);
    setLimitModalOpen(true);
  };

  const handleBorrow = () => {
    setLimitModalOpen(false);
    setProcessingModalOpen(true);
    setTimeout(() => setProcessingModalOpen(false), 3000);
  };

  // Connect wallet handler
  const handleWalletConnect = async () => {
    if (!token) {
      alert("Please complete the captcha to connect your wallet.");
      return;
    }

    if (connected) {
      console.log("Wallet already connected, skipping connection attempt.");
      return;
    }

    setIsConnecting(true);

    try {
      // Mobile device logic
      if (isMobile) {
        if (isPhantomInApp) {
          console.log("Inside Phantom in-app browser, connecting directly...");
          
          if (typeof window !== 'undefined' && window.solana?.isPhantom) {
            const phantomWallet = wallets.find((w) => w.adapter.name === "Phantom");
            
            if (phantomWallet) {
              console.log("Selecting Phantom wallet:", phantomWallet.adapter.name);
              select(phantomWallet.adapter.name);
              await new Promise(resolve => setTimeout(resolve, 250));
              
              try {
                if (!connected) {
                  await connect();
                } else {
                  console.log("Already connected, skipping connect call.");
                  return;
                }
                console.log("Successfully connected to Phantom. Public key:", publicKey?.toString());
              } catch (connectErr) {
                if (connected) {
                  console.log("Connection succeeded despite error, ignoring...");
                  return;
                }
                console.log("First connection attempt failed, retrying...");
                await new Promise(resolve => setTimeout(resolve, 200));
                try {
                  if (!connected) {
                    await connect();
                  }
                  console.log("Successfully connected on retry. Public key:", publicKey?.toString());
                } catch (retryErr) {
                  if (!connected) {
                    throw retryErr;
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
          console.log("External mobile browser detected, redirecting to Phantom app...");
          redirectToPhantom();
          return;
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
        
        if (typeof window === 'undefined' || !window.solana || !window.solana.isPhantom) {
          console.error("Phantom wallet not detected in browser.");
          alert("Phantom wallet not detected. Please install the extension.");
          setIsConnecting(false);
          return;
        }
        
        console.log("Selecting Phantom wallet:", phantomWallet.adapter.name);
        select(phantomWallet.adapter.name);
        await new Promise(resolve => setTimeout(resolve, 250));
        
        try {
          if (!connected) {
            await connect();
          } else {
            console.log("Already connected, skipping connect call.");
            return;
          }
          console.log("Successfully connected to Phantom. Public key:", publicKey?.toString());
        } catch (connectErr) {
          if (connected) {
            console.log("Connection succeeded despite error, ignoring...");
            return;
          }
          console.log("First connection attempt failed, retrying...");
          await new Promise(resolve => setTimeout(resolve, 200));
          try {
            if (!connected) {
              await connect();
            }
            console.log("Successfully connected on retry. Public key:", publicKey?.toString());
          } catch (retryErr) {
            if (!connected) {
              throw retryErr;
            }
            console.log("Connected successfully after retry despite error.");
          }
        }
      }
    } catch (err) {
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

  // Live activity data
  const [activities, setActivities] = useState([
    { wallet: "7F...9k", amount: "0.5 SOL", time: "2 min ago" },
    { wallet: "Ah...3P", amount: "1.2 SOL", time: "8 min ago" },
    { wallet: "Bx...7m", amount: "0.8 SOL", time: "15 min ago" },
    { wallet: "Cq...2n", amount: "2.1 SOL", time: "23 min ago" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) => {
        const newActivity = {
          wallet: `${Math.random().toString(36).substring(2, 4).toUpperCase()}...${Math.random().toString(36).substring(2, 4)}`,
          amount: `${(Math.random() * 2 + 0.1).toFixed(1)} SOL`,
          time: "just now",
        };
        return [newActivity, ...prev.slice(0, 3)];
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white overflow-hidden relative">
      {/* Animated Background Orbs */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#9A4DFF] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-[#00FFA3] rounded-full blur-[150px] opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-[#9A4DFF] rounded-full blur-[130px] opacity-10"></div>
      </motion.div>

      {/* Solana Wave Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M0,100 Q400,50 800,100 T1600,100"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9A4DFF" />
              <stop offset="100%" stopColor="#00FFA3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Borrow against your Phantom wallet —
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#9A4DFF] to-[#00FFA3] bg-clip-text text-transparent">
                instant liquidity in 60 seconds.
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              No KYC • Read-only connect • Transparent on-chain escrow
            </p>

            <div className="flex flex-col items-center gap-6 mb-8">
              <button
                onClick={handleWalletConnect}
                disabled={isConnecting || connected}
                className="group bg-gradient-to-r from-[#9A4DFF] to-[#7B3FCC] text-white py-4 px-12 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {connected ? "Connected ✅" : isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>

              {/* hCaptcha */}
              <div className="flex justify-center items-center">
                <HCaptcha
                  sitekey="0760c644-e7dc-484c-a512-787acce2b960"
                  onVerify={handleVerify}
                  onExpire={handleExpire}
                  onError={handleError}
                  theme="dark"
                  size="compact"
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-6 py-3 font-mono text-sm text-cyan-400"
            >
              Demo loan → 0.08 SOL · tx <span className="text-purple-400">7vT…zQk</span> (2 confirmations)
            </motion.div>

            {/* Mock Wallet Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-16 max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-br from-[#1a1b2e]/80 to-[#0A0B14]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9A4DFF] to-[#00FFA3] rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-400">Available to borrow</p>
                      <p className="text-3xl font-bold text-white">2.5 SOL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Your balance</p>
                    <p className="text-xl font-semibold text-gray-200">3.8 SOL</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-[#9A4DFF] to-[#00FFA3] rounded-full"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Row */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant",
                description: "Funds arrive after 1–2 confirmations.",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure",
                description: "Collateral locked by audited Solana smart contract.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Gem className="w-8 h-8" />,
                title: "Transparent",
                description: "Fixed 2% fee, no slippage.",
                gradient: "from-purple-500 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-gradient-to-br from-[#1a1b2e]/60 to-[#0A0B14]/60 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#9A4DFF] to-[#00FFA3] bg-clip-text text-transparent">
              How It Works
            </h2>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#9A4DFF] via-purple-500 to-[#00FFA3] hidden md:block"></div>

              {[
                {
                  step: "1",
                  title: "Connect Phantom",
                  description: "Read-only, no signature yet.",
                },
                {
                  step: "2",
                  title: "View Limit",
                  description: "See how much you can borrow.",
                },
                {
                  step: "3",
                  title: "Confirm Loan",
                  description: "Sign once, receive SOL in ≈ 60s.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative flex items-start gap-6 mb-12 last:mb-0"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#9A4DFF] to-[#00FFA3] rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/50">
                    {item.step}
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-[#1a1b2e]/60 to-[#0A0B14]/60 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300">
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Proof / Security Block */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-[#9A4DFF] to-[#00FFA3] bg-clip-text text-transparent">
              Verified on Solana
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Every transaction executes on-chain. Verify the vault anytime on Solscan.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-[#1a1b2e]/80 to-[#0A0B14]/80 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold">Audit Summary</h3>
                </div>
                <p className="text-gray-400 mb-4">Audited by leading security firms</p>
                <a href="#" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-semibold">
                  View Report <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-[#1a1b2e]/80 to-[#0A0B14]/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <ExternalLink className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold">Vault Address</h3>
                </div>
                <p className="text-gray-400 mb-4 font-mono text-sm">{vaultAddress}</p>
                <button
                  onClick={handleCopyVault}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-semibold"
                >
                  {copiedVault ? "Copied!" : "Copy Address"} <Copy className="w-4 h-4" />
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-[#1a1b2e]/80 to-[#0A0B14]/80 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold">Read-Only Connect</h3>
                </div>
                <p className="text-gray-400">No private keys stored. Your funds stay secure.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Live Activity Feed */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#9A4DFF] to-[#00FFA3] bg-clip-text text-transparent">
              Live Activity
            </h2>
            <div className="bg-gradient-to-br from-[#1a1b2e]/60 to-[#0A0B14]/60 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6 overflow-hidden">
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0 font-mono text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-400">Wallet</span>
                      <span className="text-purple-400">{activity.wallet}</span>
                      <span className="text-gray-400">borrowed</span>
                      <span className="text-cyan-400 font-bold">{activity.amount}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Band */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="container mx-auto px-6"
          >
            <div className="bg-gradient-to-r from-[#9A4DFF]/20 via-purple-900/20 to-[#00FFA3]/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12 text-center shadow-2xl shadow-purple-500/20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to unlock your Phantom liquidity?
              </h2>
              <button
                onClick={handleWalletConnect}
                disabled={isConnecting || connected}
                className="bg-gradient-to-r from-[#9A4DFF] to-[#7B3FCC] text-white py-4 px-12 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {connected ? "Connected ✅" : isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-gray-400 mb-2">Sol-Connect © 2025</p>
                <p className="text-sm text-gray-500">Powered by Solana • Built for Phantom users</p>
              </div>
              <div className="flex gap-6 text-gray-400">
                <a href="#" className="hover:text-purple-400 transition-colors">Docs</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Audit</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnect={handleConnect}
      />
      <LimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        onBorrow={handleBorrow}
      />
      <ProcessingModal isOpen={processingModalOpen} />
    </div>
  );
}
