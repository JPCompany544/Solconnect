'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedAmount: number
  onProceed: (method: string) => void
}

export default function PaymentModal({ isOpen, onClose, selectedAmount, onProceed }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const networkFeePercent = 0.09
  const networkFee = selectedAmount * networkFeePercent
  const minimumReceived = selectedAmount - networkFee

  const handleProceed = () => {
    if (selectedMethod) {
      onProceed(selectedMethod)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full bg-white rounded-xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">Network Fee Payment</h2>

              {/* Transaction Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">You'll receive:</span>
                  <span className="text-gray-900 font-semibold text-sm md:text-base">${selectedAmount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">Network fee:</span>
                  <span className="text-gray-900 font-semibold text-sm md:text-base">${networkFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-gray-600 text-sm md:text-base">Minimum received:</span>
                  <span className="text-blue-600 font-bold text-sm md:text-base">${minimumReceived.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMethod('cryptomus')}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left touch-manipulation min-h-[48px] ${
                      selectedMethod === 'cryptomus'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Cryptomus</div>
                    <div className="text-sm text-gray-600">Fast & Reliable</div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMethod('ripple')}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left touch-manipulation min-h-[48px] ${
                      selectedMethod === 'ripple'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Ripple XRP</div>
                    <div className="text-sm text-gray-600">Alternative Payment</div>
                  </motion.button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px]"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceed}
                  disabled={!selectedMethod}
                  className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px] ${
                    selectedMethod
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
