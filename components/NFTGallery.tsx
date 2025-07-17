"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { AlchemyNFT } from "@/types/alchemy"
import { NFTDetailModal } from "./NFTDetailModal"

interface NFTGalleryProps {
  nfts: AlchemyNFT[]
}

export function NFTGallery({ nfts }: NFTGalleryProps) {
  const [selectedNft, setSelectedNft] = useState<AlchemyNFT | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleNftClick = (nft: AlchemyNFT) => {
    setSelectedNft(nft)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedNft(null)
  }

  if (!nfts || nfts.length === 0) {
    return (
      <Card className="p-4 text-center">
        <CardContent>No NFTs found for this address.</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {nfts.map((nft) => (
        <Card
          key={`${nft.contract.address}-${nft.tokenId}`}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleNftClick(nft)}
        >
          <CardContent className="p-2">
            <div className="relative w-full aspect-square rounded-md overflow-hidden mb-2">
              {nft.imageUrl ? (
                <Image
                  src={nft.imageUrl || "/placeholder.svg"}
                  alt={nft.name || `NFT ${nft.tokenId}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center p-2">
                  No Image
                </div>
              )}
            </div>
            <p className="text-sm font-semibold truncate">{nft.name || `NFT #${nft.tokenId}`}</p>
            <p className="text-xs text-muted-foreground truncate">{nft.contract.name || "Unknown Collection"}</p>
          </CardContent>
        </Card>
      ))}

      {selectedNft && <NFTDetailModal nft={selectedNft} isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>
  )
}
