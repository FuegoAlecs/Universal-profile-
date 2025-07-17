"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Wallet } from "lucide-react"
import type { TokenBalance } from "@/types/alchemy" // Updated import
import { motion } from "framer-motion"

interface WalletPortfolioProps {
  balances: TokenBalance[]
  isLoading: boolean
}

export default function WalletPortfolio({ balances, isLoading }: WalletPortfolioProps) {
  const totalValue = balances.reduce((sum, token) => sum + token.usdValue, 0)

  if (isLoading) {
    return (
      <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-cyan-400">Wallet Portfolio</CardTitle>
          <DollarSign className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4 mb-4 bg-slate-800/50" />
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Asset</TableHead>
                <TableHead className="text-right text-slate-400">Balance</TableHead>
                <TableHead className="text-right text-slate-400">USD Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-slate-800">
                  <TableCell>
                    <Skeleton className="h-4 w-20 bg-slate-800/50" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-24 ml-auto bg-slate-800/50" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto bg-slate-800/50" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-cyan-400">Wallet Portfolio</CardTitle>
          <DollarSign className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-purple-400" /> $
            {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
          {balances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Asset</TableHead>
                  <TableHead className="text-right text-slate-400">Balance</TableHead>
                  <TableHead className="text-right text-slate-400">USD Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((token) => (
                  <TableRow key={token.contractAddress} className="border-slate-800">
                    <TableCell className="font-medium text-white">{token.symbol}</TableCell>
                    <TableCell className="text-right text-slate-300">
                      {Number.parseFloat(token.balance).toLocaleString(undefined, {
                        maximumFractionDigits: token.decimals,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-cyan-400">
                      $
                      {token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-slate-400 text-center py-4">No tokens found in this wallet.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
