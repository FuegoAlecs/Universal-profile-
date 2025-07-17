import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AlchemyTokenBalance } from "@/types/alchemy"
import { shortenAddress } from "@/lib/utils"

interface WalletPortfolioProps {
  balances: AlchemyTokenBalance[]
}

export function WalletPortfolio({ balances }: WalletPortfolioProps) {
  if (!balances || balances.length === 0) {
    return (
      <Card className="p-4 text-center">
        <CardContent>No token balances found for this address.</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Token</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Contract</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((token) => (
              <TableRow key={token.contractAddress}>
                <TableCell className="font-medium flex items-center gap-2">
                  {token.logo && (
                    <Image
                      src={token.logo || "/placeholder.svg"}
                      alt={token.name || "Token"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  {token.name || "Unknown Token"} ({token.symbol || "N/A"})
                </TableCell>
                <TableCell>{Number.parseFloat(token.tokenBalance).toFixed(4)}</TableCell>
                <TableCell className="text-muted-foreground">{shortenAddress(token.contractAddress)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
