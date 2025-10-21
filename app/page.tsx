import TickerBar from '@/components/TickerBar'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <TickerBar />
      <Hero />
      <Footer />
    </main>
  )
}
