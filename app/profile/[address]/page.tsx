"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import ProfileCard from "@/components/ProfileCard"
import { AnimatePresence, motion } from "framer-motion"
import { Toaster } from "@/components/ui/toaster"
import ShareProfileCard from "@/components/ShareProfileCard" // Import ShareProfileCard

export default function ProfilePage() {
  const params = useParams()
  const address = params.address as string
  const profileCardRef = useRef<HTMLDivElement>(null) // Ref for image capture

  const [isLoading, setIsLoading] = useState(true) // Manage loading state for the page

  // Simulate loading for the profile card, as actual data fetching is inside ProfileCard
  useEffect(() => {
    if (address) {
      // In a real app, you might have a global loading state or check individual hook loading states
      // For now, we'll just set a timeout to simulate initial load
      const timer = setTimeout(() => setIsLoading(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [address])

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/profile/${address}` : ""

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

        <AnimatePresence mode="wait">
          {address ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl"
            >
              <div ref={profileCardRef}>
                {" "}
                {/* Attach ref here */}
                <ProfileCard address={address} />
              </div>
              <div className="mt-8 flex justify-center">
                <ShareProfileCard profileCardRef={profileCardRef} profileUrl={profileUrl} address={address} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loading-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center text-slate-400 text-lg"
            >
              Loading Universal Profile...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  )
}
