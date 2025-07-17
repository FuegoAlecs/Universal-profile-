import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { nftService } from "@/lib/alchemy"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const nfts = await nftService.getNfts(address)
    return NextResponse.json(nfts)
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
