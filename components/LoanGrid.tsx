'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface LoanGridProps {
  onAmountSelect: (amount: number | null) => void
  selectedAmount: number | null
}

const loanAmounts = [
  { amount: 500, bonus: '+0%' },
  { amount: 1000, bonus: '+0%' },
  { amount: 2500, bonus: '+5%' },
  { amount: 5000, bonus: '+5%' },
  { amount: 10000, bonus: '+10%' },
]

export default function LoanGrid({ onAmountSelect, selectedAmount }: LoanGridProps) {
  const [customAmount, setCustomAmount] = useState('')

  const handleSelect = (amount: number) => {
    if (selectedAmount === amount) {
      onAmountSelect(null) // Deselect if already selected
    } else {
      onAmountSelect(amount)
    }
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Only allow numbers
    setCustomAmount(value)
  }

  const handleCustomAmountSubmit = () => {
    const amount = parseInt(customAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount.')
      return
    }
    onAmountSelect(amount)
    setCustomAmount('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8"
    >
      <h3 className="text-white text-lg md:text-xl font-bold mb-6">Receive</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loanAmounts.map((loan, index) => (
          <motion.div
            key={loan.amount}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`bg-white rounded-lg p-4 md:p-6 shadow-lg cursor-pointer transition-all duration-300 min-h-[120px] touch-manipulation ${
              selectedAmount === loan.amount
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white shadow-xl scale-105'
                : 'hover:shadow-xl hover:scale-105'
            }`}
            onClick={() => handleSelect(loan.amount)}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-2xl md:text-3xl font-bold ${selectedAmount === loan.amount ? 'text-white' : 'text-gray-900'}`}>
                ${typeof loan.amount === 'string' ? loan.amount : loan.amount.toLocaleString()}
              </span>
              {loan.bonus !== '+0%' && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {loan.bonus}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm md:text-base ${selectedAmount === loan.amount ? 'text-white/80' : 'text-indigo-600'} hover:underline`}>
                Select
              </span>
              {selectedAmount === loan.amount && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 bg-white rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-[#4F46E5] rounded-full"></div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Amount Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-6"
      >
        <h4 className="text-white text-md md:text-lg font-semibold mb-4">Or input a custom amount</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter amount"
            value={customAmount}
            onChange={handleCustomAmountChange}
            className="flex-1 bg-white rounded-lg p-4 shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-semibold"
          />
          <button
            onClick={handleCustomAmountSubmit}
            className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:from-[#3730A3] hover:to-[#4F46E5] transition-all duration-300 touch-manipulation"
          >
            Select
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
