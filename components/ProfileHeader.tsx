"use client"

import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, ExternalLink, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import type { AlchemyProfile } from "@/types/alchemy"
import { motion } from "framer-motion"

interface ProfileHeaderProps {
  address: string
  profile?: AlchemyProfile
  isLoading: boolean
}

export default function ProfileHeader({ address, profile, isLoading }: ProfileHeaderProps) {
  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    toast({ title: "Address copied to neural interface" })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Dynamic gradient based on wallet activity
  const getActivityGradient = () => {
    const hash = address.slice(2, 8)
    const num = Number.parseInt(hash, 16)

    if (num % 3 === 0) return "from-blue-500 via-cyan-500 to-teal-500" // DeFi
    if (num % 3 === 1) return "from-purple-500 via-pink-500 to-rose-500" // NFTs
    return "from-green-500 via-emerald-500 to-cyan-500" // General
  }

  if (isLoading) {
    return (
      <div className="relative">
        <Skeleton className="h-48 w-full bg-slate-800/50" />
        <div className="absolute -bottom-16 left-6">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-slate-700" />
        </div>
        <div className="pt-20 pb-6 px-6">
          <Skeleton className="h-8 w-48 mb-2 bg-slate-800/50" />
          <Skeleton className="h-4 w-32 bg-slate-800/50" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic gradient cover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`h-48 bg-gradient-to-r ${getActivityGradient()} relative`}
      >
        {profile?.coverImage && (
          <Image
            src={profile.coverImage || "/placeholder.svg"}
            alt="Cover"
            fill
            className="object-cover mix-blend-overlay"
            priority
          />
        )}

        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

        {/* Neural grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </motion.div>

      {/* Avatar with glow effect */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="absolute -bottom-16 left-6"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-lg opacity-50 animate-pulse" />
          <Avatar className="h-32 w-32 border-4 border-slate-700 shadow-2xl relative z-10 bg-slate-800">
            <AvatarImage
              src={profile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
              alt="Profile"
            />
            <AvatarFallback className="text-2xl bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-900">
              {address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </motion.div>

      {/* Profile Info */}
      <div className="pt-20 pb-6 px-6">
        <div className="flex items-start justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {profile?.ens || profile?.lens || formatAddress(address)}
              </h2>

              {/* ZK-proof verified badge */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                  <Shield className="h-3 w-3 mr-1" />
                  ZK Verified
                </Badge>
              </motion.div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <code className="text-sm text-slate-300 bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700/50 font-mono">
                {formatAddress(address)}
              </code>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-8 w-8 p-0 hover:bg-cyan-500/20 text-cyan-400"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0 hover:bg-purple-500/20 text-purple-400"
                >
                  <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </motion.div>
            </div>

            {profile?.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-300 mb-4 max-w-md"
              >
                {profile.bio}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-2 flex-wrap"
            >
              {profile?.ens && (
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                  <Zap className="h-3 w-3 mr-1" />
                  ENS
                </Badge>
              )}
              {profile?.lens && (
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                  <Zap className="h-3 w-3 mr-1" />
                  Lens
                </Badge>
              )}
              {profile?.farcaster && (
                <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                  <Zap className="h-3 w-3 mr-1" />
                  Farcaster
                </Badge>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
