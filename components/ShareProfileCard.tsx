"use client"

import type React from "react"

import { useState } from "react"
import { toPng } from "html-to-image"
import QRCode from "qrcode.react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Download, Share2, QrCode, Twitter, Loader2, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ShareProfileCardProps {
  profileCardRef: React.RefObject<HTMLDivElement>
  profileUrl: string
  address: string
}

export default function ShareProfileCard({ profileCardRef, profileUrl, address }: ShareProfileCardProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const handleDownloadImage = async () => {
    if (profileCardRef.current) {
      try {
        const dataUrl = await toPng(profileCardRef.current, { cacheBust: true })
        const link = document.createElement("a")
        link.download = `universal-profile-${address.substring(0, 8)}.png`
        link.href = dataUrl
        link.click()
        toast({
          title: "Image Downloaded!",
          description: "Your profile card image has been downloaded.",
        })
      } catch (error) {
        console.error("Error generating image:", error)
        toast({
          title: "Download Failed",
          description: "Could not generate image. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    setIsCopied(true)
    toast({
      title: "Link Copied!",
      description: "Your profile URL has been copied to clipboard.",
    })
    setTimeout(() => setIsCopied(false), 2000) // Reset icon after 2 seconds
  }

  const handleShareOnTwitter = () => {
    const tweetText = `Check out my Universal Profile on the blockchain! #UniversalProfile #Web3 #Blockchain`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(profileUrl)}`
    window.open(twitterUrl, "_blank")
  }

  const handleMintAsNFT = async () => {
    if (!profileCardRef.current) return

    setIsUploading(true)
    setIpfsHash(null)

    try {
      const blob = await toPng(profileCardRef.current, { cacheBust: true })
      const response = await fetch(blob) // Convert data URL to Blob
      const imageBlob = await response.blob()

      const formData = new FormData()
      formData.append("file", imageBlob, `universal-profile-${address}.png`)

      const uploadResponse = await fetch("/api/pinata/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`)
      }

      const data = await uploadResponse.json()
      setIpfsHash(data.ipfsHash)
      toast({
        title: "Image Uploaded to IPFS!",
        description: `IPFS Hash: ${data.ipfsHash}`,
      })
      console.log("IPFS Hash:", data.ipfsHash)

      // Here you would typically interact with your smart contract to mint the NFT
      // For now, we'll just log the IPFS hash.
      toast({
        title: "Minting Feature (Coming Soon)",
        description: "The image is on IPFS. Next step: Smart contract interaction!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error uploading to IPFS or minting:", error)
      toast({
        title: "Minting Failed",
        description: "Could not upload image to IPFS or mint NFT. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-slate-300 hover:text-white border-slate-700 hover:border-cyan-500 transition-colors duration-300 bg-transparent"
        >
          <Share2 className="mr-2 h-4 w-4" /> Share Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Share Your Universal Profile</DialogTitle>
          <DialogDescription className="text-slate-400">
            Generate an image, get a shareable link, or mint your profile as an NFT.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="profile-url" className="sr-only">
              Profile URL
            </Label>
            <Input
              id="profile-url"
              value={profileUrl}
              readOnly
              className="flex-1 bg-slate-800/50 border-slate-700 text-slate-200"
            />
            <Button
              onClick={handleCopyToClipboard}
              size="icon"
              className="bg-slate-700 hover:bg-slate-600 text-slate-200"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy URL</span>
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleDownloadImage}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" /> Download Profile Image
            </Button>
            <Button onClick={handleShareOnTwitter} className="w-full bg-[#1DA1F2] hover:bg-[#1A91DA] text-white">
              <Twitter className="mr-2 h-4 w-4" /> Share on Twitter
            </Button>
            <Button
              onClick={handleMintAsNFT}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading to IPFS...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" /> Mint as Profile NFT (Testnet)
                </>
              )}
            </Button>
            {ipfsHash && (
              <p className="text-sm text-slate-400 text-center mt-2">
                IPFS Hash:{" "}
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline break-all"
                >
                  {ipfsHash}
                </a>
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 mt-4">
            <Label className="text-slate-300">Scan to view profile:</Label>
            <div className="p-2 bg-white rounded-lg">
              <QRCode value={profileUrl} size={128} level="H" renderAs="svg" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
