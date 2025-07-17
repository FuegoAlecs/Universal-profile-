import { type NextRequest, NextResponse } from "next/server"
import type { AlchemyActivity } from "@/types/alchemy"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  try {
    // Mock implementation - replace with actual Alchemy Activity API calls
    const mockActivities: AlchemyActivity[] = Array.from({ length: 20 }, (_, i) => ({
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNum: (18000000 + i).toString(),
      from: address,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: (Math.random() * 2).toFixed(6),
      category: ["send", "receive", "vote", "mint"][Math.floor(Math.random() * 4)] as any,
      metadata: {
        blockTimestamp: Date.now() / 1000 - i * 3600, // Hours ago
      },
    }))

    return NextResponse.json({ transfers: mockActivities })
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
