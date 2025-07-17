"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Download, Copy, Twitter } from "lucide-react"
import { toPng } from "html-to-image"
import QRCode from "qrcode.react"
import { useToast } from "@/components/ui/use-toast"
import { mintProfileNFT } from "@/lib/contract-service"
import { useAccount } from "wagmi"

interface ShareProfileCardProps {
  profileCardRef: React.RefObject<HTMLDivElement>
  address: string
}

export function ShareProfileCard({ profileCardRef, address }: ShareProfileCardProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
  const { toast } = useToast()
  const { address: connectedAddress } = useAccount()

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/profile/${address}` : ""

  const handleDownloadImage = async () => {
    if (profileCardRef.current) {
      try {
        const dataUrl = await toPng(profileCardRef.current, { cacheBust: true })
        const link = document.createElement("a")
        link.download = `profile-card-${address}.png`
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
          description: "Could not download profile card image.",
          variant: "destructive",
        })
      }
    }
  }

  const handleShareOnTwitter = () => {
    const tweetText = encodeURIComponent(`Check out my Universal Profile on the blockchain! ${profileUrl}`)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank")
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: "Copied to Clipboard!",
      description: "Profile URL copied to your clipboard.",
    })
  }

  const handleUploadToPinata = async () => {
    if (!profileCardRef.current) {
      toast({
        title: "Upload Failed",
        description: "Profile card not found for upload.",
        variant: "destructive",
      })
      return
    }

    try {
      const dataUrl = await toPng(profileCardRef.current, { cacheBust: true })
      const blob = await (await fetch(dataUrl)).blob()

      const formData = new FormData()
      formData.append("file", blob, `profile-card-${address}.png`)

      toast({
        title: "Uploading to IPFS...",
        description: "Please wait, this may take a moment.",
      })

      const response = await fetch("/api/pinata/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload to Pinata")
      }

      const result = await response.json()
      setIpfsHash(result.IpfsHash)
      toast({
        title: "Uploaded to IPFS!",
        description: `IPFS Hash: ${result.IpfsHash}`,
      })
    } catch (error: any) {
      console.error("Error uploading to Pinata:", error)
      toast({
        title: "Upload Failed",
        description: `Could not upload to IPFS: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleMintProfileNFT = async () => {
    if (!connectedAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint an NFT.",
        variant: "destructive",
      })
      return
    }

    if (!ipfsHash) {
      toast({
        title: "Image Not Uploaded",
        description: "Please upload your profile card image to IPFS first.",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    try {
      // For a real NFT, you'd create a metadata JSON and upload it to IPFS,
      // then use that metadata URI here. For simplicity, we'll use the image IPFS hash directly.
      // A proper metadata URI would look like: `ipfs://${metadataIpfsHash}`
      const tokenURI = `ipfs://${ipfsHash}`

      toast({
        title: "Minting Profile NFT...",
        description: "Confirm the transaction in your wallet.",
      })

      const tx = await mintProfileNFT(connectedAddress, tokenURI)
      console.log("Minting transaction:", tx)

      toast({
        title: "Profile NFT Minted!",
        description: `Transaction Hash: ${tx.hash}`,
      })
    } catch (error: any) {
      console.error("Error minting NFT:", error)
      toast({
        title: "Minting Failed",
        description: `Could not mint profile NFT: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2">
        <Share2 className="h-4 w-4" /> Share Profile
      </Button>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Your Profile</DialogTitle>
            <DialogDescription>Share your unique decentralized profile with others.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile-url" className="text-right">
                URL
              </Label>
              <Input id="profile-url" value={profileUrl} readOnly className="col-span-3" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyToClipboard}
                className="col-start-5 bg-transparent"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center p-4">
              <QRCode value={profileUrl} size={256} level="H" />
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleDownloadImage} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Download Profile Card
              </Button>
              <Button onClick={handleUploadToPinata} className="flex items-center gap-2" disabled={!!ipfsHash}>
                <Share2 className="h-4 w-4" /> {ipfsHash ? "Uploaded to IPFS" : "Upload to IPFS"}
              </Button>
              {ipfsHash && (
                <Button onClick={handleMintProfileNFT} className="flex items-center gap-2" disabled={isMinting}>
                  {isMinting ? "Minting..." : "Mint as Profile NFT"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleShareOnTwitter}
                className="flex items-center gap-2 bg-transparent"
              >
                <Twitter className="h-4 w-4" /> Share on Twitter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
