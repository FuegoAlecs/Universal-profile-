import { type NextRequest, NextResponse } from "next/server"
import { getAlchemy } from "@/lib/alchemy"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const alchemy = getAlchemy()
    if (!alchemy) {
      return NextResponse.json({ error: "Alchemy not initialized" }, { status: 500 })
    }

    // Fetch recent asset transfers (activity)
    const transfers = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0", // From the beginning of time
      toAddress: address,
      excludeZeroValue: true,
      category: ["erc721", "erc1155", "erc20", "external", "internal"],
      maxCount: 20, // Limit to 20 recent activities
    })

    const formattedActivity = transfers.transfers.map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      asset: tx.asset,
      category: tx.category,
      blockNum: tx.blockNum,
      timestamp: Number.parseInt(tx.blockNum, 16), // Placeholder, ideally fetch block timestamp
      // You might need to fetch block details separately for accurate timestamps
    }))

    return NextResponse.json(formattedActivity)
  } catch (error) {
    console.error("Error fetching Alchemy activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity data" }, { status: 500 })
  }
}
