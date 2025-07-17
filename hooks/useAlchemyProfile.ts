"use client"

import { useState, useEffect } from "react"
import type { AlchemyProfile } from "@/types/alchemy"

export function useAlchemyProfile(address: string) {
  const [data, setData] = useState<AlchemyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setData(null)
      return
    }

    const fetchProfile = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/alchemy/profile/${address}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const profileData: AlchemyProfile = await response.json()
        setData(profileData)
      } catch (e: any) {
        setError(e)
        console.error("Failed to fetch profile:", e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [address])

  return { data, isLoading, error }
}
