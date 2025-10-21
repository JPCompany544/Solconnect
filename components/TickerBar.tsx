'use client'

import { useState, useEffect } from 'react'

interface CryptoData {
  symbol: string
  price: string
  change: string
}

const initialCryptoData: CryptoData[] = [
  { symbol: 'SOL', price: '$193.11', change: '+3.91%' },
  { symbol: 'ADA', price: '$0.67', change: '+6.05%' },
  { symbol: 'BNB', price: '$1125.31', change: '+4.73%' },
  { symbol: 'ETH', price: '$2450.50', change: '+2.15%' },
]

function CountdownTimer() {
  const [secondsLeft, setSecondsLeft] = useState(23 * 3600) // 23 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 23 * 3600 // Reset to 23 hours
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
      <div className="bg-[#00FFB2] text-black px-2 py-1 md:px-3 md:py-2 rounded-xl shadow-lg flex flex-col items-center min-w-[80px] md:min-w-[100px]">
        <span className="text-xs font-semibold">End in</span>
        <span className="text-sm md:text-base font-bold leading-tight">{hours} hour</span>
        <span className="text-sm md:text-base font-bold leading-tight">{minutes} min</span>
        <span className="text-sm md:text-base font-bold leading-tight">{seconds} sec</span>
      </div>
    </div>
  )
}

export default function TickerBar() {
  const [cryptoData, setCryptoData] = useState(initialCryptoData)

  // Update prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData((prev) =>
        prev.map((crypto) => {
          const priceNum = parseFloat(crypto.price.replace('$', ''))
          const changePercent = (Math.random() - 0.5) * 10 // Random change between -5% to +5%
          const newPrice = priceNum * (1 + changePercent / 100)
          const newChange = (changePercent > 0 ? '+' : '') + changePercent.toFixed(2) + '%'
          return {
            ...crypto,
            price: `$${newPrice.toFixed(2)}`,
            change: newChange,
          }
        })
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center overflow-hidden flex-1 min-w-0">
            <span className="text-white/70 text-sm font-medium mr-2 whitespace-nowrap">Live Prices</span>
            <div className="flex space-x-4 md:space-x-8 animate-scroll">
              {[...cryptoData, ...cryptoData].map((crypto, index) => (
                <div
                  key={`${crypto.symbol}-${index}`}
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <span className="text-white font-semibold">{crypto.symbol}</span>
                  <span className="text-white/80">{crypto.price}</span>
                  <span className={`text-sm ${crypto.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CountdownTimer />
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  )
}
