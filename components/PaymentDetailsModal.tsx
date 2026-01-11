'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Copy, Check, Upload, Loader2 } from 'lucide-react'

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
  const [proofInput, setProofInput] = useState('')
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const networkFee = 40 // Temporarily changed from selectedAmount * 0.09
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

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      setProofImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      alert('Please upload a valid image file (.png, .jpg, .jpeg)')
    }
  }

  // Handle proceed with loading and success
  const handleProceedWithProof = async () => {
    if (!proofInput && !proofImage) return

    setIsProcessing(true)

    // Simulate processing for 7 seconds
    setTimeout(() => {
      setIsProcessing(false)
      setShowSuccess(true)
    }, 7000)
  }

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccess(false)
    setProofInput('')
    setProofImage(null)
    setImagePreview(null)
    onProceed()
  }

  // Check if proceed button should be enabled
  const canProceed = !expired && (proofInput.trim() !== '' || proofImage !== null)

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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProofInput('')
      setProofImage(null)
      setImagePreview(null)
      setIsProcessing(false)
      setShowSuccess(false)
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
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto pointer-events-auto"
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

                {/* Proof of Payment Section */}
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Proof of Payment</h3>
                  <p className="text-sm text-gray-600 mb-4">Transaction Hash or Screenshot</p>

                  {/* Transaction Hash Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Hash (Optional)
                    </label>
                    <input
                      type="text"
                      value={proofInput}
                      onChange={(e) => setProofInput(e.target.value)}
                      placeholder="Paste transaction hash here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-3 text-sm text-gray-500 font-medium">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Screenshot (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label
                        htmlFor="proof-upload"
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-all"
                      >
                        <Upload className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          {proofImage ? proofImage.name : 'Click to upload (.png, .jpg, .jpeg)'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-2 bg-white rounded-lg border border-gray-200"
                    >
                      <p className="text-xs text-gray-600 mb-2">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Proof preview"
                        className="w-full h-auto max-h-48 object-contain rounded"
                      />
                      <button
                        onClick={() => {
                          setProofImage(null)
                          setImagePreview(null)
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove image
                      </button>
                    </motion.div>
                  )}
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
                    onClick={handleProceedWithProof}
                    disabled={!canProceed}
                    className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px] ${!canProceed
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white'
                      }`}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Processing Loading Modal */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
                >
                  <div className="flex justify-center mb-4">
                    <Loader2 className="w-16 h-16 text-violet-600 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">⏳ Processing Payment...</h3>
                  <p className="text-gray-600">Please wait.</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Modal */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-600 mb-6">Your loan is being processed.</p>
                  <button
                    onClick={handleSuccessClose}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
