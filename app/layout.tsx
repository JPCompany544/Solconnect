import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletConnectionProvider } from '@/components/WalletProvider'
import TawkToChat from '@/components/TawkToChat'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Phantom - Your trusted crypto companion',
  description: 'Empowering the future of digital finance through blockchain solutions',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  icons: '/images/main-logo.png'
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
