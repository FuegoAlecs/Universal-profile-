"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBalance } from "@/lib/utils"
import type { TokenBalance } from "@/types/alchemy"
import Image from "next/image"
import { motion } from "framer-motion"

interface WalletPortfolioProps {
  balances: TokenBalance[]
  isLoading: boolean
}

export default function WalletPortfolio({ balances, isLoading }: WalletPortfolioProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Wallet Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!balances || balances.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Wallet Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400 py-4">No token balances found.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Wallet Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50">
                <TableHead className="text-slate-300">Asset</TableHead>
                <TableHead className="text-right text-slate-300">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.map((token, index) => (
                <TableRow key={token.contractAddress || index} className="border-slate-700/50 hover:bg-slate-700/30">
                  <TableCell className="font-medium flex items-center gap-2">
                    {token.logo && (
                      <Image
                        src={token.logo || "/placeholder.png"}
                        alt={`${token.symbol} logo`}
                        width={24}
                        height={24}
                        className="rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png" // Fallback image
                        }}
                      />
                    )}
                    {token.name || token.symbol || "Unknown Token"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatBalance(token.tokenBalance, token.decimals || 4)} {token.symbol}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}
