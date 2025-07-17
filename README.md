# Universal Profile Card

This project aims to create a decentralized universal profile card, allowing users to showcase their on-chain identity, NFTs, and activity.

## Features

- **Wallet Connection**: Connect your Ethereum wallet (e.g., MetaMask) to view your profile.
- **Dynamic Profile Page**: A dedicated page for each wallet address (`/profile/[address]`) displaying:
    - Profile Header (address, ENS name if available)
    - Social Links (placeholder for now)
    - Wallet Portfolio (token balances)
    - NFT Gallery (NFTs owned by the address)
    - Activity Feed (recent on-chain transactions)
- **NFT Detail Modal**: View detailed information about individual NFTs.
- **Profile Card Generation**: Generate a shareable image of your profile card.
- **Social Sharing**: Share your profile card on Twitter.
- **IPFS Upload**: Upload your generated profile card image to Pinata (IPFS).
- **Profile NFT Minting**: Mint your profile as an ERC-721 NFT on a testnet.

## Getting Started

### 1. Environment Variables

Create a `.env` file in the root of your project and add the following:

\`\`\`
NEXT_PUBLIC_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS=YOUR_PROFILE_REGISTRY_CONTRACT_ADDRESS
NEXT_PUBLIC_TOKEN_BOUND_ACCOUNT_ADDRESS=YOUR_TOKEN_BOUND_ACCOUNT_CONTRACT_ADDRESS
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=YOUR_PROFILE_NFT_CONTRACT_ADDRESS
PINATA_API_KEY=YOUR_PINATA_API_KEY
PINATA_SECRET_API_KEY=YOUR_PINATA_SECRET_API_KEY
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
\`\`\`

-   **`NEXT_PUBLIC_ALCHEMY_API_KEY`**: Get this from [Alchemy](https://www.alchemy.com/).
-   **`NEXT_PUBLIC_PROFILE_REGISTRY_ADDRESS`**: The address of your deployed `ProfileRegistry.sol` contract.
-   **`NEXT_PUBLIC_TOKEN_BOUND_ACCOUNT_ADDRESS`**: The address of your deployed `TokenBoundAccount.sol` contract.
-   **`NEXT_PUBLIC_PROFILE_NFT_ADDRESS`**: The address of your deployed `ProfileNFT.sol` contract.
-   **`PINATA_API_KEY`** and **`PINATA_SECRET_API_KEY`**: Get these from [Pinata](https://www.pinata.cloud/).
-   **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`**: Get this from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Deploy Smart Contracts

This project uses Hardhat for smart contract development.

1.  **Install Hardhat dependencies**:
    \`\`\`bash
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    \`\`\`
2.  **Compile contracts**:
    \`\`\`bash
    npx hardhat compile
    \`\`\`
3.  **Deploy contracts**:
    First, ensure your `hardhat.config.js` is configured for your desired testnet (e.g., Sepolia) and has a private key for deployment.
    \`\`\`javascript
    // hardhat.config.js
    require("@nomicfoundation/hardhat-toolbox");
    require("dotenv").config();

    module.exports = {
      solidity: "0.8.20",
      networks: {
        sepolia: {
          url: process.env.ALCHEMY_SEPOLIA_URL || "", // Get from Alchemy
          accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        },
      },
      etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY, // Optional, for contract verification
      },
    };
    \`\`\`
    Then, deploy:
    \`\`\`bash
    npx hardhat run scripts/deploy.js --network sepolia
    \`\`\`
    Update your `.env` file with the deployed contract addresses.

### 4. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
-   `components/`: Reusable React components (including shadcn/ui components).
-   `contracts/`: Solidity smart contracts (`ProfileRegistry.sol`, `TokenBoundAccount.sol`, `ProfileNFT.sol`).
-   `hooks/`: Custom React hooks for data fetching and logic.
-   `lib/`: Utility functions and service integrations (Alchemy, Pinata, Redis, Contract interactions).
-   `public/`: Static assets.
-   `styles/`: Global CSS.
-   `types/`: TypeScript type definitions.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
