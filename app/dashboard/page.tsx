'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import TickerBar from '@/components/TickerBar'
import WalletCard from '@/components/WalletCard'
import LoanGrid from '@/components/LoanGrid'
import TransactionSummary from '@/components/TransactionSummary'
import TransactionFeed from '@/components/TransactionFeed'
import CryptomusModal from '@/components/CryptomusModal'
import PaymentDetailsModal from '@/components/PaymentDetailsModal'
import Footer from '@/components/Footer'

export default function Dashboard() {
  const { connected } = useWallet()
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [modalType, setModalType] = useState<'cryptomus' | 'paymentDetails' | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [timeLeft, setTimeLeft] = useState(1800)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    // Check if wallet is connected, otherwise redirect to home
    const walletAddress = localStorage.getItem('phantom_wallet')
    if (!connected && !walletAddress) {
      router.push('/')
    }
  }, [connected, router])

  useEffect(() => {
    // Scroll to summary when amount is selected
    if (selectedAmount) {
      setTimeout(() => {
        const summaryElement = document.getElementById('transaction-summary')
        if (summaryElement) {
          summaryElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300) // Delay to allow animation
    }
  }, [selectedAmount])

  useEffect(() => {
    if (modalType && timeLeft > 0 && !expired) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setExpired(true)
    }
  }, [timeLeft, expired, modalType])

  const handleContinue = () => {
    setModalType('cryptomus')
    setTimeLeft(1800)
    setExpired(false)
    setSelectedCurrency('')
    setSelectedNetwork('')
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <TickerBar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <WalletCard />
        <LoanGrid onAmountSelect={setSelectedAmount} selectedAmount={selectedAmount} />
        {selectedAmount && (
          <div id="transaction-summary">
            <TransactionSummary selectedAmount={selectedAmount} onContinue={handleContinue} />
          </div>
        )}
        <TransactionFeed />
      </div>
      <Footer />
      <CryptomusModal
        isOpen={modalType === 'cryptomus'}
        onClose={() => setModalType(null)}
        selectedAmount={selectedAmount || 0}
        selectedCurrency={selectedCurrency}
        selectedNetwork={selectedNetwork}
        setSelectedCurrency={setSelectedCurrency}
        setSelectedNetwork={setSelectedNetwork}
        setModalType={setModalType}
        timeLeft={timeLeft}
        expired={expired}
      />
      <PaymentDetailsModal
        isOpen={modalType === 'paymentDetails'}
        onClose={() => setModalType('cryptomus')}
        selectedAmount={selectedAmount || 0}
        selectedCurrency={selectedCurrency}
        selectedNetwork={selectedNetwork}
        timeLeft={timeLeft}
        expired={expired}
        onProceed={() => {
          alert('Payment processed!')
          setModalType(null)
        }}
      />
    </main>
  )
}
