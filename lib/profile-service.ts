import { getAlchemy } from "./alchemy"
import { getProfileRegistryContractReadOnly } from "./contract-service"
import type { AlchemyProfile } from "@/types/alchemy"

export async function getUniversalProfile(address: string): Promise<AlchemyProfile | null> {
  const alchemy = getAlchemy()
  if (!alchemy) {
    console.error("Alchemy not initialized in profile service.")
    return null
  }

  try {
    // 1. Fetch ENS name
    const ensName = await alchemy.core.lookupAddress(address)

    // 2. Fetch profile data from your ProfileRegistry smart contract
    // This assumes your contract stores profile details like name, bio, image, social links
    const profileRegistry = getProfileRegistryContractReadOnly()
    let contractProfile = null
    if (profileRegistry) {
      try {
        const profileId = await profileRegistry.getProfileIdByAddress(address)
        if (profileId && profileId.toString() !== "0") {
          contractProfile = await profileRegistry.getProfileById(profileId)
        }
      } catch (contractError) {
        console.warn(`No profile found on contract for ${address}:`, contractError)
        // This is expected if the user hasn't created a profile yet
      }
    }

    // 3. Fetch token balances
    const tokenBalancesResponse = await alchemy.core.getTokenBalances(address)
    const tokenBalances = tokenBalancesResponse.tokenBalances
      .filter((token) => token.tokenBalance && Number.parseFloat(token.tokenBalance) > 0)
      .map((token) => ({
        contractAddress: token.contractAddress,
        tokenBalance: token.tokenBalance ? Number.parseFloat(token.tokenBalance) : 0,
        symbol: token.symbol,
        logo: token.logo,
        name: token.name,
        decimals: token.decimals,
      }))

    // Combine data
    const universalProfile: AlchemyProfile = {
      address: address,
      ensName: ensName,
      profileImageUri: contractProfile?.profileImageUri || `/placeholder-user.png`, // Fallback to placeholder
      bio: contractProfile?.bio || "A decentralized identity on the blockchain.",
      socialLinks: contractProfile?.socialLinks ? JSON.parse(contractProfile.socialLinks) : {},
      tokenBalances: tokenBalances,
    }

    return universalProfile
  } catch (error) {
    console.error(`Error fetching universal profile for ${address}:`, error)
    return null
  }
}
