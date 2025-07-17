"use client"

import { useState, useEffect, useCallback } from "react"
import type { AlchemyTokenBalance } from "@/types/alchemy"

export function useAlchemyTokenBalances(address: string | undefined) {
  const [balances, setBalances] = useState<AlchemyTokenBalance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setBalances([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/alchemy/balances/${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: { balances: AlchemyTokenBalance[] } = await response.json()
      setBalances(data.balances)
    } catch (e: any) {
      setError(e.message || "Failed to fetch token balances")
      console.error("Error fetching Alchemy token balances:", e)
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return { balances, loading, error, refetch: fetchBalances }
}
