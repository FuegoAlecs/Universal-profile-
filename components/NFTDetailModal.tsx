"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatAddress } from "@/lib/utils"
import type { AlchemyNFT } from "@/types/alchemy"

interface NFTDetailModalProps {
  nft: AlchemyNFT
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function NFTDetailModal({ nft, isOpen, onOpenChange }: NFTDetailModalProps) {
  if (!nft) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 text-2xl font-bold break-words">
            {nft.name || "Untitled NFT"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {nft.collectionName && `From: ${nft.collectionName}`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
            <Image
              src={nft.image || "/placeholder.png"}
              alt={nft.name || "NFT Image"}
              layout="fill"
              objectFit="contain"
              className="transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png"
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {nft.tokenType && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {nft.tokenType}
              </Badge>
            )}
            {nft.contract.address && (
              <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600/50">
                Contract: {formatAddress(nft.contract.address)}
              </Badge>
            )}
            {nft.tokenId && (
              <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600/50">
                Token ID: {nft.tokenId}
              </Badge>
            )}
          </div>
          <Separator className="my-2 bg-slate-700/50" />
          <div>
            <h4 className="font-semibold text-lg mb-2 text-cyan-300">Description</h4>
            <p className="text-slate-300 text-sm max-h-40 overflow-y-auto custom-scrollbar">
              {nft.description || "No description available for this NFT."}
            </p>
          </div>
          {/* You can add more details here, e.g., attributes, external links */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
