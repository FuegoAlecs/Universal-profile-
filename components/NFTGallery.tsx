"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import NFTDetailModal from "./NFTDetailModal"
import type { AlchemyNFT } from "@/types/alchemy"
import { motion } from "framer-motion"

interface NFTGalleryProps {
  nfts: AlchemyNFT[]
  isLoading: boolean
  compact?: boolean
}

export default function NFTGallery({ nfts, isLoading, compact = false }: NFTGalleryProps) {
  const [selectedNft, setSelectedNft] = useState<AlchemyNFT | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleNftClick = (nft: AlchemyNFT) => {
    setSelectedNft(nft)
    setIsModalOpen(true)
  }

  const gridClasses = compact
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4"
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"

  const itemClasses = compact ? "h-32 w-32 sm:h-40 sm:w-40" : "h-48 w-48 sm:h-56 sm:w-56"

  if (isLoading) {
    return (
      <div className={`grid ${gridClasses}`}>
        {Array.from({ length: compact ? 6 : 12 }).map((_, i) => (
          <Skeleton key={i} className={`rounded-lg ${itemClasses}`} />
        ))}
      </div>
    )
  }

  if (!nfts || nfts.length === 0) {
    return <div className="text-center text-slate-400 py-8">No NFTs found for this address.</div>
  }

  return (
    <>
      <div className={`grid ${gridClasses}`}>
        {nfts.map((nft, index) => (
          <motion.div
            key={nft.contract.address + nft.tokenId + index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex justify-center"
          >
            <Card
              className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer group bg-slate-800/50 border-slate-700/50 hover:border-cyan-500 transition-all duration-300 ${itemClasses}`}
              onClick={() => handleNftClick(nft)}
            >
              <CardContent className="p-0 flex items-center justify-center h-full w-full">
                <Image
                  src={nft.image || "/placeholder.png"}
                  alt={nft.name || "NFT Image"}
                  width={compact ? 160 : 224}
                  height={compact ? 160 : 224}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-sm font-semibold truncate w-full">{nft.name || "Untitled NFT"}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedNft && <NFTDetailModal nft={selectedNft} isOpen={isModalOpen} onOpenChange={setIsModalOpen} />}
    </>
  )
}
