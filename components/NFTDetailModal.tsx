import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import type { AlchemyNFT } from "@/types/alchemy"
import { shortenAddress } from "@/lib/utils"

interface NFTDetailModalProps {
  nft: AlchemyNFT
  isOpen: boolean
  onClose: () => void
}

export function NFTDetailModal({ nft, isOpen, onClose }: NFTDetailModalProps) {
  if (!nft) return null

  const openseaLink = `https://opensea.io/assets/${nft.contract.address}/${nft.tokenId}`
  const etherscanLink = `https://sepolia.etherscan.io/token/${nft.contract.address}?a=${nft.tokenId}` // Assuming Sepolia

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <ScrollArea className="max-h-[90vh] rounded-lg">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold">{nft.name || `NFT #${nft.tokenId}`}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {nft.contract.name || "Unknown Collection"}
              </DialogDescription>
            </DialogHeader>

            <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-6">
              {nft.imageUrl ? (
                <Image
                  src={nft.imageUrl || "/placeholder.svg"}
                  alt={nft.name || `NFT ${nft.tokenId}`}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg text-center p-4">
                  No Image Available
                </div>
              )}
            </div>

            <div className="space-y-4">
              {nft.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{nft.description}</p>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Token ID:</div>
                  <div>{nft.tokenId}</div>

                  <div className="font-medium">Contract Address:</div>
                  <div className="truncate">{shortenAddress(nft.contract.address, 6)}</div>

                  <div className="font-medium">Token Type:</div>
                  <div>{nft.tokenType}</div>

                  {nft.contract.symbol && (
                    <>
                      <div className="font-medium">Symbol:</div>
                      <div>{nft.contract.symbol}</div>
                    </>
                  )}
                  {nft.timeLastUpdated && (
                    <>
                      <div className="font-medium">Last Updated:</div>
                      <div>{new Date(nft.timeLastUpdated).toLocaleDateString()}</div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Links</h3>
                <div className="flex flex-wrap gap-2">
                  {openseaLink && (
                    <Button variant="outline" asChild>
                      <a href={openseaLink} target="_blank" rel="noopener noreferrer">
                        OpenSea <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {etherscanLink && (
                    <Button variant="outline" asChild>
                      <a href={etherscanLink} target="_blank" rel="noopener noreferrer">
                        Etherscan <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {nft.tokenUri?.gateway && (
                    <Button variant="outline" asChild>
                      <a href={nft.tokenUri.gateway} target="_blank" rel="noopener noreferrer">
                        Metadata <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {nft.contract.openSeaMetadata?.externalUrl && (
                    <Button variant="outline" asChild>
                      <a href={nft.contract.openSeaMetadata.externalUrl} target="_blank" rel="noopener noreferrer">
                        Collection Site <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
