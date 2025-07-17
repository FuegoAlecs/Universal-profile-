import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Nft } from "@/types/alchemy"
import { nftService } from "@/lib/alchemy" // Assuming nftService is part of alchemy.ts or a separate file

// Mock NFT data
const mockNfts: Nft[] = [
  {
    contractAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    tokenId: "1",
    name: "Cyberpunk Samurai #721",
    description: "A unique digital collectible from the Cyberpunk Samurai series.",
    imageUrl: "/placeholder.jpg",
    collectionName: "Cyberpunk Samurais",
    rarity: "Rare",
    attributes: [
      { trait_type: "Background", value: "Neon City" },
      { trait_type: "Armor", value: "Chrome Plated" },
      { trait_type: "Weapon", value: "Katana" },
    ],
  },
  {
    contractAddress: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    tokenId: "2",
    name: "Metaverse Explorer #001",
    description: "First edition explorer pass for the decentralized metaverse.",
    imageUrl: "/placeholder.jpg",
    collectionName: "Metaverse Explorers",
    rarity: "Legendary",
    attributes: [
      { trait_type: "Type", value: "Pass" },
      { trait_type: "Utility", value: "Access" },
    ],
  },
  {
    contractAddress: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    tokenId: "3",
    name: "Digital Art Piece #101",
    description: "Abstract digital art exploring themes of connectivity.",
    imageUrl: "/placeholder.jpg",
    collectionName: "Digital Canvas",
    rarity: "Common",
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Color Palette", value: "Vibrant" },
    ],
  },
  {
    contractAddress: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    tokenId: "4",
    name: "Pixel Pet #55",
    description: "Your loyal companion in the pixelated world.",
    imageUrl: "/placeholder.jpg",
    collectionName: "Pixel Pets",
    rarity: "Uncommon",
    attributes: [
      { trait_type: "Species", value: "Dragon" },
      { trait_type: "Accessory", value: "Glasses" },
    ],
  },
]

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    // In a real application, you'd call Alchemy SDK here
    // For now, we'll use a mock from lib/alchemy.ts
    const nfts = await nftService.getNfts(address)
    return NextResponse.json(nfts)
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
