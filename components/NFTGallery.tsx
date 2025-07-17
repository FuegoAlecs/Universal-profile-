"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Sparkles } from "lucide-react"
import type { AlchemyNFT } from "@/types/alchemy"
import { motion } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text3D, Float } from "@react-three/drei"

interface NFTGalleryProps {
  nfts: AlchemyNFT[]
  isLoading: boolean
  compact?: boolean
}

function HolographicNFT({ nft, index }: { nft: AlchemyNFT; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.3 },
      }}
      className="group"
    >
      <Card className="overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 shadow-lg hover:shadow-cyan-500/20">
        <div className="relative aspect-square overflow-hidden">
          {/* Holographic border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <Image
            src={nft.image || "/placeholder.svg?height=300&width=300"}
            alt={nft.name || "NFT"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Rarity indicator */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" />
              Rare
            </Badge>
          </div>

          {/* External link */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={`https://opensea.io/assets/ethereum/${nft.contract.address}/${nft.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800/80 p-2 rounded-full shadow-lg border border-slate-700/50"
            >
              <ExternalLink className="h-3 w-3 text-cyan-400" />
            </motion.a>
          </div>

          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <CardContent className="p-4 bg-slate-900/40 backdrop-blur-sm">
          <h4 className="font-medium text-sm truncate mb-2 text-white">{nft.name || `#${nft.tokenId}`}</h4>
          <p className="text-xs text-slate-400 truncate mb-3">{nft.contract.name}</p>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
              {nft.contract.symbol}
            </Badge>
            {nft.floorPrice && <span className="text-xs font-medium text-cyan-400">{nft.floorPrice} ETH</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function NFTGallery({ nfts, isLoading, compact = false }: NFTGalleryProps) {
  if (isLoading) {
    return (
      <div
        className={`grid gap-6 ${compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}
      >
        {Array.from({ length: compact ? 6 : 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-slate-700/50">
              <Skeleton className="aspect-square w-full bg-slate-800/50" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2 bg-slate-800/50" />
                <Skeleton className="h-3 w-2/3 bg-slate-800/50" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
              <Text3D font="/fonts/Geist_Bold.json" size={0.5} height={0.1} curveSegments={12}>
                NFT
                <meshStandardMaterial color="#06b6d4" />
              </Text3D>
            </Float>
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
        <p className="text-slate-400">No NFTs detected in the neural network</p>
      </motion.div>
    )
  }

  return (
    <div
      className={`grid gap-6 ${compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}
    >
      {nfts.map((nft, index) => (
        <HolographicNFT key={`${nft.contract.address}-${nft.tokenId}`} nft={nft} index={index} />
      ))}
    </div>
  )
}
