"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConnectPhantomPage() {
  const { connect, connected, publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected && publicKey) {
      router.push("/dashboard");
    }
  }, [connected, publicKey, router]);

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <button
        onClick={() => connect?.()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md"
      >
        {connected ? "Connected" : "Connect Phantom"}
      </button>
    </main>
  );
}
