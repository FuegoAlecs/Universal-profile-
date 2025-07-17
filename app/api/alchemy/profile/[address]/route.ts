import { type NextRequest, NextResponse } from "next/server"
import { getAlchemy } from "@/lib/alchemy"
import { formatAddress } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const alchemy = getAlchemy()
    if (!alchemy) {
      return NextResponse.json({ error: "Alchemy not initialized" }, { status: 500 })
    }

    // Fetch ENS name
    const ensName = await alchemy.core.lookupAddress(address)

    // Fetch token balances (including native token)
    const tokenBalances = await alchemy.core.getTokenBalances(address)

    // Filter out zero balance tokens and format
    const formattedTokenBalances = tokenBalances.tokenBalances
      .filter((token) => token.tokenBalance && Number.parseFloat(token.tokenBalance) > 0)
      .map((token) => ({
        contractAddress: token.contractAddress,
        tokenBalance: token.tokenBalance ? Number.parseFloat(token.tokenBalance) : 0,
        symbol: token.symbol,
        logo: token.logo,
        name: token.name,
        decimals: token.decimals,
      }))

    // For a full profile, you might also fetch:
    // - NFTs (handled by another API route)
    // - Transaction history (handled by another API route)
    // - Social profiles (if integrated with a social graph protocol)

    const profileData = {
      address: address,
      ensName: ensName,
      profileImageUri: `/placeholder-user.png`, // Placeholder for now, could be fetched from ENS avatar or a profile registry
      bio: "A decentralized identity on the blockchain.", // Placeholder
      socialLinks: {
        // Placeholder
        twitter: `https://twitter.com/${ensName || formatAddress(address)}`,
        github: `https://github.com/${ensName || formatAddress(address)}`,
      },
      tokenBalances: formattedTokenBalances,
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error("Error fetching Alchemy profile data:", error)
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
