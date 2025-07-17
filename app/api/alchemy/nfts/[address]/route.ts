import { type NextRequest, NextResponse } from "next/server"
import { getAlchemyNFTs } from "@/lib/alchemy"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const nfts = await getAlchemyNFTs(address)
    return NextResponse.json({ nfts })
  } catch (error) {
    console.error("Error in Alchemy NFTs API:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
