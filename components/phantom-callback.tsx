"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PhantomCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const publicKey = params.get("public_key");

    if (publicKey) {
      localStorage.setItem("phantom_wallet", publicKey);
      router.push("/dashboard");
    } else {
      // User rejected or something went wrong
      router.push("/");
    }
  }, [router]);

  return <div>Connecting to Phantom...</div>;
}
