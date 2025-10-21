'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Transaction {
  id: string
  coin: string
  from: string
  to: string
  amount: number
  status: 'success' | 'pending'
}

export default function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    // Generate initial transactions
    const initialTxs = generateRandomTransactions(5)
    setTransactions(initialTxs)

    // Add new transaction every 1.5 seconds
    const interval = setInterval(() => {
      const newTx = generateRandomTransaction()
      setTransactions((prev) => [newTx, ...prev.slice(0, 9)]) // Keep only 10 latest
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const generateRandomTransaction = (): Transaction => {
    const addresses = [
      '7xKXtg2CW87Qx5T5JzHTq8K1qGzJ',
      '8yLYug3DW98Ry6U6KzIVq9L2hNzK',
      '9zMZvh4EX09Sz7V7L3JWq0M3oPaL',
      'AxNawh5FY10Ta8W8M4KXq1N4pQbM',
      'ByObxi6GZ21Ub9X9N5LYr2O5rRcN'
    ]
    return {
      id: Date.now().toString(),
      coin: 'SOL',
      from: addresses[Math.floor(Math.random() * addresses.length)],
      to: addresses[Math.floor(Math.random() * addresses.length)],
      amount: Math.random() * 1145 + 5, // 5 to 1150 SOL
      status: Math.random() > 0.015 ? 'success' : 'pending' // ~98.5% success
    }
  }

  const generateRandomTransactions = (count: number): Transaction[] => {
    return Array.from({ length: count }, () => generateRandomTransaction())
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-xl p-4 md:p-6 shadow-lg"
    >
      <h3 className="text-gray-900 text-lg md:text-xl font-bold mb-4 md:mb-6">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 md:px-4 text-sm font-semibold text-gray-700">Coin</th>
              <th className="text-left py-2 px-2 md:px-4 text-sm font-semibold text-gray-700">From</th>
              <th className="text-left py-2 px-2 md:px-4 text-sm font-semibold text-gray-700">To</th>
              <th className="text-left py-2 px-2 md:px-4 text-sm font-semibold text-gray-700">Amount</th>
              <th className="text-left py-2 px-2 md:px-4 text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {transactions.map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="py-3 px-2 md:px-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                      <span className="text-purple-600 font-bold text-sm">{tx.coin}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 md:px-4 text-sm text-gray-900">{shortenAddress(tx.from)}</td>
                  <td className="py-3 px-2 md:px-4 text-sm text-gray-900">{shortenAddress(tx.to)}</td>
                  <td className="py-3 px-2 md:px-4 text-sm text-gray-500">{tx.amount.toFixed(2)} SOL</td>
                  <td className="py-3 px-2 md:px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.status === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <span className={`text-xs md:text-sm font-medium ${tx.status === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
                        {tx.status === 'success' ? 'Success' : 'Pending'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
