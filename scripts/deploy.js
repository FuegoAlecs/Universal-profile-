const { ethers } = require("hardhat")

async function main() {
  const hre = require("hardhat")
  const network = hre.network
  console.log("Deploying Universal Profile contracts...")

  // Deploy ProfileRegistry
  const ProfileRegistry = await ethers.getContractFactory("ProfileRegistry")
  const profileRegistry = await ProfileRegistry.deploy()
  await profileRegistry.deployed()

  console.log("ProfileRegistry deployed to:", profileRegistry.address)

  // Deploy TokenBoundAccount implementation
  const TokenBoundAccount = await ethers.getContractFactory("TokenBoundAccount")
  const tokenBoundAccount = await TokenBoundAccount.deploy()
  await tokenBoundAccount.deployed()

  console.log("TokenBoundAccount deployed to:", tokenBoundAccount.address)

  // Verify contracts on Etherscan
  if (network.name !== "hardhat") {
    console.log("Waiting for block confirmations...")
    await profileRegistry.deployTransaction.wait(6)
    await tokenBoundAccount.deployTransaction.wait(6)

    console.log("Verifying contracts...")

    try {
      await hre.run("verify:verify", {
        address: profileRegistry.address,
        constructorArguments: [],
      })
    } catch (e) {
      console.log("ProfileRegistry verification failed:", e.message)
    }

    try {
      await hre.run("verify:verify", {
        address: tokenBoundAccount.address,
        constructorArguments: [],
      })
    } catch (e) {
      console.log("TokenBoundAccount verification failed:", e.message)
    }
  }

  // Save deployment addresses
  const fs = require("fs")
  const deploymentInfo = {
    network: network.name,
    profileRegistry: profileRegistry.address,
    tokenBoundAccount: tokenBoundAccount.address,
    deployedAt: new Date().toISOString(),
  }

  fs.writeFileSync(`deployments/${network.name}.json`, JSON.stringify(deploymentInfo, null, 2))

  console.log("Deployment complete!")
  console.log("Deployment info saved to:", `deployments/${network.name}.json`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
