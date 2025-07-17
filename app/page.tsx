"use client"

import { useState, useEffect } from "react"
import ProfileCard from "@/components/ProfileCard"
import ConnectWallet from "@/components/ConnectWallet"
import { AnimatePresence, motion } from "framer-motion"
// Removed direct imports for hooks here as ProfileCard now handles them
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // isLoading is now managed within ProfileCard and its sub-components
  // const isLoading = isProfileLoading || isNftsLoading || isActivityLoading

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)
          } else {
            setAddress(null)
            setIsConnected(false)
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
          setAddress(null)
          setIsConnected(false)
        }
      }
    }

    checkWalletConnection()

    // Listen for account changes
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
        } else {
          setAddress(null)
          setIsConnected(false)
        }
      }
      ;(window as any).ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        ;(window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white font-sans relative overflow-hidden">
      {/* Background grid and particles */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(100,200,255,0.1)_0%,transparent_70%)] animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-8 text-center drop-shadow-lg"
        >
          Universal Profile Card
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-12"
        >
          {/* ConnectWallet component handles its own connection logic */}
          <ConnectWallet
            setAddress={setAddress}
            setIsConnected={setIsConnected}
            isConnected={isConnected}
            address={address}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {isConnected && address ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl"
            >
              <ProfileCard address={address} /> {/* Removed redundant props */}
            </motion.div>
          ) : (
            <motion.div
              key="connect-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-center text-slate-400 text-lg"
            >
              Connect your wallet to view your Universal Profile.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  )
}
