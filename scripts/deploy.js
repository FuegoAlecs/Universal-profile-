const hre = require("hardhat")

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)

  const ProfileRegistry = await hre.ethers.getContractFactory("ProfileRegistry")
  const profileRegistry = await ProfileRegistry.deploy(deployer.address)
  await profileRegistry.waitForDeployment()
  console.log("ProfileRegistry deployed to:", profileRegistry.target)

  const TokenBoundAccount = await hre.ethers.getContractFactory("TokenBoundAccount")
  // Example: Deploying TokenBoundAccount with a dummy token contract and ID
  // In a real scenario, you would use actual deployed token contract address and ID
  const tokenBoundAccount = await TokenBoundAccount.deploy(
    "0x0000000000000000000000000000000000000001", // Placeholder for a token contract address
    1, // Placeholder for a token ID
    deployer.address,
  )
  await tokenBoundAccount.waitForDeployment()
  console.log("TokenBoundAccount deployed to:", tokenBoundAccount.target)

  const ProfileNFT = await hre.ethers.getContractFactory("ProfileNFT")
  const profileNFT = await ProfileNFT.deploy(deployer.address)
  await profileNFT.waitForDeployment()
  console.log("ProfileNFT deployed to:", profileNFT.target)

  console.log("Deployment complete!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
