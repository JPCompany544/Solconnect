'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function WalletCard() {
  const { publicKey, disconnect } = useWallet()
  const router = useRouter()

  const handleDisconnect = async () => {
    try {
      await disconnect()
      localStorage.removeItem('phantom_wallet')
      router.push('/')
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-[#1C1B3A] to-[#2E2C69] rounded-xl p-4 md:p-6 mb-8 shadow-lg"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-white text-xl md:text-2xl font-bold mb-2">Phantom Wallet</h2>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white/80">Connected</span>
          </div>
          <p className="text-white/80 text-sm md:text-base">
            Address: {publicKey ? shortenAddress(publicKey.toString()) : 'N/A'}
          </p>
          <p className="text-white/80 mt-2 text-sm md:text-base">Loan Balance: 0 SOL</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDisconnect}
          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold shadow-md min-h-[40px] touch-manipulation w-full md:w-auto"
        >
          Disconnect
        </motion.button>
      </div>
    </motion.div>
  )
}
