const hre = require("hardhat")

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)

  const ProfileRegistry = await hre.ethers.getContractFactory("ProfileRegistry")
  const profileRegistry = await ProfileRegistry.deploy(deployer.address)

  await profileRegistry.waitForDeployment()

  console.log("ProfileRegistry deployed to:", profileRegistry.target)

  // You would typically deploy an ERC6551 Registry here if you're not using an existing one.
  // For this example, we'll assume a standard ERC6551 Registry address or mock it.
  // If you have a specific ERC6551 Registry contract to deploy:
  // const ERC6551Registry = await hre.ethers.getContractFactory("ERC6551Registry");
  // const erc6551Registry = await ERC6551Registry.deploy();
  // await erc6551Registry.waitForDeployment();
  // console.log("ERC6551Registry deployed to:", erc6551Registry.target);

  // For now, let's just log a placeholder for the ERC6551 Registry
  console.log("ERC6551 Registry (placeholder): 0xYourERC6551RegistryAddressHere")

  // Save contract addresses to a file or update .env
  // For example, you can write them to a JSON file
  const fs = require("fs")
  const contractsDir = __dirname + "/../contracts"
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }
  fs.writeFileSync(
    contractsDir + "/ProfileRegistry.json",
    JSON.stringify({ address: profileRegistry.target, abi: ProfileRegistry.interface.formatJson() }, undefined, 2),
  )
  // If you deployed ERC6551Registry, save its address and ABI too
  // fs.writeFileSync(
  //   contractsDir + '/ERC6551Registry.json',
  //   JSON.stringify({ address: erc6551Registry.target, abi: ERC6551Registry.interface.formatJson() }, undefined, 2)
  // );

  console.log("Deployment finished. Update your .env with the deployed addresses.")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
