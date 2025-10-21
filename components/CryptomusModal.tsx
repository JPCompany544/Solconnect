'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import PaymentDetailsModal from './PaymentDetailsModal'

interface CryptomusModalProps {
  isOpen: boolean
  onClose: () => void
  selectedAmount: number
  selectedCurrency: string
  selectedNetwork: string
  setSelectedCurrency: (currency: string) => void
  setSelectedNetwork: (network: string) => void
  setModalType: (type: 'cryptomus' | 'paymentDetails' | null) => void
  timeLeft: number
  expired: boolean
}

interface CurrencyOption {
  name: string
  networks: number
  networkList: string[]
}

const currencies: CurrencyOption[] = [
  { name: 'USDT', networks: 3, networkList: ['ERC-20', 'TRC20', 'BNB (BEP20)'] },
  { name: 'BTC', networks: 1, networkList: ['BTC (Bitcoin Network)'] },
  { name: 'TRX', networks: 1, networkList: ['TRX (TRON Network)'] },
  { name: 'Ethereum', networks: 2, networkList: ['ERC-20', 'Arbitrum'] },
  { name: 'SOL', networks: 1, networkList: ['SOL (Solana)'] },
]

export default function CryptomusModal({
  isOpen,
  onClose,
  selectedAmount,
  selectedCurrency,
  selectedNetwork,
  setSelectedCurrency,
  setSelectedNetwork,
  setModalType,
  timeLeft,
  expired
}: CryptomusModalProps) {
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false)

  const networkFee = selectedAmount * 0.09

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency)
    setSelectedNetwork('')
  }

  const handlePayment = () => {
    setModalType('paymentDetails')
  }

  const currentNetworks = currencies.find(c => c.name === selectedCurrency)?.networkList || []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full bg-white rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-gray-900 lowercase">cryptomus</span>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {networkFee.toFixed(2)} USD
                </div>
                <div className="text-sm text-gray-500">You pay network fee</div>
              </div>

              {/* Expiration Timer */}
              <div className="flex justify-between items-center mb-6 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Expiration time</span>
                <span className={`text-lg font-mono font-bold ${expired ? 'text-red-600' : 'text-green-500'}`}>
                  {expired ? 'Expired' : formatTime(timeLeft)}
                </span>
              </div>

              {/* Currency Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  disabled={expired}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose currency...</option>
                  {currencies.map((currency) => (
                    <option key={currency.name} value={currency.name}>
                      {currency.name} ({currency.networks} networks)
                    </option>
                  ))}
                </select>
              </div>

              {/* Network Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Network</label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  disabled={!selectedCurrency || expired}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose network...</option>
                  {currentNetworks.map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handlePayment}
                disabled={!selectedCurrency || !selectedNetwork || expired}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                  selectedCurrency && selectedNetwork && !expired
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
