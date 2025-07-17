import { ethers } from "ethers"
import ProfileRegistryABI from "../contracts/ProfileRegistry.json"
import TokenBoundAccountABI from "../contracts/TokenBoundAccount.json"
import ProfileNFTABI from "../contracts/ProfileNFT.json" // Import the new ABI

const PROFILE_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS || ""
const TOKEN_BOUND_ACCOUNT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_BOUND_ACCOUNT_ADDRESS || ""
const PROFILE_NFT_ADDRESS = process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS || ""

const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  // Fallback for server-side or environments without window.ethereum
  // You might want to configure a default RPC provider here for server-side operations
  // For client-side, this should ideally not be reached if wallet is connected
  return null
}

const getSigner = async () => {
  const provider = getProvider()
  if (!provider) {
    throw new Error("No Ethereum provider found. Please connect your wallet.")
  }
  return provider.getSigner()
}

export const getProfileRegistryContract = async () => {
  const signer = await getSigner()
  return new ethers.Contract(PROFILE_REGISTRY_ADDRESS, ProfileRegistryABI.abi, signer)
}

export const getTokenBoundAccountContract = async () => {
  const signer = await getSigner()
  return new ethers.Contract(TOKEN_BOUND_ACCOUNT_ADDRESS, TokenBoundAccountABI.abi, signer)
}

export const getProfileNFTContract = async () => {
  const signer = await getSigner()
  return new ethers.Contract(PROFILE_NFT_ADDRESS, ProfileNFTABI.abi, signer)
}

// Helper to get contract instance for read-only operations without a signer
export const getProfileRegistryContractReadOnly = () => {
  const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  ) // Use Alchemy for read-only
  return new ethers.Contract(PROFILE_REGISTRY_ADDRESS, ProfileRegistryABI.abi, provider)
}

export const getProfileNFTContractReadOnly = () => {
  const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  )
  return new ethers.Contract(PROFILE_NFT_ADDRESS, ProfileNFTABI.abi, provider)
}

export const registerProfile = async (name: string, bio: string, profileImageUri: string) => {
  const contract = await getProfileRegistryContract()
  const tx = await contract.registerProfile(name, bio, profileImageUri)
  await tx.wait()
  return tx
}

export const getProfile = async (address: string) => {
  const contract = await getProfileRegistryContract()
  return contract.getProfile(address)
}

export const mintProfileNFT = async (toAddress: string, tokenURI: string) => {
  const contract = await getProfileNFTContract()
  const tx = await contract.safeMint(toAddress, tokenURI)
  await tx.wait()
  return tx
}

// Add more contract interaction functions as needed
