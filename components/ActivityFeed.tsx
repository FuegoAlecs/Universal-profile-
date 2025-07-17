import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AlchemyActivity } from "@/types/alchemy"
import { shortenAddress } from "@/lib/utils"

interface ActivityFeedProps {
  activity: AlchemyActivity[]
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  if (!activity || activity.length === 0) {
    return (
      <Card className="p-4 text-center">
        <CardContent>No recent activity found for this address.</CardContent>
      </Card>
    )
  }

  const formatValue = (value: number | null, asset: string | null) => {
    if (value === null) return "N/A"
    return `${value.toFixed(4)} ${asset || "ETH"}`
  }

  const formatCategory = (category: string) => {
    switch (category) {
      case "erc721":
        return "NFT Transfer"
      case "erc1155":
        return "ERC-1155 Transfer"
      case "erc20":
        return "Token Transfer"
      case "external":
        return "External Transaction"
      case "internal":
        return "Internal Transaction"
      default:
        return category
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activity.map((tx) => (
              <TableRow key={tx.hash}>
                <TableCell className="font-medium">{formatCategory(tx.category)}</TableCell>
                <TableCell>{shortenAddress(tx.from)}</TableCell>
                <TableCell>{tx.to ? shortenAddress(tx.to) : "N/A"}</TableCell>
                <TableCell>{formatValue(tx.value, tx.asset)}</TableCell>
                <TableCell className="text-muted-foreground">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${tx.hash}`} // Assuming Sepolia
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {shortenAddress(tx.hash)}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
