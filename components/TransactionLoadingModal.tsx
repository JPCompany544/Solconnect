'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

interface TransactionLoadingModalProps {
    isOpen: boolean
}

export default function TransactionLoadingModal({ isOpen }: TransactionLoadingModalProps) {
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">⏳ Processing Transaction...</h3>
                        <p className="text-gray-600">Please wait while we confirm your loan.</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
