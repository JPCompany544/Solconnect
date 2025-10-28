'use client'

import { motion } from 'framer-motion'

interface TransactionSummaryProps {
  selectedAmount: number
  onContinue: () => void
}

export default function TransactionSummary({ selectedAmount, onContinue }: TransactionSummaryProps) {
  const slippageTolerance = 0.005 // 0.5%
  const networkFeePercent = 0.09 // 9%
  const networkFee = selectedAmount === 1000 ? 45 : selectedAmount * networkFeePercent
  const minimumReceived = selectedAmount - networkFee

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-xl p-4 md:p-6 shadow-lg mb-8 overflow-hidden"
    >
      <h3 className="text-gray-900 text-lg md:text-xl font-bold mb-4">Transaction Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm md:text-base">You'll receive:</span>
          <span className="text-gray-900 font-semibold text-sm md:text-base">${selectedAmount}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm md:text-base">Slippage tolerance:</span>
          <span className="text-gray-900 font-semibold text-sm md:text-base">0.5%</span>
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

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg mt-6 shadow-md touch-manipulation min-h-[48px] transition-all duration-200"
      >
        Continue with Loan
      </motion.button>
    </motion.div>
  )
}
