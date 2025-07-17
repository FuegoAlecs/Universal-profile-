"use client"

import { useState, useEffect, useCallback } from "react"
import type { AlchemyNFT } from "@/types/alchemy"

export function useAlchemyNftApi(address: string | undefined) {
  const [nfts, setNfts] = useState<AlchemyNFT[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNfts = useCallback(async () => {
    if (!address) {
      setNfts([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/alchemy/nfts/${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: { nfts: AlchemyNFT[] } = await response.json()
      setNfts(data.nfts)
    } catch (e: any) {
      setError(e.message || "Failed to fetch NFTs")
      console.error("Error fetching Alchemy NFTs:", e)
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchNfts()
  }, [fetchNfts])

  return { nfts, loading, error, refetch: fetchNfts }
}
