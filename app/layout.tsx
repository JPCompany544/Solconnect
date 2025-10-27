import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletConnectionProvider } from '@/components/WalletProvider'
import TawkToChat from '@/components/TawkToChat'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Phantom - Your trusted crypto companion',
  description: 'Empowering the future of digital finance through blockchain solutions',
  icons: '/images/main-logo.png'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletConnectionProvider>
          {children}
        </WalletConnectionProvider>
        <TawkToChat />
      </body>
    </html>
  )
}
