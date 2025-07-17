"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpRight, ArrowDownLeft, Vote, Zap, Repeat, Coins } from "lucide-react"
import type { AlchemyActivity } from "@/types/alchemy"
import { motion } from "framer-motion"

interface ActivityFeedProps {
  activities: AlchemyActivity[]
  isLoading: boolean
  compact?: boolean
}

export default function ActivityFeed({ activities, isLoading, compact = false }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "send":
      case "external": // Alchemy uses 'external' for native token transfers
        return <ArrowUpRight className="h-4 w-4 text-red-400" />
      case "receive":
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />
      case "vote":
        return <Vote className="h-4 w-4 text-blue-400" />
      case "mint":
        return <Coins className="h-4 w-4 text-yellow-400" />
      default:
        return <Repeat className="h-4 w-4 text-purple-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "send":
      case "external":
        return "border-red-500/30 bg-red-500/10"
      case "receive":
        return "border-green-500/30 bg-green-500/10"
      case "vote":
        return "border-blue-500/30 bg-blue-500/10"
      case "mint":
        return "border-yellow-500/30 bg-yellow-500/10"
      default:
        return "border-purple-500/30 bg-purple-500/10"
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp * 1000
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: compact ? 5 : 10 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-800/50" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2 bg-slate-800/50" />
                    <Skeleton className="h-3 w-2/3 bg-slate-800/50" />
                  </div>
                  <Skeleton className="h-6 w-16 bg-slate-800/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <Zap className="h-12 w-12 mx-auto mb-4 text-slate-600" />
        <p className="text-slate-400">No neural activity detected</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.slice(0, compact ? 5 : undefined).map((activity, index) => (
        <motion.div
          key={activity.hash}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, x: 4 }}
        >
          <Card
            className={`bg-slate-900/40 backdrop-blur-xl border transition-all duration-300 hover:shadow-lg ${getActivityColor(activity.category)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex-shrink-0 p-2 rounded-full bg-slate-800/50 backdrop-blur-sm"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {getActivityIcon(activity.category)}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm capitalize text-white">{activity.category}</span>
                    {activity.value && (
                      <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {activity.value}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span className="font-mono">Block {activity.blockNum}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(activity.timestamp)}</span> {/* Use timestamp directly */}
                  </div>

                  {activity.to && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">To:</span>
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${activity.to}`} />
                        <AvatarFallback className="text-xs bg-slate-700">
                          {activity.to.slice(2, 4).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <code className="text-xs text-slate-400 font-mono">
                        {activity.to.slice(0, 6)}...{activity.to.slice(-4)}
                      </code>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={`https://etherscan.io/tx/${activity.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    View →
                  </motion.a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
