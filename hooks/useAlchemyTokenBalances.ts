"use client"

import { useState, useEffect } from "react"
import type { TokenBalance } from "@/types/alchemy"

export function useAlchemyTokenBalances(address: string) {
  const [data, setData] = useState<TokenBalance[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setData(null)
      return
    }

    const fetchBalances = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/alchemy/balances/${address}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const balancesData: TokenBalance[] = await response.json()
        setData(balancesData)
      } catch (e: any) {
        setError(e)
        console.error("Failed to fetch token balances:", e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 60000) // Poll every 60 seconds for updates

    return () => clearInterval(interval) // Cleanup on unmount
  }, [address])

  return { data, isLoading, error }
}
