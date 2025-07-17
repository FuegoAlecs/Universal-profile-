import { ethers } from "ethers"
import ProfileRegistryABI from "./abis/ProfileRegistry.json"
import TokenBoundAccountABI from "./abis/TokenBoundAccount.json"

export class ContractService {
  private provider: ethers.providers.JsonRpcProvider
  private profileRegistry: ethers.Contract
  private signer?: ethers.Signer

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
    this.profileRegistry = new ethers.Contract(
      process.env.NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS!,
      ProfileRegistryABI,
      this.provider,
    )
  }

  setSigner(signer: ethers.Signer) {
    this.signer = signer
    this.profileRegistry = this.profileRegistry.connect(signer)
  }

  // Profile Registry functions
  async createProfile(
    metadataURI: string,
    initialWallets: string[] = [],
    chainIds: number[] = [],
  ): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error("Signer not set")

    const fee = ethers.utils.parseEther("0.001")
    return await this.profileRegistry.createProfile(metadataURI, initialWallets, chainIds, {
      value: fee,
    })
  }

  async linkWallet(
    profileId: number,
    walletAddress: string,
    chainId: number,
    signature: string,
  ): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error("Signer not set")

    const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

    return await this.profileRegistry.linkCrossChainWallet(profileId, walletAddress, chainId, deadline, signature)
  }

  async linkSocialAccount(profileId: number, platform: string, handle: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error("Signer not set")

    return await this.profileRegistry.linkSocialAccount(profileId, platform, handle)
  }

  async getProfile(profileId: number) {
    return await this.profileRegistry.getProfile(profileId)
  }

  async getLinkedWallets(profileId: number): Promise<string[]> {
    return await this.profileRegistry.getLinkedWallets(profileId)
  }

  async getSocialLink(profileId: number, platform: string): Promise<string> {
    return await this.profileRegistry.getSocialLink(profileId, platform)
  }

  // Token Bound Account functions
  getTokenBoundAccount(profileId: number): ethers.Contract {
    // Calculate deterministic address for Token Bound Account
    const accountAddress = this.calculateTokenBoundAccountAddress(profileId)
    return new ethers.Contract(accountAddress, TokenBoundAccountABI, this.provider)
  }

  private calculateTokenBoundAccountAddress(profileId: number): string {
    // Simplified - in production, use proper ERC-6551 registry
    const salt = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "address", "uint256"],
        [1, this.profileRegistry.address, profileId],
      ),
    )

    return ethers.utils.getCreate2Address(
      process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS!,
      salt,
      ethers.utils.keccak256("0x"), // Implementation bytecode hash
    )
  }

  // Gas estimation helpers
  async estimateCreateProfileGas(
    metadataURI: string,
    initialWallets: string[] = [],
    chainIds: number[] = [],
  ): Promise<ethers.BigNumber> {
    const fee = ethers.utils.parseEther("0.001")
    return await this.profileRegistry.estimateGas.createProfile(metadataURI, initialWallets, chainIds, {
      value: fee,
    })
  }

  async estimateLinkWalletGas(
    profileId: number,
    walletAddress: string,
    chainId: number,
    signature: string,
  ): Promise<ethers.BigNumber> {
    const deadline = Math.floor(Date.now() / 1000) + 3600
    return await this.profileRegistry.estimateGas.linkCrossChainWallet(
      profileId,
      walletAddress,
      chainId,
      deadline,
      signature,
    )
  }
}

export const contractService = new ContractService()
