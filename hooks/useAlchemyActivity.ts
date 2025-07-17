"use client"

import { useState, useEffect } from "react"
import type { Activity } from "@/types/alchemy"

export function useAlchemyActivity(address: string) {
  const [data, setData] = useState<Activity[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setData(null)
      return
    }

    const fetchActivity = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/alchemy/activity/${address}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const activityData: Activity[] = await response.json()
        setData(activityData)
      } catch (e: any) {
        setError(e)
        console.error("Failed to fetch activity:", e)
      } finally {
        setIsLoading(false)
      }
    }

    // Implement polling for real-time updates
    fetchActivity() // Initial fetch
    const interval = setInterval(fetchActivity, 30000) // Poll every 30 seconds

    return () => clearInterval(interval) // Cleanup on unmount
  }, [address])

  return { data, isLoading, error }
}
