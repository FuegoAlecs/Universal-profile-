import { Alchemy, Network } from "alchemy-sdk"
import type { AlchemyNFT, AlchemyTokenBalance, AlchemyActivity, AlchemyProfile } from "@/types/alchemy"
import { ethers } from "ethers" // Import ethers

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA, // Or Network.ETH_MAINNET, etc.
}

const alchemy = new Alchemy(config)

export async function getAlchemyNFTs(address: string): Promise<AlchemyNFT[]> {
  try {
    const nfts = await alchemy.nft.getNftsForOwner(address)
    return nfts.ownedNfts.map((nft) => ({
      contract: {
        address: nft.contract.address,
        name: nft.contract.name,
        symbol: nft.contract.symbol,
        tokenType: nft.contract.tokenType,
        openSeaMetadata: {
          collectionName: nft.contract.openSea?.collectionName,
          imageUrl: nft.contract.openSea?.imageUrl,
          description: nft.contract.openSea?.description,
          externalUrl: nft.contract.openSea?.externalUrl,
        },
      },
      tokenId: nft.tokenId,
      tokenType: nft.tokenType,
      name: nft.rawMetadata?.name || nft.title,
      description: nft.rawMetadata?.description || nft.description,
      imageUrl: nft.media?.[0]?.gateway || nft.rawMetadata?.image,
      raw: {
        tokenUri: nft.tokenUri?.raw,
        metadata: nft.rawMetadata,
      },
      tokenUri: {
        gateway: nft.tokenUri?.gateway,
        raw: nft.tokenUri?.raw,
      },
      media: nft.media?.map((m) => ({
        gateway: m.gateway,
        raw: m.raw,
        thumbnail: m.thumbnail,
        format: m.format,
      })),
      spamInfo: nft.spamInfo,
      timeLastUpdated: nft.timeLastUpdated,
    }))
  } catch (error) {
    console.error("Error fetching NFTs from Alchemy:", error)
    return []
  }
}

export async function getAlchemyTokenBalances(address: string): Promise<AlchemyTokenBalance[]> {
  try {
    const balances = await alchemy.core.getTokenBalances(address)
    const tokenDataPromises = balances.tokenBalances.map(async (token) => {
      try {
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress)
        return {
          contractAddress: token.contractAddress,
          tokenBalance: ethers.formatUnits(token.tokenBalance || "0", metadata.decimals || 18),
          symbol: metadata.symbol,
          name: metadata.name,
          logo: metadata.logo,
          decimals: metadata.decimals,
        }
      } catch (metaError) {
        console.warn(`Could not fetch metadata for token ${token.contractAddress}:`, metaError)
        return {
          contractAddress: token.contractAddress,
          tokenBalance: ethers.formatUnits(token.tokenBalance || "0", 18), // Default to 18 decimals if metadata fails
          error: `Failed to fetch metadata: ${metaError instanceof Error ? metaError.message : String(metaError)}`,
        }
      }
    })
    return Promise.all(tokenDataPromises)
  } catch (error) {
    console.error("Error fetching token balances from Alchemy:", error)
    return []
  }
}

export async function getAlchemyActivity(address: string): Promise<AlchemyActivity[]> {
  try {
    const activity = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      fromAddress: address,
      category: ["erc721", "erc1155", "erc20", "external", "internal"],
      withMetadata: true,
      excludeZeroValue: false,
      maxCount: 100,
    })

    const receivedActivity = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toAddress: address,
      category: ["erc721", "erc1155", "erc20", "external", "internal"],
      withMetadata: true,
      excludeZeroValue: false,
      maxCount: 100,
    })

    const combinedActivity = [...activity.transfers, ...receivedActivity.transfers]

    // Sort by block number in descending order
    combinedActivity.sort((a, b) => Number.parseInt(b.blockNum, 16) - Number.parseInt(a.blockNum, 16))

    return combinedActivity.map((tx) => ({
      blockNum: tx.blockNum,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      erc721TokenId: tx.erc721TokenId,
      erc1155Metadata: tx.erc1155Metadata,
      asset: tx.asset,
      category: tx.category,
      rawContract: {
        value: tx.rawContract.value,
        address: tx.rawContract.address,
        decimal: tx.rawContract.decimal,
      },
    }))
  } catch (error) {
    console.error("Error fetching activity from Alchemy:", error)
    return []
  }
}

export async function getAlchemyProfile(address: string): Promise<AlchemyProfile> {
  try {
    const ensName = await alchemy.core.lookupAddress(address)
    const ensAvatar = ensName ? await alchemy.core.getEnsAvatar(ensName) : null

    return {
      address,
      ensName,
      ensAvatar,
    }
  } catch (error) {
    console.error("Error fetching ENS profile from Alchemy:", error)
    return {
      address,
      ensName: null,
      ensAvatar: null,
    }
  }
}
