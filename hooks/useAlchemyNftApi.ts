"use client"

import { useState, useEffect } from "react"
import type { AlchemyNFT } from "@/types/alchemy"

export function useAlchemyNftApi(address: string) {
  const [data, setData] = useState<AlchemyNFT[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setData(null)
      setIsLoading(false)
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
        const nftsData: AlchemyNFT[] = await response.json()
        setData(nftsData)
      } catch (e) {
        setError(e as Error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNfts()
  }, [address])

  return { data, isLoading, error }
}
