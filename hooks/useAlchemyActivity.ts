"use client"

import { useState, useEffect } from "react"
import type { AlchemyActivity } from "@/types/alchemy"

export function useAlchemyActivity(address: string) {
  const [data, setData] = useState<AlchemyActivity[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setData(null)
      setIsLoading(false)
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
        const activityData: AlchemyActivity[] = await response.json()
        setData(activityData)
      } catch (e) {
        setError(e as Error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [address])

  return { data, isLoading, error }
}
