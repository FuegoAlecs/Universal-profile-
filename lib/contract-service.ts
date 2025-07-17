import { ethers } from "ethers"
import ProfileRegistryABI from "../contracts/ProfileRegistry.json" // Assuming you have ABI
import TokenBoundAccountABI from "../contracts/TokenBoundAccount.json" // Assuming you have ABI

const getProvider = () => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum)
  }
  // Fallback for server-side or if no wallet is connected
  // You might want to use a static provider like AlchemyProvider here
  return null
}

const getSigner = async () => {
  const provider = getProvider()
  if (provider) {
    return provider.getSigner()
  }
  return null
}

export const getProfileRegistryContract = async () => {
  const signer = await getSigner()
  if (!signer) return null

  const contractAddress = process.env.NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS
  if (!contractAddress) {
    console.error("NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS is not set.")
    return null
  }

  return new ethers.Contract(contractAddress, ProfileRegistryABI.abi, signer)
}

export const getTokenBoundAccountContract = async (accountAddress: string) => {
  const signer = await getSigner()
  if (!signer) return null

  return new ethers.Contract(accountAddress, TokenBoundAccountABI.abi, signer)
}

// Helper to get contract instance for read-only operations without a signer
export const getProfileRegistryContractReadOnly = () => {
  const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ) // Use Alchemy for read-only
  const contractAddress = process.env.NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS
  if (!contractAddress) {
    console.error("NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS is not set.")
    return null
  }
  return new ethers.Contract(contractAddress, ProfileRegistryABI.abi, provider)
}
