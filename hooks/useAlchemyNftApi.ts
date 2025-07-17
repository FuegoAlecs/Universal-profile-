"use client"

import { useState, useEffect } from "react"
import type { Nft } from "@/types/alchemy"

export function useAlchemyNftApi(address: string) {
  const [data, setData] = useState<Nft[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setData(null)
      return
    }

    const fetchNfts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/alchemy/nfts/${address}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const nftsData: Nft[] = await response.json()
        setData(nftsData)
      } catch (e: any) {
        setError(e)
        console.error("Failed to fetch NFTs:", e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNfts()
  }, [address])

  return { data, isLoading, error }
}
