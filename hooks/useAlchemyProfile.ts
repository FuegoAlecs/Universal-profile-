"use client"

import { useState, useEffect, useCallback } from "react"
import type { AlchemyProfile } from "@/types/alchemy"

export function useAlchemyProfile(address: string | undefined) {
  const [profile, setProfile] = useState<AlchemyProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!address) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/alchemy/profile/${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: { profile: AlchemyProfile } = await response.json()
      setProfile(data.profile)
    } catch (e: any) {
      setError(e.message || "Failed to fetch profile")
      console.error("Error fetching Alchemy profile:", e)
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}
