"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatAddress } from "@/lib/utils"
import type { AlchemyProfile } from "@/types/alchemy"
import { motion } from "framer-motion"

interface ProfileHeaderProps {
  profile: AlchemyProfile | null
  isLoading: boolean
}

export default function ProfileHeader({ profile, isLoading }: ProfileHeaderProps) {
  if (isLoading) {
    return (
      <CardContent className="relative p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(/placeholder.png)` }}
        />
        <div className="relative z-10 flex flex-col items-center text-center">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </CardContent>
    )
  }

  const displayAddress = profile?.ensName || formatAddress(profile?.address)

  return (
    <CardContent className="relative p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-xl overflow-hidden">
      {/* Background image or pattern */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(/placeholder.png)` }}
      />
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Avatar className="h-24 w-24 border-4 border-slate-700 shadow-lg mb-4">
            <AvatarImage
              src={profile?.profileImageUri || "/placeholder-user.png"}
              alt={profile?.ensName || "Profile Image"}
            />
            <AvatarFallback className="bg-slate-700 text-slate-300 text-xl font-bold">
              {profile?.ensName ? profile.ensName.charAt(0).toUpperCase() : profile?.address?.charAt(2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {profile?.ensName || "Unnamed Profile"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-slate-300 mb-1"
        >
          {displayAddress}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-sm text-slate-400 max-w-md"
        >
          {profile?.bio || "A decentralized identity on the blockchain."}
        </motion.p>
      </div>
    </CardContent>
  )
}
