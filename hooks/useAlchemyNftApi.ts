"use client"

import { useState, useEffect } from "react"
import { profileService } from "@/lib/profile-service"
import type { AlchemyNFT } from "@/types/alchemy"

export function useAlchemyNftApi(address: string) {
  const [data, setData] = useState<AlchemyNFT[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNFTs = async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const nfts = await profileService.aggregateNFTs(address)
      setData(nfts)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNFTs()
  }, [address])

  return {
    data,
    error,
    isLoading,
    mutate: fetchNFTs,
  }
}
