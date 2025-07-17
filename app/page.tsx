"use client"

import { useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import ConnectWallet from "@/components/ConnectWallet"
import ProfileCard from "@/components/ProfileCard"
import { motion } from "framer-motion"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected && address) {
      router.push(`/profile/${address}`)
    }
  }, [isConnected, address, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white font-sans relative overflow-hidden">
      {/* Background grid and particles */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(100,200,255,0.1)_0%,transparent_70%)] animate-pulse-slow" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        {isConnected && address ? (
          <ProfileCard address={address} />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-12"
          >
            <ConnectWallet />
          </motion.div>
        )}
      </main>
      <Toaster />
    </div>
  )
}
