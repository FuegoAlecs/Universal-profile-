"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Sparkles } from "lucide-react"
import Image from "next/image"
import type { AlchemyNFT } from "@/types/alchemy" // Updated import
import { motion } from "framer-motion"

interface NFTDetailModalProps {
  nft: AlchemyNFT
  onClose: () => void
}

export default function NFTDetailModal({ nft, onClose }: NFTDetailModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 text-white p-6 rounded-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400">{nft.name || `NFT #${nft.tokenId}`}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Details for {nft.collectionName || nft.contract.name}
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4 bg-slate-700" />
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-lg overflow-hidden border border-slate-700/50 shadow-lg"
          >
            <Image
              src={nft.image || "/placeholder.svg?height=500&width=500"}
              alt={nft.name || "NFT Image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {nft.rarity && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <Sparkles className="h-4 w-4 mr-1" />
                {nft.rarity}
              </Badge>
            )}
          </motion.div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-300">Description</h4>
              <p className="text-sm text-slate-400 max-h-32 overflow-y-auto pr-2">
                {nft.description || "No description available."}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-300">Contract Details</h4>
              <p className="text-sm text-slate-400">
                **Collection:** {nft.collectionName || nft.contract.name}
                <br />
                **Token ID:** {nft.tokenId}
                <br />
                **Contract Address:**{" "}
                <a
                  href={`https://etherscan.io/address/${nft.contract.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {nft.contract.address?.slice(0, 6)}...{nft.contract.address?.slice(-4)}{" "}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <br />
                **Chain:** {nft.chain || "Ethereum"}
              </p>
            </div>
            {nft.floorPrice && (
              <div>
                <h4 className="font-semibold text-slate-300">Floor Price</h4>
                <p className="text-lg font-bold text-cyan-400">{nft.floorPrice} ETH</p>
              </div>
            )}
            {nft.attributes && nft.attributes.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Attributes</h4>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2">
                  {nft.attributes.map((attr, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                      {attr.trait_type}: {attr.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <a
                href={`https://opensea.io/assets/${nft.chain?.toLowerCase() || "ethereum"}/${nft.contract.address}/${nft.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                View on OpenSea <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
