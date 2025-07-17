"use client"

import { useState, useEffect } from "react"
import { profileService } from "@/lib/profile-service"
import { webSocketService } from "@/lib/websocket-service"
import type { AlchemyActivity } from "@/types/alchemy"

export function useAlchemyActivity(address: string) {
  const [data, setData] = useState<AlchemyActivity[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchActivity = async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const activities = await profileService.getActivityFeed(address)
      setData(activities)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [address])

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!address) return

    const handleNewActivity = (txData: any) => {
      // Refresh activity feed when new transaction is detected
      setTimeout(fetchActivity, 2000) // Small delay to ensure transaction is indexed
    }

    const subscriptionId = webSocketService.subscribeToAddress(address, handleNewActivity)

    return () => {
      if (subscriptionId) {
        webSocketService.unsubscribe(subscriptionId.toString(), handleNewActivity)
      }
    }
  }, [address])

  return {
    data,
    error,
    isLoading,
    mutate: fetchActivity,
  }
}
