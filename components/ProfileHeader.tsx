"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import type { AlchemyProfile } from "@/types/alchemy"
import { CheckCircle2, ShieldCheck, UserPlus } from "lucide-react"
import { motion } from "framer-motion"

interface ProfileHeaderProps {
  profile: AlchemyProfile | null
  isLoading: boolean
}

export default function ProfileHeader({ profile, isLoading }: ProfileHeaderProps) {
  const displayAddress = profile?.address ? `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}` : "N/A"

  return (
    <CardContent className="relative p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg rounded-t-xl border-b border-slate-700/50 shadow-inner-lg">
      {/* Dynamic background element */}
      <motion.div
        className="absolute inset-0 z-0 opacity-20"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: "100% 100%" }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, #8B5CF6, transparent 50%), radial-gradient(circle at bottom right, #06B6D4, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Avatar className="w-28 h-28 border-4 border-purple-500/70 shadow-xl mb-4">
            <AvatarImage src={profile?.ensAvatar || "/placeholder-user.jpg"} alt="Profile Avatar" />
            <AvatarFallback className="bg-slate-700 text-slate-300 text-xl font-semibold">
              {profile?.ensName ? profile.ensName[0].toUpperCase() : displayAddress[2].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 mb-1"
        >
          {profile?.ensName || displayAddress}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-slate-400 text-sm mb-4"
        >
          {profile?.ensName ? displayAddress : "ENS Name Not Set"}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex gap-2 mb-4"
        >
          {profile?.zkVerified && (
            <Badge
              variant="secondary"
              className="bg-blue-600/30 text-blue-300 border-blue-500/50 flex items-center gap-1"
            >
              <ShieldCheck className="h-3 w-3" /> ZK Verified
            </Badge>
          )}
          {profile?.isSociallyVerified && (
            <Badge
              variant="secondary"
              className="bg-green-600/30 text-green-300 border-green-500/50 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" /> Socially Verified
            </Badge>
          )}
          {profile?.twitterHandle && (
            <Badge variant="secondary" className="bg-sky-600/30 text-sky-300 border-sky-500/50 flex items-center gap-1">
              <UserPlus className="h-3 w-3" /> Twitter
            </Badge>
          )}
        </motion.div>
      </div>
    </CardContent>
  )
}
