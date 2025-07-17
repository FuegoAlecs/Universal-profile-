import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
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

    const nfts = await alchemy.nft.getNftsForOwner(address, {
      pageSize: 20, // Fetch a reasonable number of NFTs
    })

    const formattedNfts = nfts.ownedNfts.map((nft) => ({
      contract: {
        address: nft.contract.address,
      },
      tokenId: nft.tokenId,
      tokenType: nft.tokenType,
      name: nft.raw.metadata?.name || nft.title,
      description: nft.raw.metadata?.description || "",
      image: nft.raw.metadata?.image || nft.media[0]?.gateway || "/placeholder.png", // Use gateway URL if available
      collectionName: nft.contract.name || "Unknown Collection",
      // Add more fields as needed from Alchemy's NFT object
    }))

    return NextResponse.json(formattedNfts)
  } catch (error) {
    console.error("Error fetching Alchemy NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
