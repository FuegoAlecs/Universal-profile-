"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatAddress, formatTimestamp } from "@/lib/utils"
import type { AlchemyActivity } from "@/types/alchemy"
import { motion } from "framer-motion"
import { ArrowRight, DollarSign, Gem, Repeat } from "lucide-react"

interface ActivityFeedProps {
  activities: AlchemyActivity[]
  isLoading: boolean
  compact?: boolean
}

export default function ActivityFeed({ activities, isLoading, compact = false }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400 py-4">No recent activity found.</div>
        </CardContent>
      </Card>
    )
  }

  const getActivityIcon = (category: string) => {
    switch (category) {
      case "erc721":
      case "erc1155":
        return <Gem className="h-5 w-5 text-cyan-400" />
      case "erc20":
      case "external":
      case "internal":
        return <DollarSign className="h-5 w-5 text-green-400" />
      default:
        return <Repeat className="h-5 w-5 text-slate-400" />
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.hash + index}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.category)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">
                      {activity.category === "erc721" || activity.category === "erc1155"
                        ? `NFT Transfer`
                        : activity.category === "erc20"
                          ? `Token Transfer`
                          : `Transaction`}
                    </p>
                    <p className="text-xs text-slate-400">
                      From: {formatAddress(activity.from)} <ArrowRight className="inline-block h-3 w-3 mx-1" /> To:{" "}
                      {formatAddress(activity.to)}
                    </p>
                    {activity.value && activity.asset && (
                      <p className="text-xs text-slate-400">
                        Value: {activity.value} {activity.asset}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${activity.hash}`} // Link to Etherscan
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-500 hover:underline mt-1 inline-block"
                    >
                      View on Etherscan
                    </a>
                  </div>
                </div>
                {index < activities.length - 1 && <Separator className="my-4 bg-slate-700/50" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
