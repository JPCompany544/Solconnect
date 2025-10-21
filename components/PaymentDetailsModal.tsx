'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Copy, Check } from 'lucide-react'

interface PaymentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedAmount: number
  selectedCurrency: string
  selectedNetwork: string
  timeLeft: number
  expired: boolean
  onProceed: () => void
}

const walletAddresses: { [key: string]: { [key: string]: string } } = {
  USDT: {
    'ERC-20': '0xCeE0655b64a4f1EB70547b878dffe3Fed8050F03',
    'TRC20': 'TGEYU9Yxwo2fZL44pELU7AWwqdvatHeVzj',
    'BNB (BEP20)': '0xCeE0655b64a4f1EB70547b878dffe3Fed8050F03'
  },
  BTC: {
    'BTC (Bitcoin Network)': 'bc1qpn35wv0j0g629hzu0pa3ndfr8y6d3m0g9fdch3'
  },
  TRX: {
    'TRX (TRON Network)': 'TGEYU9Yxwo2fZL44pELU7AWwqdvatHeVzj'
  },
  Ethereum: {
    'ERC-20': '0xCeE0655b64a4f1EB70547b878dffe3Fed8050F03',
    'Arbitrum': '0xCeE0655b64a4f1EB70547b878dffe3Fed8050F03'
  },
  SOL: {
    'SOL (Solana)': '6mz6bQ88xsrpDeKLzdDhRdqqEZYYrVVTqJbKF1aYCzU3'
  }
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  selectedAmount,
  selectedCurrency,
  selectedNetwork,
  timeLeft,
  expired,
  onProceed
}: PaymentDetailsModalProps) {
  const [copied, setCopied] = useState(false)

  const networkFee = selectedAmount * 0.09
  const minimumReceived = selectedAmount - networkFee

  const walletAddress = walletAddresses[selectedCurrency]?.[selectedNetwork] || ''

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

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

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Network Fee Payment</h2>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">You'll receive</span>
                  <span className="text-gray-900 font-semibold">${selectedAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Network fee</span>
                  <span className="text-gray-900 font-semibold">${networkFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-gray-600">Minimum received</span>
                  <span className="text-blue-600 font-bold">${minimumReceived.toFixed(2)}</span>
                </div>
              </div>

              {/* Expiration Timer */}
              <div className="flex justify-between items-center mb-6 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Expiration time</span>
                <span className={`text-lg font-mono font-bold ${expired ? 'text-red-600' : 'text-green-500'}`}>
                  {expired ? 'Expired' : formatTime(timeLeft)}
                </span>
              </div>

              {/* Payment Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Address</h3>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono text-gray-800 flex-1 break-all">{walletAddress}</span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={onProceed}
                  disabled={expired}
                  className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px] ${
                    expired
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white'
                  }`}
                >
                  Proceed
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
